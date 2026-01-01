import { NextResponse } from "next/server"
import { sql, type ExcelRow } from "@/lib/db"
import * as XLSX from "xlsx"
import { ensureTables } from "@/lib/db-schema"
import { validateExcelStructure } from "@/lib/upload-utils"
import { processNaturaBatch, processOriflameBatch, processOffcorsBatch } from "@/lib/upload-service"

export async function GET() {
  try {
    await ensureTables()

    const history = await sql`
      SELECT * FROM upload_batches 
      ORDER BY uploaded_at DESC 
      LIMIT 50
    `

    return NextResponse.json(history)
  } catch (error) {
    console.error("Error fetching upload history:", error)
    return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await ensureTables()

    const formData = await request.formData()
    const file = formData.get("file") as File
    const uploadedBy = (formData.get("uploadedBy") as string) || "Sistema"
    const cliente = (formData.get("cliente")?.toString() || "Natura").trim()
    const clienteLower = cliente.toLowerCase()

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó archivo" }, { status: 400 })
    }

    // Create batch record
    const [batch] = await sql`
      INSERT INTO upload_batches (filename, uploaded_by, status)
      VALUES (${file.name}, ${uploadedBy}, 'processing')
      RETURNING id
    `
    const batchId = batch.id

    try {
      // Validate file type
      const validTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ]

      if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
        throw new Error("Tipo de archivo no válido. Use Excel (.xlsx, .xls) o CSV")
      }

      // Read file
      const buffer = await file.arrayBuffer()
      const workbook = XLSX.read(buffer, { type: "buffer", cellDates: true })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]
      const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet)

      if (rows.length === 0) {
        throw new Error("El archivo está vacío")
      }

      console.log(`Processing upload for client: '${cliente}'`)

      // Validate Excel structure
      const excelHeaders = rows.length > 0 ? Object.keys(rows[0]) : []
      const structureValidation = validateExcelStructure(excelHeaders, cliente)

      if (!structureValidation.valid) {
        await sql`UPDATE upload_batches SET status = 'failed', error_rows = 1 WHERE id = ${batchId}`
        return NextResponse.json({
          success: false,
          batchId,
          summary: {
            totalRows: rows.length,
            insertedRows: 0,
            duplicateRows: 0,
            errorRows: rows.length,
            errors: [structureValidation.error || "Estructura de archivo inválida"],
            detectedHeaders: structureValidation.detectedHeaders
          }
        }, { status: 400 })
      }

      // Process in chunks
      const CHUNK_SIZE = 500
      let insertedRows = 0
      let updatedRows = 0
      let errorRows = 0
      const errors: string[] = []

      const chunks = []
      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        chunks.push(rows.slice(i, i + CHUNK_SIZE))
      }

      for (const chunk of chunks) {
        try {
          let result
          if (clienteLower === "oriflame") {
            result = await processOriflameBatch(chunk, cliente)
          } else if (clienteLower === "offcors") {
            result = await processOffcorsBatch(chunk, cliente)
          } else {
            result = await processNaturaBatch(chunk, cliente)
          }
          insertedRows += result.inserted
          updatedRows += result.updated
        } catch (err) {
          console.error("Error processing chunk:", err)
          errorRows += chunk.length
          errors.push(err instanceof Error ? err.message : "Error procesando bloque")
        }
      }

      // Update batch status
      await sql`
        UPDATE upload_batches 
        SET 
          total_rows = ${rows.length},
          inserted_rows = ${insertedRows},
          duplicate_rows = ${0}, -- Logic changed, duplicates are effectively updates or ignores
          error_rows = ${errorRows},
          status = ${errorRows > 0 && insertedRows === 0 ? 'failed' : 'completed'}
        WHERE id = ${batchId}
      `

      return NextResponse.json({
        success: true,
        batchId,
        summary: {
          totalRows: rows.length,
          insertedRows,
          updatedRows,
          errorRows,
          errors: errors.slice(0, 10),
          detectedHeaders: structureValidation.detectedHeaders
        },
      })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      await sql`UPDATE upload_batches SET status = 'failed', error_rows = total_rows WHERE id = ${batchId}`
      throw err
    }

  } catch (error) {
    console.error("Error processing upload:", error)
    return NextResponse.json(
      { error: "Error al procesar archivo", details: error instanceof Error ? error.message : "Error desconocido" },
      { status: 500 }
    )
  }
}

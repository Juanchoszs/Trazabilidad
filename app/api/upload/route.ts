import { NextResponse } from "next/server"
import { sql, type ExcelRow } from "@/lib/db"
import * as XLSX from "xlsx"
import { ensureTables } from "@/lib/db-schema"
import { validateExcelStructure, mapRemesasRow, mapOriflameRow, mapOffcorsRow } from "@/lib/upload-utils"

export async function GET() {
  try {
    // Only need upload_batches here really, but good to be safe
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

      let insertedRows = 0
      let duplicateRows = 0
      let errorRows = 0
      const errors: string[] = []
      
      const cliente = (formData.get("cliente")?.toString() || "Natura").trim()
      const clienteLower = cliente.toLowerCase()
      console.log(`Processing upload for client: '${cliente}'`)

      // Validate Excel structure matches expected format for the company
      const excelHeaders = rows.length > 0 ? Object.keys(rows[0]) : []
      const structureValidation = validateExcelStructure(excelHeaders, cliente)
      
      if (!structureValidation.valid) {
        // Update batch as failed
        await sql`
          UPDATE upload_batches 
          SET status = 'failed', error_rows = 1
          WHERE id = ${batchId}
        `
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

      // Process in chunks to avoid timeouts and memory issues
      const CHUNK_SIZE = 500
      
      const chunks = []
      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        chunks.push(rows.slice(i, i + CHUNK_SIZE))
      }

      for (const chunk of chunks) {
        const valuesToInsert: any[] = []
        
        // Prepare chunk data
        for (let j = 0; j < chunk.length; j++) {
          const row = chunk[j]
          const originalIndex = j // relative to chunk
          
          try {
            let mappedRow: any
            if (clienteLower === "oriflame") {
              mappedRow = mapOriflameRow(row)
            } else if (clienteLower === "offcors") {
              mappedRow = mapOffcorsRow(row)
            } else {
              mappedRow = mapRemesasRow(row)
            }

            // Check for required fields (different for each client)
            if (clienteLower === "oriflame") {
              // ORIFLAME uses numero_pedido
              if (!(mappedRow as any).numero_pedido && !(mappedRow as any).guia) {
                errorRows++
                errors.push(`Fila en bloque: Número Pedido y Guía están vacíos`)
                continue
              }
            } else if (clienteLower === "offcors") {
              // Offcors uses numero_guia_rym or no_guia_hermeco
              if (!mappedRow.numero_guia_rym && !mappedRow.no_guia_hermeco) {
                errorRows++
                errors.push(`Fila en bloque: Guía RYM y Guía Hermeco están vacíos`)
                continue
              }
            } else {
              // Natura uses pedido
              if (!mappedRow.pedido && !mappedRow.guia) {
                errorRows++
                errors.push(`Fila en bloque: Pedido y Guía están vacíos`)
                continue
              }
            }
            
            valuesToInsert.push({
              ...mappedRow,
              cliente: cliente, // Add client column
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            
          } catch (err) {
            errorRows++
            errors.push(`Error procesando fila en bloque`)
          }
        }
        
        // Bulk insert chunk using JSON
        if (valuesToInsert.length > 0) {
          try {
            // Use json_populate_recordset for efficient bulk insert without query construction issues
            const jsonState = JSON.stringify(valuesToInsert)
            
            let resultRows = []
            if (clienteLower === "natura" || clienteLower === "remesas y mensajes") {
              // Natura -> natura_shipments
              resultRows = await sql`
                INSERT INTO natura_shipments (
                  transportadora, fecha_despacho, pedido, guia, estado, fecha, novedad, 
                  pe, cod_cn, nombre_cn, departamento, ciudad, direccion, telefono, cliente
                )
                SELECT 
                  transportadora, fecha_despacho, pedido, guia, estado, fecha, novedad, 
                  pe, cod_cn, nombre_cn, departamento, ciudad, direccion, telefono, cliente
                FROM json_populate_recordset(null::natura_shipments, ${jsonState}::json)
                ON CONFLICT (pedido, guia) DO NOTHING
                RETURNING id
              `
            } else if (clienteLower === "offcors") {
               // Offcors -> offcors_shipments
               resultRows = await sql`
                INSERT INTO offcors_shipments (
                  fecha, no_cierre_despacho, no_guia_hermeco, destinatario, direccion, 
                  telefono, ciudad, departamento, nro_entrega, cedula_cliente, 
                  unidad_embalaje, canal, tipo_embalaje, novedad_despacho, 
                  fecha_despacho, numero_guia_rym, fecha_entrega, estado, 
                  guia_subida_rym, novedad_entrega, novedad_1, novedad_2, cliente
                )
                SELECT 
                  fecha, no_cierre_despacho, no_guia_hermeco, destinatario, direccion, 
                  telefono, ciudad, departamento, nro_entrega, cedula_cliente, 
                  unidad_embalaje, canal, tipo_embalaje, novedad_despacho, 
                  fecha_despacho, numero_guia_rym, fecha_entrega, estado, 
                  guia_subida_rym, novedad_entrega, novedad_1, novedad_2, cliente
                FROM json_populate_recordset(null::offcors_shipments, ${jsonState}::json)
                ON CONFLICT (numero_guia_rym, nro_entrega) DO NOTHING
                RETURNING id
              `
            } else {
               // Oriflame -> oriflame_shipments
               resultRows = await sql`
                INSERT INTO oriflame_shipments (
                  guia, destinatario, numero_pedido, codigo_empresaria, direccion, 
                  telefono, ciudad, departamento, fecha_ingreso, fecha_entrega, 
                  fecha_promesa, dias_promesa, estado, novedad, novedad2, cliente
                )
                SELECT 
                  guia, destinatario, numero_pedido, codigo_empresaria, direccion, 
                  telefono, ciudad, departamento, fecha_ingreso, fecha_entrega, 
                  fecha_promesa, dias_promesa, estado, novedad, novedad2, cliente
                FROM json_populate_recordset(null::oriflame_shipments, ${jsonState}::json)
                ON CONFLICT (numero_pedido, guia) DO NOTHING
                RETURNING id
              `
            }
             
             // Count successful inserts
             insertedRows += resultRows.length
             // Duplicates are roughly the diff (assuming no other errors)
             duplicateRows += (valuesToInsert.length - resultRows.length)

          } catch (chunkErr) {
            console.error("Error inserting chunk:", chunkErr)
            errorRows += valuesToInsert.length
            errors.push(`Error insertando bloque de ${valuesToInsert.length} registros: ${chunkErr instanceof Error ? chunkErr.message : "Error SQL"}`)
          }
        }
      }

      // Update batch status
      await sql`
        UPDATE upload_batches 
        SET 
          total_rows = ${rows.length},
          inserted_rows = ${insertedRows},
          duplicate_rows = ${duplicateRows},
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
          duplicateRows,
          errorRows,
          errors: errors.slice(0, 10),
          detectedHeaders: rows.length > 0 ? Object.keys(rows[0]).slice(0, 20) : [], 
        },
      })

    } catch (err) {
       // Update batch as failed
       const errorMessage = err instanceof Error ? err.message : "Error desconocido"
       await sql`
        UPDATE upload_batches 
        SET status = 'failed', error_rows = total_rows
        WHERE id = ${batchId}
      `
      throw err
    }

  } catch (error) {
    console.error("Error processing upload:", error)
    return NextResponse.json(
      {
        error: "Error al procesar archivo",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { sql, type ExcelRow } from "@/lib/db"
import * as XLSX from "xlsx"

// Ensure upload_batches table exists
async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS upload_batches (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      uploaded_by VARCHAR(100),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      total_rows INTEGER DEFAULT 0,
      inserted_rows INTEGER DEFAULT 0,
      duplicate_rows INTEGER DEFAULT 0,
      error_rows INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'processing'
    );
  `
}

// Parse date from Excel - handles multiple formats
function parseDate(value: string | Date | number | undefined): string | null {
  if (!value) return null

  if (value instanceof Date) {
    return value.toISOString().split("T")[0]
  }

  if (typeof value === "number") {
    // Excel serial date
    const date = new Date((value - 25569) * 86400 * 1000)
    return date.toISOString().split("T")[0]
  }

  if (typeof value === "string") {
    // Clean whitespace
    value = value.trim()
    
    // Try parsing DD/MM/YYYY format
    const parts = value.split("/")
    if (parts.length === 3) {
      const [day, month, year] = parts
      const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`)
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0]
      }
    }
    // Try other formats
    const parsed = new Date(value)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split("T")[0]
    }
  }

  return null
}

export async function GET() {
  try {
    await ensureTable()
    
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
    await ensureTable()
    
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
      console.log(`Processing upload for client: '${cliente}'`)

    // Helper functions for mapping
    const mapRemesasRow = (row: any) => {
       // Normalize header keys
        const normalizedRow: Record<string, any> = {}
        Object.keys(row).forEach(key => {
          const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '')
          normalizedRow[cleanKey] = row[key]
          if (!normalizedRow[key]) normalizedRow[key] = row[key]
        })

        const getValue = (...keys: string[]) => {
          for (const key of keys) {
            const cleanKey = key.toLowerCase().replace(/\s+/g, '')
            if (normalizedRow[cleanKey] !== undefined) return normalizedRow[cleanKey]
          }
          return undefined
        }

        return {
          transportadora: getValue("transportadora", "transp", "empresa")?.toString() || null,
          fecha_despacho: parseDate(getValue("fecha despacho", "fechadespacho", "f.despacho", "fecha")),
          pedido: getValue("pedido", "no. pedido", "numero pedido")?.toString() || "",
          guia: getValue("guia", "no. guia", "numero guia")?.toString() || "",
          estado: getValue("estado", "status", "situacion")?.toString() || "",
          fecha: parseDate(getValue("fecha", "fecha estado", "fecha status")),
          novedad: getValue("novedad", "observacion", "notas")?.toString() || null,
          pe: getValue("pe", "planificado", "entrega planificada")?.toString() || null,
          cod_cn: getValue("cod cn", "codigo cn", "cod. cn")?.toString() || null,
          nombre_cn: getValue("nombre cn", "nombre cliente", "cliente")?.toString() || null,
          departamento: getValue("departamento", "depto", "estado/provincia")?.toString() || null,
          ciudad: getValue("ciudad", "municipio")?.toString() || null,
          direccion: getValue("direccion", "dir", "domicilio")?.toString() || null,
          telefono: getValue("telefono", "celular", "tel")?.toString() || null,
        }
    }

    const mapOriflameRow = (row: any) => {
        // Normalize header keys
        const normalizedRow: Record<string, any> = {}
        Object.keys(row).forEach(key => {
          const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '')
          normalizedRow[cleanKey] = row[key]
          if (!normalizedRow[key]) normalizedRow[key] = row[key]
        })

        const getValue = (...keys: string[]) => {
          for (const key of keys) {
            const cleanKey = key.toLowerCase().replace(/\s+/g, '')
            if (normalizedRow[cleanKey] !== undefined) return normalizedRow[cleanKey]
          }
          return undefined
        }

        return {
          transportadora: "Oriflame", // Default value as it's not present in file
          fecha_despacho: parseDate(getValue("fecha ingreso a r&m", "fecha ingreso", "fecha ingreso a ram")),
          pedido: getValue("número pedido", "numero pedido", "pedido")?.toString() || "",
          guia: getValue("guia", "track id")?.toString() || "",
          estado: getValue("estado", "status")?.toString() || "",
          fecha: parseDate(getValue("fecha de entrega", "fecha entrega")),
          novedad: getValue("novedad", "observacion", "novedad 1")?.toString() || null,
          novedad2: getValue("novedad 2", "novedad2", "segunda novedad")?.toString() || null,
          pe: getValue("dias promesa", "promesa")?.toString() || null,
          cod_cn: getValue("código empresaria/o", "codigo empresaria/o", "codigo empresario")?.toString() || null,
          nombre_cn: getValue("destinatario", "nombre")?.toString() || null,
          departamento: getValue("departamento")?.toString() || null,
          ciudad: getValue("ciudad")?.toString() || null,
          direccion: getValue("dirección", "direccion")?.toString() || null,
          telefono: getValue("telefono")?.toString() || null,
        }
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
          const originalIndex = j // originalIndex is relative to the chunk, not the whole file
          
          try {
            let mappedRow: ReturnType<typeof mapRemesasRow> // Type is the same for both map functions
            if (cliente.toLowerCase() === "oriflame") {
              mappedRow = mapOriflameRow(row)
            } else {
              mappedRow = mapRemesasRow(row)
            }

            // Check for required fields
            if (!mappedRow.pedido && !mappedRow.guia) {
              errorRows++
              errors.push(`Fila ${originalIndex + 2}: Pedido y Guía están vacíos`)
              continue
            }
            
            valuesToInsert.push({
              ...mappedRow,
              cliente: cliente, // Add client column
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            
          } catch (err) {
            errorRows++
            errors.push(`Fila ${originalIndex + 2}: Error procesando datos`)
          }
        }
        
        // Bulk insert chunk using JSON
        if (valuesToInsert.length > 0) {
          try {
            // Use json_populate_recordset for efficient bulk insert without query construction issues
            const jsonState = JSON.stringify(valuesToInsert)
            
            let resultRows = []
            if (cliente.toLowerCase() === "natura" || cliente.toLowerCase() === "remesas y mensajes") {
              // Natura -> natura_shipments (No novedad2)
              resultRows = await sql`
                INSERT INTO natura_shipments (
                  transportadora,
                  fecha_despacho,
                  pedido,
                  guia,
                  estado,
                  fecha,
                  novedad,
                  pe,
                  cod_cn,
                  nombre_cn,
                  departamento,
                  ciudad,
                  direccion,
                  telefono,
                  cliente
                )
                SELECT 
                  transportadora,
                  fecha_despacho,
                  pedido,
                  guia,
                  estado,
                  fecha,
                  novedad,
                  pe,
                  cod_cn,
                  nombre_cn,
                  departamento,
                  ciudad,
                  direccion,
                  telefono,
                  cliente
                FROM json_populate_recordset(null::natura_shipments, ${jsonState}::json)
                ON CONFLICT (pedido, guia) DO NOTHING
                RETURNING id
              `
            } else {
               // Oriflame -> shipments (With novedad2)
               resultRows = await sql`
                INSERT INTO shipments (
                  transportadora,
                  fecha_despacho,
                  pedido,
                  guia,
                  estado,
                  fecha,
                  novedad,
                  pe,
                  cod_cn,
                  nombre_cn,
                  departamento,
                  ciudad,
                  direccion,
                  telefono,
                  cliente,
                  novedad2
                )
                SELECT 
                  transportadora,
                  fecha_despacho,
                  pedido,
                  guia,
                  estado,
                  fecha,
                  novedad,
                  pe,
                  cod_cn,
                  nombre_cn,
                  departamento,
                  ciudad,
                  direccion,
                  telefono,
                  cliente,
                  novedad2
                FROM json_populate_recordset(null::shipments, ${jsonState}::json)
                ON CONFLICT (pedido, guia) DO NOTHING
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
          detectedHeaders: rows.length > 0 ? Object.keys(rows[0]).slice(0, 20) : [], // Return first 20 headers for debug
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

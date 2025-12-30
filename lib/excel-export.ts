import * as XLSX from "xlsx-js-style"

export interface ExportColumn {
  header: string
  key: string
  width?: number
  format?: (value: any) => any
}

interface ExcelExportOptions {
  applyOriflameStyles?: boolean
  applyNaturaStyles?: boolean
}

export const exportToExcel = (
  filename: string,
  data: any[],
  columns: ExportColumn[],
  options?: ExcelExportOptions,
) => {
  // Prepare data - apply formatters
  const processedData = data.map(item => {
    const row: Record<string, any> = {}
    columns.forEach(col => {
      let value = item[col.key]
      if (col.format) {
        value = col.format(item)
      }
      row[col.header] = value
    })
    return row
  })

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(processedData)

  // Set column widths
  const defaultColWidths = columns.map(col => ({
    wch: col.width || Math.max(col.header.length + 2, 10),
  }))
  worksheet["!cols"] = defaultColWidths

  // Apply specific styles for Oriflame or Natura if requested
  if (worksheet["!ref"]) {
    // Apply Oriflame styles if requested
    if (options?.applyOriflameStyles) {
    const range = XLSX.utils.decode_range(worksheet["!ref"])

    // Apply specific column widths in pixels for A..O
    // Index 0..14 correspond to A..O
    const oriflamePx = [
      70,   // A
      220,  // B
      110,  // C
      70,   // D
      290,  // E
      100,  // F
      160,  // G
      110,  // H
      140,  // I
      120,  // J
      120,  // K
      90,   // L
      160,  // M
      170,  // N
      280,  // O
    ]
    const cols: any[] = worksheet["!cols"] || []
    for (let i = 0; i < oriflamePx.length; i++) {
      cols[i] = { ...(cols[i] || {}), wpx: oriflamePx[i] }
    }
    worksheet["!cols"] = cols

    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
        const cell = worksheet[cellRef]
        if (!cell) continue

        cell.s = {
          ...(cell.s || {}),
          font: {
            name: "Aptos Narrow",
            sz: 11,
            color: { rgb: "FF000000" },
          },
        }
      }
    }

    // Header styles: A1:O1 (first row, all defined columns)
    const headerRow = range.s.r
    const totalHeaderCols = columns.length
    for (let col = 0; col < totalHeaderCols; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col })
      const cell = worksheet[cellRef]
      if (!cell) continue

      cell.s = {
        ...(cell.s || {}),
        font: {
          name: "Aptos Narrow",
          sz: 11,
          color: { rgb: "FFFFFFFF" },
        },
        fill: {
          patternType: "solid",
          fgColor: { rgb: "FF7030A0" },
        },
        alignment: {
          vertical: "center",
          horizontal: "center",
          wrapText: true,
        },
      }
    }

      // Row height for header row (~40px)
      const rows: any[] = worksheet["!rows"] || []
      rows[headerRow] = { ...(rows[headerRow] || {}), hpx: 40 }
      worksheet["!rows"] = rows
    }
    
    // Apply Natura styles if requested
    if (options?.applyNaturaStyles) {
      const range = XLSX.utils.decode_range(worksheet["!ref"])
      
      // Set specific column widths in pixels for A..N
      const naturaPx = [
        100,  // A Transportadora
        80,   // B Fecha despacho
        80,   // C Fecha despacho
        80,   // D Guia
        80,   // E Estado
        80,   // F Fecha
        80,   // G Novedad
        80,   // H PE
        110,  // I Cod Cn
        180,  // J Nombre Cn
        80,   // K Departamento
        80,   // L Ciudad
        150,  // M Direccion
        80,   // N Telefono
      ]
      
      const cols: any[] = worksheet["!cols"] || []
      for (let i = 0; i < naturaPx.length; i++) {
        cols[i] = { ...(cols[i] || {}), wpx: naturaPx[i] }
      }
      worksheet["!cols"] = cols
      
      // Apply styles to all cells
      for (let row = range.s.r; row <= range.e.r; row++) {
        for (let col = range.s.c; col <= range.e.c; col++) {
          const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
          const cell = worksheet[cellRef]
          if (!cell) continue
          
          // Default cell style (Calibri 8, black text)
          cell.s = {
            ...(cell.s || {}),
            font: {
              name: "Calibri",
              sz: 8,
              color: { rgb: "FF000000" },
            },
          }
          
          // For header row (A1:N1) - white text on #00B0F0 background
          if (row === range.s.r) {
            cell.s = {
              ...(cell.s || {}),
              font: {
                name: "Calibri",
                sz: 8,
                color: { rgb: "FFFFFFFF" }, // White text
                bold: true,
              },
              fill: {
                patternType: "solid",
                fgColor: { rgb: "FF00B0F0" }, // #00B0F0 background
              },
              alignment: {
                vertical: "center",
                horizontal: "center",
                wrapText: true,
              },
            }
          }
        }
      }
      
      // Header row styles (A1:N1)
      const headerRow = range.s.r
      const totalHeaderCols = Math.min(columns.length, 14) // A-N (14 columns)
      
      for (let col = 0; col < totalHeaderCols; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col })
        const cell = worksheet[cellRef]
        if (!cell) continue
        
        cell.s = {
          ...(cell.s || {}),
          font: {
            name: "Calibri",
            sz: 8,
            color: { rgb: "FFFFFFFF" }, // White text
            bold: true,
          },
          fill: {
            patternType: "solid",
            fgColor: { rgb: "FF00B0F0" }, // #00B0F0 background
          },
          alignment: {
            vertical: "center",
            horizontal: "center",
            wrapText: true,
          },
        }
      }
      
      // Set header row height
      const rows: any[] = worksheet["!rows"] || []
      rows[headerRow] = { ...(rows[headerRow] || {}), hpx: 40 }
      worksheet["!rows"] = rows
    }
  }

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Trazabilidad")

  // Download file
  XLSX.writeFile(workbook, filename)
}

// Helper to format date WITHOUT timezone shift
// Uses UTC to avoid the 1-day offset issue
export const fmtDate = (dateVal: any) => {
  if (!dateVal) return "";
  
  // Handle both Date objects and strings
  const dateObj = typeof dateVal === 'string' ? new Date(dateVal) : dateVal
  
  // Use UTC methods to avoid timezone conversion
  const year = dateObj.getUTCFullYear()
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getUTCDate()).padStart(2, '0')
  
  // Return in DD/MM/YYYY format
  return `${day}/${month}/${year}`
}

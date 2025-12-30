import * as XLSX from "xlsx"

export interface ExportColumn {
  header: string
  key: string
  width?: number
  format?: (value: any) => any
}

interface ExcelExportOptions {
  applyOriflameStyles?: boolean
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
  const colWidths = columns.map(col => ({
    wch: col.width || Math.max(col.header.length + 2, 10),
  }))
  worksheet["!cols"] = colWidths

  // Apply base font (Calibri 8) to all cells when styles are requested (Oriflame)
  if (options?.applyOriflameStyles && worksheet["!ref"]) {
    const range = XLSX.utils.decode_range(worksheet["!ref"])

    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c: col })
        const cell = worksheet[cellRef]
        if (!cell) continue

        cell.s = {
          ...(cell.s || {}),
          font: {
            name: "Calibri",
            sz: 8,
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
          name: "Calibri",
          sz: 8,
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

import * as XLSX from "xlsx"

export interface ExportColumn {
  header: string
  key: string
  width?: number
  format?: (value: any) => any
}

export const exportToExcel = (
  filename: string, 
  data: any[], 
  columns: ExportColumn[]
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
    wch: col.width || Math.max(col.header.length + 2, 10) 
  }))
  worksheet['!cols'] = colWidths

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Trazabilidad")

  // Download file
  XLSX.writeFile(workbook, filename)
}

// Helper to format date
export const fmtDate = (dateVal: any) => {
    if (!dateVal) return "";
    return new Date(dateVal).toLocaleDateString("es-CO");
}

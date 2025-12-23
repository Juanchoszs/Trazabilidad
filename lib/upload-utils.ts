export interface ExcelRow {
  Transportadora?: string
  "Fecha despacho"?: string | Date | number
  Pedido?: string | number
  Guia?: string | number
  Estado?: string
  Fecha?: string | Date | number
  Novedad?: string
  PE?: string | number
  "Cod Cn"?: string | number
  "Nombre Cn"?: string
  Departamento?: string
  Ciudad?: string
  Direccion?: string
  Telefono?: string | number
  [key: string]: any
}

// Parse date from Excel - handles multiple formats
export function parseDate(value: string | Date | number | undefined): string | null {
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

// Expected columns for each company (normalized to lowercase, no spaces for comparison)
const ORIFLAME_EXPECTED_COLUMNS = [
  "destinatario", "número pedido", "código empresaria/o", "dirección",
  "telefono", "ciudad", "departamento", "fecha ingreso a r&m",
  "fecha de entrega", "fecha entrega promesa", "dias promesa",
  "estado", "novedad", "novedad 2"
]

const NATURA_EXPECTED_COLUMNS = [
  "transportadora", "fecha despacho", "pedido", "guia", "estado",
  "fecha", "novedad", "pe", "cod cn", "nombre cn",
  "departamento", "ciudad", "direccion", "telefono"
]

const OFFCORS_EXPECTED_COLUMNS = [
  "fecha", "no_cierre_despacho", "no_guia_hermeco", "destinatario",
  "direccion", "telefono", "ciudad", "departamento", "nro_entrega",
  "cedula_cliente", "unidad_embalaje", "canal", "tipo_embalaje",
  "novedad_despacho", "fecha_despacho", "numero_guia_rym",
  "fecha_entrega", "estado", "guia_subida_rym", "novedad_entrega",
  "novedad_1", "novedad_2"
]

// Validate Excel structure matches expected columns for the company
export function validateExcelStructure(
  headers: string[], 
  empresa: string
): { valid: boolean; error?: string; detectedHeaders: string[] } {
  // Normalize string for comparison: lowercase, remove accents, remove non-alphanumeric (spaces, underscores, punctuation)
  const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "")
  
  const normalizedHeaders = headers.map(h => normalize(h))
  const detectedHeaders = headers.map(h => h.trim())
  
  const expectedColumns = 
    empresa.toLowerCase() === "oriflame" ? ORIFLAME_EXPECTED_COLUMNS :
    empresa.toLowerCase() === "offcors" ? OFFCORS_EXPECTED_COLUMNS :
    NATURA_EXPECTED_COLUMNS
  
  // Check for sufficient matches
  const matchCount = expectedColumns.filter(expected => {
    const normExpected = normalize(expected)
    // strict check on normalized strings
    return normalizedHeaders.some(h => h.includes(normExpected) || normExpected.includes(h))
  }).length
  
  const matchPercentage = expectedColumns.length > 0 ? matchCount / expectedColumns.length : 0
  
  if (matchPercentage < 0.5) {
    const empresaName = empresa.toUpperCase()
    return {
      valid: false,
      error: `El archivo no corresponde a ${empresaName}. La estructura de columnas no coincide. Se esperaban columnas como: ${expectedColumns.slice(0, 5).join(", ")}...`,
      detectedHeaders
    }
  }
  
  return { valid: true, detectedHeaders }
}

export const mapRemesasRow = (row: any) => {
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

export const mapOriflameRow = (row: any) => {
    // Normalize header keys
    const normalizedRow: Record<string, any> = {}
    Object.keys(row).forEach(key => {
      const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '')
      normalizedRow[cleanKey] = row[key]
      // Also keep original key for fallback
      const originalKey = key.trim().toLowerCase()
      if (!normalizedRow[originalKey]) normalizedRow[originalKey] = row[key]
    })

    const getValue = (...keys: string[]) => {
      for (const key of keys) {
        const cleanKey = key.toLowerCase().replace(/\s+/g, '')
        if (normalizedRow[cleanKey] !== undefined) return normalizedRow[cleanKey]
      }
      return undefined
    }

    // Parse dias_promesa as integer
    const diasPromesaRaw = getValue("dias promesa", "diaspromesa", "promesa")
    const diasPromesa = diasPromesaRaw ? parseInt(diasPromesaRaw.toString(), 10) : null

    return {
      guia: getValue("guia", "guía", "track id")?.toString()?.trim() || null,
      destinatario: getValue("destinatario", "nombre", "recipient")?.toString()?.trim() || null,
      numero_pedido: getValue("número pedido", "numero pedido", "numeropedido", "pedido")?.toString()?.trim() || "",
      codigo_empresaria: getValue("código empresaria/o", "codigo empresaria/o", "codigoempresaria/o", "codigo empresario")?.toString()?.trim() || null,
      direccion: getValue("dirección", "direccion", "address")?.toString()?.trim() || null,
      telefono: getValue("telefono", "teléfono", "phone")?.toString()?.trim() || null,
      ciudad: getValue("ciudad", "city")?.toString()?.trim() || null,
      departamento: getValue("departamento", "department")?.toString()?.trim() || null,
      fecha_ingreso: parseDate(getValue("fecha ingreso a r&m", "fechaingresoar&m", "fecha ingreso a ram", "fecha ingreso")),
      fecha_entrega: parseDate(getValue("fecha de entrega", "fechadeentrega", "fecha entrega")),
      fecha_promesa: parseDate(getValue("fecha entrega promesa", "fechaentregapromesa", "fecha promesa")),
      dias_promesa: isNaN(diasPromesa as number) ? null : diasPromesa,
      estado: getValue("estado", "status")?.toString()?.trim() || "PENDIENTE",
      novedad: getValue("novedad", "novedad 1", "observacion")?.toString()?.trim() || null,
      novedad2: getValue("novedad 2", "novedad2", "segunda novedad")?.toString()?.trim() || null,
    }
}

export const mapOffcorsRow = (row: any) => {
    // Normalize header keys: remove accents, lowercase, remove non-alphanumeric
    const normalize = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "")
    
    // Normalize header keys
    const normalizedRow: Record<string, any> = {}
    Object.keys(row).forEach(key => {
      normalizedRow[normalize(key)] = row[key]
    })

    const getValue = (...keys: string[]) => {
      for (const key of keys) {
        const cleanKey = normalize(key)
        if (normalizedRow[cleanKey] !== undefined) return normalizedRow[cleanKey]
      }
      return undefined
    }

    const parseIntVal = (val: any) => val ? parseInt(val.toString().replace(/[^\d]/g, ''), 10) : null
    const parseBigIntVal = (val: any) => val ? val.toString().replace(/[^\d]/g, '') : null

    return {
      fecha: parseDate(getValue("fecha")),
      no_cierre_despacho: parseIntVal(getValue("no_cierre_despacho", "cierre", "nro cierre")),
      no_guia_hermeco: getValue("no_guia_hermeco", "guia hermeco", "guia_hermeco")?.toString() || null,
      destinatario: getValue("destinatario", "nombre")?.toString() || null,
      direccion: getValue("direccion")?.toString() || null,
      telefono: getValue("telefono", "celular")?.toString() || null,
      ciudad: getValue("ciudad")?.toString() || null,
      departamento: getValue("departamento", "depto")?.toString() || null,
      nro_entrega: parseBigIntVal(getValue("nro_entrega", "numero entrega", "entrega")),
      cedula_cliente: getValue("cedula_cliente", "cedula", "nit")?.toString() || null,
      unidad_embalaje: parseIntVal(getValue("unidad_embalaje", "unidades", "embalaje")),
      canal: parseIntVal(getValue("canal")),
      tipo_embalaje: getValue("tipo_embalaje", "tipo embalaje")?.toString() || null,
      novedad_despacho: getValue("novedad_despacho", "novedad despacho")?.toString() || null,
      fecha_despacho: parseDate(getValue("fecha_despacho", "fecha despacho")),
      numero_guia_rym: getValue("numero_guia_rym", "guia rym", "numero guia rym")?.toString() || "",
      fecha_entrega: parseDate(getValue("fecha_entrega", "fecha entrega")),
      estado: getValue("estado")?.toString() || "PENDIENTE",
      guia_subida_rym: getValue("guia_subida_rym", "guia subida rym")?.toString() || "NO",
      novedad_entrega: getValue("novedad_entrega", "novedad entrega")?.toString() || null,
      novedad_1: getValue("novedad_1", "novedad 1")?.toString() || null,
      novedad_2: getValue("novedad_2", "novedad 2")?.toString() || null,
    }
}

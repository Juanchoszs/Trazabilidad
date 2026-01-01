import { neon } from "@neondatabase/serverless"

// Create SQL client
const sql = neon(process.env.DATABASE_URL!)

export interface Shipment {
  id: number
  transportadora: string
  fecha_despacho: string | null
  pedido: string
  guia: string
  estado: string
  fecha: string | null
  novedad: string | null
  novedad2: string | null
  pe: string | null
  cod_cn: string | null
  nombre_cn: string | null
  departamento: string | null
  ciudad: string | null
  direccion: string | null
  telefono: string | null
  cliente: string | null
  created_at: Date
  updated_at: Date
}

export interface ShipmentHistory {
  id: number
  guia: string
  transportadora: string
  estado: string
  ubicacion?: string
  novedad?: string
  created_at: Date
}

export interface DashboardStats {
  total: number
  delivered: number
  failed: number
  returned: number
  lost: number
  in_transit: number
  pending: number
  novedades: number
}

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

export { sql }

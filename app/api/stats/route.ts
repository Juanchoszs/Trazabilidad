import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE UPPER(estado) LIKE '%ENTREGADO%') as entregado,
        COUNT(*) FILTER (WHERE UPPER(estado) LIKE '%FALLIDO%' OR UPPER(estado) LIKE '%RECHAZADO%') as fallido,
        COUNT(*) FILTER (WHERE UPPER(estado) LIKE '%DEVUEL%' OR UPPER(estado) LIKE '%DEVOLUCION%') as devuelto,
        COUNT(*) FILTER (WHERE UPPER(estado) LIKE '%PERDIDO%' OR UPPER(estado) LIKE '%EXTRAVIADO%') as perdido,
        COUNT(*) FILTER (WHERE UPPER(estado) LIKE '%TRANSITO%' OR UPPER(estado) LIKE '%CAMINO%') as en_transito,
        COUNT(*) FILTER (WHERE UPPER(estado) LIKE '%PENDIENTE%' OR estado IS NULL OR estado = '') as pendiente
      FROM shipments
    `

    return NextResponse.json(stats[0])
  } catch (error) {
    console.error("[v0] Error fetching stats:", error)
    return NextResponse.json({ error: "Error al obtener estadísticas" }, { status: 500 })
  }
}

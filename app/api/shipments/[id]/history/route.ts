import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const history = await sql`
      SELECT * FROM shipment_history 
      WHERE shipment_id = ${id}
      ORDER BY modified_at DESC
      LIMIT 50
    `

    return NextResponse.json(history)
  } catch (error) {
    console.error("[v0] Error fetching status history:", error)
    return NextResponse.json({ error: "Error al obtener historial" }, { status: 500 })
  }
}

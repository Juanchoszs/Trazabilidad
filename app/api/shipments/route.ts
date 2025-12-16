import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  try {
    const shipments = await sql`
      SELECT * FROM shipments 
      ORDER BY created_at DESC
    `

    return NextResponse.json(shipments)
  } catch (error) {
    console.error("[v0] Error fetching shipments:", error)
    return NextResponse.json({ error: "Error al obtener envíos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const result = await sql`
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
        telefono
      )
      VALUES (
        ${body.transportadora || "Sin transportadora"},
        ${body.fecha_despacho || null},
        ${body.pedido || ""},
        ${body.guia || ""},
        ${body.estado || "PENDIENTE"},
        ${body.fecha || null},
        ${body.novedad || null},
        ${body.pe || null},
        ${body.cod_cn || null},
        ${body.nombre_cn || null},
        ${body.departamento || null},
        ${body.ciudad || null},
        ${body.direccion || null},
        ${body.telefono || null}
      )
      RETURNING *
    `

    // Create initial history entry
    await sql`
      INSERT INTO shipment_history (shipment_id, campo_modificado, valor_anterior, valor_nuevo, modified_by)
      VALUES (${result[0].id}, 'estado', NULL, ${body.estado || "PENDIENTE"}, 'Manual')
    `

    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating shipment:", error)
    return NextResponse.json({ error: "Error al crear envío" }, { status: 500 })
  }
}

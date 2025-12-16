import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const shipment = await sql`
      SELECT id, transportadora, fecha_despacho, pedido, guia, estado, fecha, novedad, pe, cod_cn, nombre_cn, departamento, ciudad, direccion, telefono, cliente, NULL::text as novedad2, created_at, updated_at 
      FROM natura_shipments WHERE id = ${id}
      UNION ALL
      SELECT * FROM shipments WHERE id = ${id}
    `

    if (shipment.length === 0) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    return NextResponse.json(shipment[0])
  } catch (error) {
    console.error("[v0] Error fetching shipment:", error)
    return NextResponse.json({ error: "Error al obtener envío" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const isNatura = Number(id) >= 1000000

    // Get current shipment
    let currentShipment
    if (isNatura) {
      currentShipment = await sql`SELECT * FROM natura_shipments WHERE id = ${id}`
    } else {
      currentShipment = await sql`SELECT * FROM shipments WHERE id = ${id}`
    }

    if (currentShipment.length === 0) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    const current = currentShipment[0]

    // Track changes for history (Only for shipments table or if separate history exists)
    // Assuming shipment_history is linked to shipments table via FK, we skip for Natura for now unless FK was removed.
    // If FK exists, inserting for ID 1000000+ will fail if not in shipments table.
    // Safe approach: Only track history for legacy table for now, or try/catch.
    if (!isNatura) { 
        const fieldsToTrack = [
          "transportadora", "fecha_despacho", "pedido", "guia", "estado", 
          "fecha", "novedad", "pe", "cod_cn", "nombre_cn", 
          "departamento", "ciudad", "direccion", "telefono"
        ]

        for (const field of fieldsToTrack) {
          if (body[field] !== undefined && body[field] !== current[field]) {
            try {
                await sql`
                  INSERT INTO shipment_history (shipment_id, campo_modificado, valor_anterior, valor_nuevo, modified_by)
                  VALUES (${id}, ${field}, ${current[field]?.toString() || null}, ${body[field]?.toString() || null}, ${body.modified_by || "Usuario"})
                `
            } catch (hErr) {
                console.warn("History tracking failed (likely FK constraint):", hErr)
            }
          }
        }
    }

    let result
    if (isNatura) {
        result = await sql`
          UPDATE natura_shipments 
          SET 
            transportadora = ${body.transportadora !== undefined ? body.transportadora : current.transportadora},
            fecha_despacho = ${body.fecha_despacho !== undefined ? body.fecha_despacho : current.fecha_despacho},
            pedido = ${body.pedido !== undefined ? body.pedido : current.pedido},
            guia = ${body.guia !== undefined ? body.guia : current.guia},
            estado = ${body.estado !== undefined ? body.estado : current.estado},
            fecha = ${body.fecha !== undefined ? body.fecha : current.fecha},
            novedad = ${body.novedad !== undefined ? body.novedad : current.novedad},
            pe = ${body.pe !== undefined ? body.pe : current.pe},
            cod_cn = ${body.cod_cn !== undefined ? body.cod_cn : current.cod_cn},
            nombre_cn = ${body.nombre_cn !== undefined ? body.nombre_cn : current.nombre_cn},
            departamento = ${body.departamento !== undefined ? body.departamento : current.departamento},
            ciudad = ${body.ciudad !== undefined ? body.ciudad : current.ciudad},
            direccion = ${body.direccion !== undefined ? body.direccion : current.direccion},
            telefono = ${body.telefono !== undefined ? body.telefono : current.telefono},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `
    } else {
        result = await sql`
          UPDATE shipments 
          SET 
            transportadora = ${body.transportadora !== undefined ? body.transportadora : current.transportadora},
            fecha_despacho = ${body.fecha_despacho !== undefined ? body.fecha_despacho : current.fecha_despacho},
            pedido = ${body.pedido !== undefined ? body.pedido : current.pedido},
            guia = ${body.guia !== undefined ? body.guia : current.guia},
            estado = ${body.estado !== undefined ? body.estado : current.estado},
            fecha = ${body.fecha !== undefined ? body.fecha : current.fecha},
            novedad = ${body.novedad !== undefined ? body.novedad : current.novedad},
            novedad2 = ${body.novedad2 !== undefined ? body.novedad2 : current.novedad2}, 
            pe = ${body.pe !== undefined ? body.pe : current.pe},
            cod_cn = ${body.cod_cn !== undefined ? body.cod_cn : current.cod_cn},
            nombre_cn = ${body.nombre_cn !== undefined ? body.nombre_cn : current.nombre_cn},
            departamento = ${body.departamento !== undefined ? body.departamento : current.departamento},
            ciudad = ${body.ciudad !== undefined ? body.ciudad : current.ciudad},
            direccion = ${body.direccion !== undefined ? body.direccion : current.direccion},
            telefono = ${body.telefono !== undefined ? body.telefono : current.telefono},
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${id}
          RETURNING *
        `
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating shipment:", error)
    return NextResponse.json({ error: "Error al actualizar envío" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const isNatura = Number(id) >= 1000000
    
    let result
    if (isNatura) {
        result = await sql`DELETE FROM natura_shipments WHERE id = ${id} RETURNING *`
    } else {
        result = await sql`DELETE FROM shipments WHERE id = ${id} RETURNING *`
    }

    if (result.length === 0) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting shipment:", error)
    return NextResponse.json({ error: "Error al eliminar envío" }, { status: 500 })
  }
}

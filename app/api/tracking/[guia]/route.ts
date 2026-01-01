import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { ensureTables } from "@/lib/db-schema"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ guia: string }> }
) {
    const guia = (await params).guia

    try {
        await ensureTables()
        // 1. Search for shipment in all tables
        // We search sequentially or in parallel. Since IDs might clash between tables, we prioritize by client if known? No, we just return the first match.
        // Ideally, 'guia' should be unique across all, but we can't guarantee.

        // Try Natura
        const natura = await sql`
      SELECT *, 'Natura' as source_table FROM natura_shipments 
      WHERE guia = ${guia} OR pedido = ${guia} 
      LIMIT 1
    `

        // Try Oriflame
        const oriflame = await sql`
      SELECT *, 'Oriflame' as source_table FROM oriflame_shipments
      WHERE guia = ${guia} OR numero_pedido = ${guia}
      LIMIT 1
    `

        // Try Offcors
        const offcors = await sql`
      SELECT *, 'Offcors' as source_table FROM offcors_shipments
      WHERE numero_guia_rym = ${guia} OR no_guia_hermeco = ${guia}
      LIMIT 1
    `

        const shipment = natura[0] || oriflame[0] || offcors[0]

        if (!shipment) {
            return NextResponse.json({ error: "Guía no encontrada" }, { status: 404 })
        }

        // 2. Fetch History
        // We match history by 'guia' primarily.
        // If the shipment was found via 'pedido' (not guia column), we should search history by the actual guia found.
        const actualGuia = shipment.guia || shipment.numero_guia_rym

        const history = await sql`
      SELECT * FROM shipment_history 
      WHERE guia = ${actualGuia}
      ORDER BY created_at DESC
    `

        // If no history exists (old records), synthesize one from current state
        if (history.length === 0) {
            history.push({
                id: 0,
                guia: actualGuia,
                estado: shipment.estado,
                novedad: shipment.novedad || shipment.novedad_despacho || shipment.novedad_entrega,
                created_at: shipment.updated_at || shipment.created_at,
                transportadora: shipment.source_table // synthesized
            })
        }

        // Normalize shipment object for frontend
        const normalizedShipment = {
            guia: actualGuia,
            pedido: shipment.pedido || shipment.numero_pedido || shipment.no_guia_hermeco,
            destinatario: shipment.destinatario || shipment.nombre_cn,
            direccion: shipment.direccion,
            ciudad: shipment.ciudad,
            departamento: shipment.departamento,
            estado: shipment.estado,
            fecha_despacho: shipment.fecha_despacho || shipment.fecha_ingreso,
            fecha_entrega: shipment.fecha_entrega,
            transportadora: shipment.transportadora || shipment.source_table,
            servicio: shipment.cliente || shipment.source_table,
            novedad: shipment.novedad || shipment.novedad_despacho || shipment.novedad_entrega
        }

        return NextResponse.json({
            shipment: normalizedShipment,
            history
        })

    } catch (error) {
        console.error("Error fetching tracking:", error)
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
    }
}

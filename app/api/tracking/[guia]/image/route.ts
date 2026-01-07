import { NextResponse } from "next/server"
import { Buffer } from "node:buffer"
import { sql } from "@/lib/db"
import { ensureTables } from "@/lib/db-schema"
import { visualCache } from "@/lib/visual-cache"
import { generateVisualGuide, type VisualGuideData } from "@/lib/visual-generator"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ guia: string }> }
) {
  const guia = (await params).guia

  try {
    // 1. Check Cache first
    const cachedImage = visualCache.get(guia)
    if (cachedImage) {
      return new Response(cachedImage as any, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=300", // 5 minutes browser cache
        },
      })
    }

    await ensureTables()

    // 2. Fetch data (similar logic to tracking route)
    const natura = await sql`
      SELECT *, 'Natura' as source_table FROM natura_shipments 
      WHERE guia = ${guia} OR pedido = ${guia} 
      LIMIT 1
    `
    const oriflame = await sql`
      SELECT *, 'Oriflame' as source_table FROM oriflame_shipments
      WHERE guia = ${guia} OR numero_pedido = ${guia}
      LIMIT 1
    `
    const offcors = await sql`
      SELECT *, 'Offcors' as source_table FROM offcors_shipments
      WHERE numero_guia_rym = ${guia} OR no_guia_hermeco = ${guia}
      LIMIT 1
    `

    const shipment = (natura[0] || oriflame[0] || offcors[0]) as any

    if (!shipment) {
      return NextResponse.json({ error: "Guía no encontrada" }, { status: 404 })
    }

    const actualGuia = String(shipment.guia || shipment.numero_guia_rym || guia)
    
    // 3. Fetch History for the visual
    const history = (await sql`
      SELECT * FROM shipment_history 
      WHERE guia = ${actualGuia}
      ORDER BY created_at DESC
      LIMIT 10
    `) as any[]

    // Normalize data for the generator
    const visualData: VisualGuideData = {
      guia: actualGuia,
      pedido: String(shipment.pedido || shipment.numero_pedido || shipment.no_guia_hermeco || ""),
      destinatario: String(shipment.destinatario || shipment.nombre_cn || "Destinatario no disponible"),
      direccion: String(shipment.direccion || "Dirección no disponible"),
      ciudad: String(shipment.ciudad || "Ciudad no disponible"),
      departamento: String(shipment.departamento || "Depto no disponible"),
      estado: String(shipment.estado || "PENDIENTE").toUpperCase(),
      fecha_despacho: String(shipment.fecha_despacho || shipment.fecha_ingreso || "-"),
      transportadora: String(shipment.transportadora || shipment.source_table || ""),
      servicio: String(shipment.cliente || shipment.source_table || ""),
      history: history.length > 0 ? history : [{
        estado: shipment.estado,
        novedad: shipment.novedad || shipment.novedad_despacho || shipment.novedad_entrega,
        created_at: shipment.updated_at || shipment.created_at
      }]
    }

    // 4. Generate Visual (in-memory)
    const imageBuffer = await generateVisualGuide(visualData)

    // 5. Store in LRU Cache
    visualCache.set(guia, imageBuffer)

    // 6. Return response
    return new Response(imageBuffer as any, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=300",
      },
    })

  } catch (error) {
    console.error("Error generating visual guide:", error)
    return NextResponse.json({ error: "Error interno al generar la guía" }, { status: 500 })
  }
}

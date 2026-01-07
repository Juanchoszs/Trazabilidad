import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function PATCH(request: Request) {
  try {
    const { ids, status, company } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0 || !status) {
      return NextResponse.json({ error: "IDs y estado son requeridos" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)
    
    // Determine target table based on company or by checking a representative record
    // In this app, we usually know the company from the frontend filter
    let table = "shipments"
    if (company === "Natura") {
      table = "natura_shipments"
    } else if (company === "Oriflame") {
      table = "oriflame_shipments"
    } else if (company === "Offcors") {
      table = "offcors_shipments"
    } else {
      // Fallback: Check the first ID to see where it belongs
      const id = ids[0]
      const isOriflame = await sql`SELECT id FROM oriflame_shipments WHERE id = ${id} LIMIT 1`
      if (isOriflame.length > 0) {
        table = "oriflame_shipments"
      } else {
        const isNatura = await sql`SELECT id FROM natura_shipments WHERE id = ${id} LIMIT 1`
        if (isNatura.length > 0) {
          table = "natura_shipments"
        } else {
          const isOffcors = await sql`SELECT id FROM offcors_shipments WHERE id = ${id} LIMIT 1`
          if (isOffcors.length > 0) {
            table = "offcors_shipments"
          }
        }
      }
    }

    // 4. Determine columns and perform bulk update + history
    const now = new Date()
    const formattedDate = now.toLocaleString('es-CO', { timeZone: 'America/Bogota' })

    if (table === "oriflame_shipments") {
        const records = await sql`SELECT id, guia, estado, cliente FROM oriflame_shipments WHERE id = ANY(${ids})`
        await sql`
          UPDATE oriflame_shipments
          SET estado = ${status}, updated_at = NOW(), fecha_entrega = NOW()
          WHERE id = ANY(${ids})
        `
        for (const rec of records) {
          if (rec.guia) {
            await sql`
              INSERT INTO shipment_history (guia, transportadora, estado, created_at)
              VALUES (${rec.guia}, ${rec.cliente || "Oriflame"}, ${status}, NOW())
            `
          }
        }
    } else if (table === "offcors_shipments") {
        const records = await sql`SELECT id, numero_guia_rym as guia, estado, cliente FROM offcors_shipments WHERE id = ANY(${ids})`
        await sql`
          UPDATE offcors_shipments
          SET estado = ${status}, updated_at = NOW(), fecha_entrega = NOW()
          WHERE id = ANY(${ids})
        `
        for (const rec of records) {
          if (rec.guia) {
            await sql`
              INSERT INTO shipment_history (guia, transportadora, estado, created_at)
              VALUES (${rec.guia}, ${rec.cliente || "Offcors"}, ${status}, NOW())
            `
          }
        }
    } else {
        const records = await sql`SELECT id, guia, estado, cliente FROM natura_shipments WHERE id = ANY(${ids})`
        await sql`
          UPDATE natura_shipments
          SET estado = ${status}, updated_at = NOW(), fecha = NOW()
          WHERE id = ANY(${ids})
        `
        for (const rec of records) {
          if (rec.guia) {
            await sql`
              INSERT INTO shipment_history (guia, transportadora, estado, created_at)
              VALUES (${rec.guia}, ${rec.cliente || "Natura"}, ${status}, NOW())
            `
          }
        }
    }

    return NextResponse.json({ success: true, count: ids.length })
  } catch (error) {
    console.error("Bulk update error:", error)
    return NextResponse.json({ error: "Error al actualizar los registros" }, { status: 500 })
  }
}

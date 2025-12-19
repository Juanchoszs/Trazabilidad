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
        }
      }
    }

    // Perform bulk update based on identified table
    if (table === "oriflame_shipments") {
        await sql`
          UPDATE oriflame_shipments
          SET estado = ${status}, updated_at = NOW()
          WHERE id = ANY(${ids})
        `
    } else {
        await sql`
          UPDATE natura_shipments
          SET estado = ${status}, updated_at = NOW()
          WHERE id = ANY(${ids})
        `
    }

    return NextResponse.json({ success: true, count: ids.length })
  } catch (error) {
    console.error("Bulk update error:", error)
    return NextResponse.json({ error: "Error al actualizar los registros" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// Helper function to determine which table a record belongs to
async function findRecordTable(id: string): Promise<{ table: 'natura' | 'oriflame' | null; record: any }> {
  // Try natura_shipments first
  const naturaResult = await sql`SELECT *, 'natura' as source_table FROM natura_shipments WHERE id = ${id}`
  if (naturaResult.length > 0) {
    return { table: 'natura', record: naturaResult[0] }
  }
  
  // Try oriflame_shipments
  const oriflameResult = await sql`SELECT *, 'oriflame' as source_table FROM oriflame_shipments WHERE id = ${id}`
  if (oriflameResult.length > 0) {
    return { table: 'oriflame', record: oriflameResult[0] }
  }
  
  return { table: null, record: null }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { table, record } = await findRecordTable(id)

    if (!record) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error("[v0] Error fetching shipment:", error)
    return NextResponse.json({ error: "Error al obtener envío" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { table, record: current } = await findRecordTable(id)

    if (!current) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    let result
    if (table === 'natura') {
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
    } else if (table === 'oriflame') {
      // ORIFLAME uses dedicated fields
      result = await sql`
        UPDATE oriflame_shipments 
        SET 
          guia = ${body.guia !== undefined ? body.guia : current.guia},
          destinatario = ${body.destinatario !== undefined ? body.destinatario : current.destinatario},
          numero_pedido = ${body.numero_pedido !== undefined ? body.numero_pedido : current.numero_pedido},
          codigo_empresaria = ${body.codigo_empresaria !== undefined ? body.codigo_empresaria : current.codigo_empresaria},
          direccion = ${body.direccion !== undefined ? body.direccion : current.direccion},
          telefono = ${body.telefono !== undefined ? body.telefono : current.telefono},
          ciudad = ${body.ciudad !== undefined ? body.ciudad : current.ciudad},
          departamento = ${body.departamento !== undefined ? body.departamento : current.departamento},
          fecha_ingreso = ${body.fecha_ingreso !== undefined ? body.fecha_ingreso : current.fecha_ingreso},
          fecha_entrega = ${body.fecha_entrega !== undefined ? body.fecha_entrega : current.fecha_entrega},
          fecha_promesa = ${body.fecha_promesa !== undefined ? body.fecha_promesa : current.fecha_promesa},
          dias_promesa = ${body.dias_promesa !== undefined ? body.dias_promesa : current.dias_promesa},
          estado = ${body.estado !== undefined ? body.estado : current.estado},
          novedad = ${body.novedad !== undefined ? body.novedad : current.novedad},
          novedad2 = ${body.novedad2 !== undefined ? body.novedad2 : current.novedad2},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
    } else {
      return NextResponse.json({ error: "Tabla no identificada" }, { status: 500 })
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
    const { table } = await findRecordTable(id)
    
    if (!table) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    let result
    if (table === 'natura') {
      result = await sql`DELETE FROM natura_shipments WHERE id = ${id} RETURNING *`
    } else if (table === 'oriflame') {
      result = await sql`DELETE FROM oriflame_shipments WHERE id = ${id} RETURNING *`
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting shipment:", error)
    return NextResponse.json({ error: "Error al eliminar envío" }, { status: 500 })
  }
}

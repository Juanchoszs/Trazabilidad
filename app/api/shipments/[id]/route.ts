import { NextResponse } from "next/server"
import { sql } from "@/lib/db"

// Helper function to determine which table a record belongs to
async function findRecordTable(id: string, source?: string): Promise<{ table: "natura" | "oriflame" | "offcors" | null; record: any }> {
  // If source is explicitly provided, trust it first
  if (source === "natura") {
    const result = await sql`SELECT *, 'natura' as source_table FROM natura_shipments WHERE id = ${id}`
    return { table: result.length > 0 ? "natura" : null, record: result[0] }
  }

  if (source === "oriflame") {
    const result = await sql`SELECT *, 'oriflame' as source_table FROM oriflame_shipments WHERE id = ${id}`
    return { table: result.length > 0 ? "oriflame" : null, record: result[0] }
  }

  if (source === "offcors") {
    const result = await sql`SELECT *, 'offcors' as source_table FROM offcors_shipments WHERE id = ${id}`
    return { table: result.length > 0 ? "offcors" : null, record: result[0] }
  }

  // Fallback: try to detect table by ID
  const naturaResult = await sql`SELECT *, 'natura' as source_table FROM natura_shipments WHERE id = ${id}`
  if (naturaResult.length > 0) {
    return { table: "natura", record: naturaResult[0] }
  }

  const oriflameResult = await sql`SELECT *, 'oriflame' as source_table FROM oriflame_shipments WHERE id = ${id}`
  if (oriflameResult.length > 0) {
    return { table: "oriflame", record: oriflameResult[0] }
  }

  const offcorsResult = await sql`SELECT *, 'offcors' as source_table FROM offcors_shipments WHERE id = ${id}`
  if (offcorsResult.length > 0) {
    return { table: "offcors", record: offcorsResult[0] }
  }

  return { table: null, record: null }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get("source") || undefined
    const { id } = await params
    const { table, record } = await findRecordTable(id, source)

    if (!record) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    let history: any[] = []
    try {
      history = await sql`
        SELECT * FROM shipment_history
        WHERE shipment_id = ${id}
        ORDER BY modified_at DESC
        LIMIT 50
      `
    } catch (error) {
      const err = error as any
      if (err?.code !== "42P01") {
        throw error
      }
    }

    return NextResponse.json({ shipment: record, history })
  } catch (error) {
    console.error("[v0] Error fetching shipment:", error)
    return NextResponse.json({ error: "Error al obtener envío" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get("source") || undefined
    const { id } = await params
    const body = await request.json()
    const { table, record: current } = await findRecordTable(id, source)

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
    } else if (table === 'offcors') {
      result = await sql`
        UPDATE offcors_shipments
        SET
          fecha = ${body.fecha !== undefined ? body.fecha : current.fecha},
          no_cierre_despacho = ${body.no_cierre_despacho !== undefined ? body.no_cierre_despacho : current.no_cierre_despacho},
          no_guia_hermeco = ${body.no_guia_hermeco !== undefined ? body.no_guia_hermeco : current.no_guia_hermeco},
          destinatario = ${body.destinatario !== undefined ? body.destinatario : current.destinatario},
          direccion = ${body.direccion !== undefined ? body.direccion : current.direccion},
          telefono = ${body.telefono !== undefined ? body.telefono : current.telefono},
          ciudad = ${body.ciudad !== undefined ? body.ciudad : current.ciudad},
          departamento = ${body.departamento !== undefined ? body.departamento : current.departamento},
          nro_entrega = ${body.nro_entrega !== undefined ? body.nro_entrega : current.nro_entrega},
          cedula_cliente = ${body.cedula_cliente !== undefined ? body.cedula_cliente : current.cedula_cliente},
          unidad_embalaje = ${body.unidad_embalaje !== undefined ? body.unidad_embalaje : current.unidad_embalaje},
          canal = ${body.canal !== undefined ? body.canal : current.canal},
          tipo_embalaje = ${body.tipo_embalaje !== undefined ? body.tipo_embalaje : current.tipo_embalaje},
          novedad_despacho = ${body.novedad_despacho !== undefined ? body.novedad_despacho : current.novedad_despacho},
          fecha_despacho = ${body.fecha_despacho !== undefined ? body.fecha_despacho : current.fecha_despacho},
          numero_guia_rym = ${body.numero_guia_rym !== undefined ? body.numero_guia_rym : current.numero_guia_rym},
          fecha_entrega = ${body.fecha_entrega !== undefined ? body.fecha_entrega : current.fecha_entrega},
          estado = ${body.estado !== undefined ? body.estado : current.estado},
          guia_subida_rym = ${body.guia_subida_rym !== undefined ? body.guia_subida_rym : current.guia_subida_rym},
          novedad_entrega = ${body.novedad_entrega !== undefined ? body.novedad_entrega : current.novedad_entrega},
          novedad_1 = ${body.novedad_1 !== undefined ? body.novedad_1 : current.novedad_1},
          novedad_2 = ${body.novedad_2 !== undefined ? body.novedad_2 : current.novedad_2},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `
    } else {
      return NextResponse.json({ error: "Tabla no identificada" }, { status: 500 })
    }

    const updated = result[0]

    const changes = (body.changes || {}) as Record<string, { old: any; new: any }>
    const changeEntries = Object.entries(changes)

    if (changeEntries.length > 0) {
      try {
        await Promise.all(
          changeEntries.map(([field, value]) =>
            sql`
              INSERT INTO shipment_history (shipment_id, campo_modificado, valor_anterior, valor_nuevo, modified_by)
              VALUES (${id}, ${field}, ${String(value.old ?? "")}, ${String(value.new ?? "")}, 'Manual')
            `,
          ),
        )
      } catch (error) {
        const err = error as any
        if (err?.code !== "42P01") {
          throw error
        }
      }
    }

    let history: any[] = []
    try {
      history = await sql`
        SELECT * FROM shipment_history
        WHERE shipment_id = ${id}
        ORDER BY modified_at DESC
        LIMIT 50
      `
    } catch (error) {
      const err = error as any
      if (err?.code !== "42P01") {
        throw error
      }
    }

    return NextResponse.json({ shipment: updated, history })
  } catch (error) {
    console.error("[v0] Error updating shipment:", error)
    return NextResponse.json({ error: "Error al actualizar envío" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get("source") || undefined
    const { id } = await params
    const { table } = await findRecordTable(id, source)
    
    if (!table) {
      return NextResponse.json({ error: "Envío no encontrado" }, { status: 404 })
    }

    let result
    if (table === 'natura') {
      result = await sql`DELETE FROM natura_shipments WHERE id = ${id} RETURNING *`
    } else if (table === 'oriflame') {
      result = await sql`DELETE FROM oriflame_shipments WHERE id = ${id} RETURNING *`
    } else if (table === 'offcors') {
      result = await sql`DELETE FROM offcors_shipments WHERE id = ${id} RETURNING *`
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(" Error deleting shipment:", error)
    return NextResponse.json({ error: "Error al eliminar envío" }, { status: 500 })
  }
}

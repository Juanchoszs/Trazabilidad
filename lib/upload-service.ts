import { sql } from "@/lib/db"
import {
    mapRemesasRow,
    mapOriflameRow,
    mapOffcorsRow
} from "@/lib/upload-utils"

// Process Natura / Remesas batch
export async function processNaturaBatch(rows: any[], cliente: string) {
    const valuesToInsert = rows.map(row => {
        try {
            const mapped = mapRemesasRow(row)
            if (!mapped.pedido && !mapped.guia) return null // Skip invalid
            return { ...mapped, cliente, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        } catch (e) { return null }
    }).filter(Boolean)

    if (valuesToInsert.length === 0) return { inserted: 0, updated: 0 }

    const jsonState = JSON.stringify(valuesToInsert)

    // 1. Insert new records and capture them
    const newInserts = await sql`
    INSERT INTO natura_shipments (
      transportadora, fecha_despacho, pedido, guia, estado, fecha, novedad, 
      pe, cod_cn, nombre_cn, departamento, ciudad, direccion, telefono, cliente
    )
    SELECT 
      transportadora, fecha_despacho, pedido, guia, estado, fecha, novedad, 
      pe, cod_cn, nombre_cn, departamento, ciudad, direccion, telefono, cliente
    FROM json_populate_recordset(null::natura_shipments, ${jsonState}::json)
    ON CONFLICT (pedido, guia) DO NOTHING
    RETURNING guia, estado, transportadora
  `

    // 1.1 Insert history for new records
    if (newInserts.length > 0) {
        const historyValues = newInserts.map(r => ({
            guia: r.guia,
            transportadora: r.transportadora || "Natura",
            estado: r.estado || "PENDIENTE",
            novedad: "Carga Inicial",
            created_at: new Date().toISOString()
        }))

        await sql`
      INSERT INTO shipment_history (guia, transportadora, estado, novedad, created_at)
      SELECT guia, transportadora, estado, novedad, created_at
      FROM json_populate_recordset(null::shipment_history, ${JSON.stringify(historyValues)}::json)
    `
    }

    // 2. Detect changes for existing records and Update
    // We need to compare incoming state with DB state. 
    // Complex update with join on temporary values
    const updates = await sql`
    WITH incoming AS (
      SELECT * FROM json_populate_recordset(null::natura_shipments, ${jsonState}::json)
    ),
    changed_rows AS (
      SELECT 
        i.guia, i.estado as new_estado, i.transportadora, i.novedad,
        e.estado as old_estado
      FROM incoming i
      JOIN natura_shipments e ON e.pedido = i.pedido AND e.guia = i.guia
      WHERE e.estado IS DISTINCT FROM i.estado
    ),
    inserted_history AS (
      INSERT INTO shipment_history (guia, transportadora, estado, novedad, created_at)
      SELECT 
        guia, transportadora, new_estado, 'Actualización de estado', NOW()
      FROM changed_rows
      RETURNING guia
    )
    UPDATE natura_shipments e
    SET 
      estado = i.estado,
      novedad = i.novedad,
      fecha = i.fecha,
      updated_at = NOW()
    FROM incoming i
    WHERE e.pedido = i.pedido AND e.guia = i.guia
      AND (e.estado IS DISTINCT FROM i.estado OR e.novedad IS DISTINCT FROM i.novedad)
    RETURNING e.id
  `

    return { inserted: newInserts.length, updated: updates.length }
}

// Process Oriflame batch
export async function processOriflameBatch(rows: any[], cliente: string) {
    const valuesToInsert = rows.map(row => {
        try {
            const mapped = mapOriflameRow(row)
            if (!mapped.numero_pedido && !mapped.guia) return null
            return { ...mapped, cliente, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        } catch (e) { return null }
    }).filter(Boolean)

    if (valuesToInsert.length === 0) return { inserted: 0, updated: 0 }

    const jsonState = JSON.stringify(valuesToInsert)

    // 1. Insert New
    const newInserts = await sql`
    INSERT INTO oriflame_shipments (
      guia, destinatario, numero_pedido, codigo_empresaria, direccion, 
      telefono, ciudad, departamento, fecha_ingreso, fecha_entrega, 
      fecha_promesa, dias_promesa, estado, novedad, novedad2, cliente
    )
    SELECT 
      guia, destinatario, numero_pedido, codigo_empresaria, direccion, 
      telefono, ciudad, departamento, fecha_ingreso, fecha_entrega, 
      fecha_promesa, dias_promesa, estado, novedad, novedad2, cliente
    FROM json_populate_recordset(null::oriflame_shipments, ${jsonState}::json)
    ON CONFLICT (numero_pedido, guia) DO NOTHING
    RETURNING guia, estado
  `

    // 1.1 History for new
    if (newInserts.length > 0) {
        const historyValues = newInserts.map(r => ({
            guia: r.guia,
            transportadora: "Oriflame",
            estado: r.estado || "PENDIENTE",
            novedad: "Carga Inicial",
            created_at: new Date().toISOString()
        }))
        await sql`
      INSERT INTO shipment_history (guia, transportadora, estado, novedad, created_at)
      SELECT guia, transportadora, estado, novedad, created_at
      FROM json_populate_recordset(null::shipment_history, ${JSON.stringify(historyValues)}::json)
    `
    }

    // 2. Update Existing and Track History
    const updates = await sql`
    WITH incoming AS (
      SELECT * FROM json_populate_recordset(null::oriflame_shipments, ${jsonState}::json)
    ),
    changed_rows AS (
      SELECT 
        i.guia, i.estado as new_estado,
        e.estado as old_estado
      FROM incoming i
      JOIN oriflame_shipments e ON e.numero_pedido = i.numero_pedido AND e.guia = i.guia
      WHERE e.estado IS DISTINCT FROM i.estado
    ),
    inserted_history AS (
      INSERT INTO shipment_history (guia, transportadora, estado, novedad, created_at)
      SELECT 
        guia, 'Oriflame', new_estado, 'Actualización de estado', NOW()
      FROM changed_rows
      RETURNING guia
    )
    UPDATE oriflame_shipments e
    SET 
      estado = i.estado,
      novedad = i.novedad,
      updated_at = NOW()
    FROM incoming i
    WHERE e.numero_pedido = i.numero_pedido AND e.guia = i.guia
      AND (e.estado IS DISTINCT FROM i.estado OR e.novedad IS DISTINCT FROM i.novedad)
    RETURNING e.id
  `

    return { inserted: newInserts.length, updated: updates.length }
}

// Process Offcors batch
export async function processOffcorsBatch(rows: any[], cliente: string) {
    const valuesToInsert = rows.map(row => {
        try {
            const mapped = mapOffcorsRow(row)
            if (!mapped.numero_guia_rym && !mapped.no_guia_hermeco) return null
            return { ...mapped, cliente, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        } catch (e) { return null }
    }).filter(Boolean)

    if (valuesToInsert.length === 0) return { inserted: 0, updated: 0 }

    const jsonState = JSON.stringify(valuesToInsert)

    // 1. Insert New
    // Note: unique constraint is (numero_guia_rym, nro_entrega)
    const newInserts = await sql`
    INSERT INTO offcors_shipments (
      fecha, no_cierre_despacho, no_guia_hermeco, destinatario, direccion, 
      telefono, ciudad, departamento, nro_entrega, cedula_cliente, 
      unidad_embalaje, canal, tipo_embalaje, novedad_despacho, 
      fecha_despacho, numero_guia_rym, fecha_entrega, estado, 
      guia_subida_rym, novedad_entrega, novedad_1, novedad_2, cliente
    )
    SELECT 
      fecha, no_cierre_despacho, no_guia_hermeco, destinatario, direccion, 
      telefono, ciudad, departamento, nro_entrega, cedula_cliente, 
      unidad_embalaje, canal, tipo_embalaje, novedad_despacho, 
      fecha_despacho, numero_guia_rym, fecha_entrega, estado, 
      guia_subida_rym, novedad_entrega, novedad_1, novedad_2, cliente
    FROM json_populate_recordset(null::offcors_shipments, ${jsonState}::json)
    ON CONFLICT (numero_guia_rym, nro_entrega) DO NOTHING
    RETURNING numero_guia_rym as guia, estado
  `

    // 1.1 History
    if (newInserts.length > 0) {
        const historyValues = newInserts.map(r => ({
            guia: r.guia,
            transportadora: "Offcors",
            estado: r.estado || "PENDIENTE",
            novedad: "Carga Inicial",
            created_at: new Date().toISOString()
        }))
        await sql`
      INSERT INTO shipment_history (guia, transportadora, estado, novedad, created_at)
      SELECT guia, transportadora, estado, novedad, created_at
      FROM json_populate_recordset(null::shipment_history, ${JSON.stringify(historyValues)}::json)
    `
    }

    // 2. Update
    const updates = await sql`
    WITH incoming AS (
      SELECT * FROM json_populate_recordset(null::offcors_shipments, ${jsonState}::json)
    ),
    changed_rows AS (
      SELECT 
        i.numero_guia_rym as guia, i.estado as new_estado,
        e.estado as old_estado
      FROM incoming i
      JOIN offcors_shipments e ON e.numero_guia_rym = i.numero_guia_rym AND e.nro_entrega = i.nro_entrega
      WHERE e.estado IS DISTINCT FROM i.estado
    ),
    inserted_history AS (
      INSERT INTO shipment_history (guia, transportadora, estado, novedad, created_at)
      SELECT 
        guia, 'Offcors', new_estado, 'Actualización de estado', NOW()
      FROM changed_rows
      RETURNING guia
    )
    UPDATE offcors_shipments e
    SET 
      estado = i.estado,
      novedad_entrega = i.novedad_entrega,
      updated_at = NOW()
    FROM incoming i
    WHERE e.numero_guia_rym = i.numero_guia_rym AND e.nro_entrega = i.nro_entrega
      AND (e.estado IS DISTINCT FROM i.estado OR e.novedad_entrega IS DISTINCT FROM i.novedad_entrega)
    RETURNING e.id
  `

    return { inserted: newInserts.length, updated: updates.length }
}

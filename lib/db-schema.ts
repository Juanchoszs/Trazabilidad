import { sql } from "@/lib/db"

export async function ensureTables() {
  // Ensure upload_batches table exists
  await sql`
    CREATE TABLE IF NOT EXISTS upload_batches (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      uploaded_by VARCHAR(100),
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      total_rows INTEGER DEFAULT 0,
      inserted_rows INTEGER DEFAULT 0,
      duplicate_rows INTEGER DEFAULT 0,
      error_rows INTEGER DEFAULT 0,
      status VARCHAR(50) DEFAULT 'processing'
    );
  `

  // Ensure natura_shipments table exists
  await sql`
    CREATE TABLE IF NOT EXISTS natura_shipments (
      id SERIAL PRIMARY KEY,
      transportadora VARCHAR(255),
      fecha_despacho VARCHAR(255), -- Using varchar to be safe with import formats, or DATE if consistent
      pedido VARCHAR(255),
      guia VARCHAR(255),
      estado VARCHAR(255),
      fecha VARCHAR(255),
      novedad TEXT,
      pe VARCHAR(255),
      cod_cn VARCHAR(255),
      nombre_cn VARCHAR(255),
      departamento VARCHAR(255),
      ciudad VARCHAR(255),
      direccion TEXT,
      telefono VARCHAR(255),
      cliente VARCHAR(100) DEFAULT 'Natura',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_natura_pedido_guia UNIQUE (pedido, guia)
    );
  `

  // Ensure oriflame_shipments table exists
  await sql`
    CREATE TABLE IF NOT EXISTS oriflame_shipments (
      id SERIAL PRIMARY KEY,
      guia VARCHAR(255),
      destinatario VARCHAR(255),
      numero_pedido VARCHAR(255),
      codigo_empresaria VARCHAR(255),
      direccion TEXT,
      telefono VARCHAR(255),
      ciudad VARCHAR(255),
      departamento VARCHAR(255),
      fecha_ingreso VARCHAR(255),
      fecha_entrega VARCHAR(255),
      fecha_promesa VARCHAR(255),
      dias_promesa INTEGER,
      estado VARCHAR(255),
      novedad TEXT,
      novedad2 TEXT,
      cliente VARCHAR(100) DEFAULT 'Oriflame',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_oriflame_pedido_guia UNIQUE (numero_pedido, guia)
    );
  `

  // Ensure offcors_shipments table exists
  await sql`
    CREATE TABLE IF NOT EXISTS offcors_shipments (
      id SERIAL PRIMARY KEY,
      fecha VARCHAR(255),
      no_cierre_despacho INTEGER,
      no_guia_hermeco VARCHAR(255),
      destinatario VARCHAR(255),
      direccion TEXT,
      telefono VARCHAR(255),
      ciudad VARCHAR(255),
      departamento VARCHAR(255),
      nro_entrega VARCHAR(255), -- Often big numbers or strings
      cedula_cliente VARCHAR(255),
      unidad_embalaje INTEGER,
      canal INTEGER,
      tipo_embalaje VARCHAR(255),
      novedad_despacho TEXT,
      fecha_despacho VARCHAR(255),
      numero_guia_rym VARCHAR(255),
      fecha_entrega VARCHAR(255),
      estado VARCHAR(255),
      guia_subida_rym VARCHAR(50),
      novedad_entrega TEXT,
      novedad_1 TEXT,
      novedad_2 TEXT,
      cliente VARCHAR(100) DEFAULT 'Offcors',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_offcors_guia_rym_entrega UNIQUE (numero_guia_rym, nro_entrega)
    );
  `
  // Ensure shipment_history table exists
  await sql`
    CREATE TABLE IF NOT EXISTS shipment_history (
      id SERIAL PRIMARY KEY,
      guia VARCHAR(255) NOT NULL,
      transportadora VARCHAR(100), -- To know which company it belongs to
      estado VARCHAR(255),
      ubicacion VARCHAR(255), -- City or Dept if available
      novedad TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `

  // Create index for faster lookups
  await sql`
    CREATE INDEX IF NOT EXISTS idx_shipment_history_guia ON shipment_history(guia);
  `
}

import { ensureTables } from "@/lib/db-schema"
import { sql } from "@/lib/db"

async function main() {
  console.log("Iniciando creación de tablas...")
  try {
    await ensureTables()
    console.log("Tablas verificadas/creadas exitosamente.")
    
    // Verify creation
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('natura_shipments', 'oriflame_shipments', 'offcors_shipments');
    `
    console.log("Tablas existentes:", tables.map(t => t.table_name))
    
  } catch (error) {
    console.error("Error creando tablas:", error)
  }
}

main()

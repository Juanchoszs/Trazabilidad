import { Header } from "@/components/header"
import { StatsCards } from "@/components/stats-cards"
import { OverallEffectiveness } from "@/components/overall-effectiveness"
import { ChartsSection } from "@/components/charts-section"
import { DataTable } from "@/components/data-table"
import { Footer } from "@/components/footer"
import { DashboardFilter } from "@/components/dashboard-filter"
import { sql, type DashboardStats } from "@/lib/db"

export default async function Home({ searchParams }: { searchParams: Promise<{ transportadora?: string; novedades?: string }> }) {
  const params = await searchParams
  const filter = params.transportadora
  
  const showNovedades = params.novedades === "true"

  // Construct query fragments
  let companyCondition = sql`TRUE`
  
  if (filter === "Natura") {
    companyCondition = sql`cliente = 'Natura' OR transportadora = 'REMESAS Y MENSAJES'`
  } else if (filter === "Oriflame") {
    companyCondition = sql`cliente = 'Oriflame'`
  } else if (filter) {
    companyCondition = sql`transportadora = ${filter}`
  }

  const novedadesCondition = showNovedades ? sql`novedad IS NOT NULL AND TRIM(novedad) != ''` : sql`TRUE`
  
  const whereClause = sql`WHERE ${companyCondition} AND ${novedadesCondition}`

  // Union query to fetch from both tables (natura_shipments and oriflame_shipments)
  // Map columns to common display format
  const baseQuery = sql`
    SELECT 
      id, 
      transportadora, 
      fecha_despacho, 
      pedido, 
      guia, 
      estado, 
      fecha, 
      novedad, 
      pe, 
      cod_cn, 
      nombre_cn, 
      departamento, 
      ciudad, 
      direccion, 
      telefono, 
      cliente, 
      NULL::text as novedad2,
      NULL::date as fecha_ingreso,
      NULL::date as fecha_entrega,
      NULL::date as fecha_promesa,
      NULL::int as dias_promesa,
      NULL::text as destinatario,
      NULL::text as numero_pedido,
      NULL::text as codigo_empresaria,
      created_at, 
      updated_at 
    FROM natura_shipments
    UNION ALL
    SELECT 
      id, 
      'Oriflame' as transportadora, 
      fecha_ingreso as fecha_despacho, 
      numero_pedido as pedido, 
      guia, 
      estado, 
      fecha_entrega as fecha, 
      novedad, 
      dias_promesa::text as pe, 
      codigo_empresaria as cod_cn, 
      destinatario as nombre_cn, 
      departamento, 
      ciudad, 
      direccion, 
      telefono, 
      cliente, 
      novedad2,
      fecha_ingreso,
      fecha_entrega,
      fecha_promesa,
      dias_promesa,
      destinatario,
      numero_pedido,
      codigo_empresaria,
      created_at, 
      updated_at
    FROM oriflame_shipments
  `

  const [shipments, statsResult, companiesResult] = await Promise.all([
    sql`SELECT * FROM (${baseQuery}) AS combined_table ${whereClause} ORDER BY created_at DESC`,
    sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE TRIM(UPPER(estado)) = 'ENTREGADO') as delivered,
        COUNT(*) FILTER (WHERE TRIM(UPPER(estado)) IN ('FALLIDO', 'NO ENTREGADO')) as failed,
        COUNT(*) FILTER (WHERE TRIM(UPPER(estado)) IN ('DEVOLUCION', 'DEVUELTO')) as returned,
        COUNT(*) FILTER (WHERE TRIM(UPPER(estado)) = 'PERDIDO') as lost,
        COUNT(*) FILTER (WHERE TRIM(UPPER(estado)) IN ('EN TRANSITO', 'EN CAMINO')) as in_transit,
        COUNT(*) FILTER (WHERE TRIM(UPPER(estado)) = 'PENDIENTE') as pending,
        COUNT(*) FILTER (WHERE novedad IS NOT NULL AND TRIM(novedad) != '') as novedades
      FROM (${baseQuery}) AS combined_table
      ${whereClause}
    `,
    sql`SELECT DISTINCT cliente FROM (${baseQuery}) AS combined_table WHERE cliente IS NOT NULL ORDER BY cliente`
  ])

  const stats = statsResult[0] as unknown as DashboardStats
  const companies = companiesResult
    .map(c => c.cliente)
    .filter(Boolean)
  
  // Ensure both "Natura" and "Oriflame" are in the list
  if (!companies.includes("Natura")) {
    companies.push("Natura")
  }
  if (!companies.includes("Oriflame")) {
    companies.push("Oriflame")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8 space-y-8 max-w-7xl">
        <DashboardFilter companies={companies} />
        <StatsCards stats={stats} />
        <OverallEffectiveness stats={stats} />
        <ChartsSection shipments={shipments} stats={stats} />
        <DataTable shipments={shipments} />
      </main>
      <Footer />
    </div>
  )
}

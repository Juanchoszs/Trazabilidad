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
    companyCondition = sql`transportadora = 'REMESAS Y MENSAJES'`
  } else if (filter) {
    companyCondition = sql`transportadora = ${filter}`
  }

  const novedadesCondition = showNovedades ? sql`novedad IS NOT NULL AND TRIM(novedad) != ''` : sql`TRUE`
  
  const whereClause = sql`WHERE ${companyCondition} AND ${novedadesCondition}`

  // Union query to fetch from both tables
  const baseQuery = sql`
    SELECT 
      id, transportadora, fecha_despacho, pedido, guia, estado, fecha, novedad, pe, cod_cn, nombre_cn, departamento, ciudad, direccion, telefono, cliente, NULL::text as novedad2, created_at, updated_at 
    FROM natura_shipments
    UNION ALL
    SELECT 
      id, transportadora, fecha_despacho, pedido, guia, estado, fecha, novedad, pe, cod_cn, nombre_cn, departamento, ciudad, direccion, telefono, cliente, novedad2, created_at, updated_at
    FROM shipments
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
    sql`SELECT DISTINCT transportadora FROM (${baseQuery}) AS combined_table WHERE transportadora IS NOT NULL ORDER BY transportadora`
  ])

  const stats = statsResult[0] as unknown as DashboardStats
  const companies = companiesResult
    .map(c => c.transportadora === "REMESAS Y MENSAJES" ? "Natura" : c.transportadora)
    .filter(Boolean)
  
  // Ensure "Natura" is in the list if not already (or if it was just renamed from REMESAS)
  if (!companies.includes("Natura")) {
    companies.push("Natura")
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

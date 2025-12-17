"use client"

import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { useMemo } from "react"

interface ChartsSectionProps {
  shipments: any[]
  stats: {
    total: number
    delivered: number
    failed: number
    returned: number
    lost: number
  }
}

export function ChartsSection({ shipments, stats }: ChartsSectionProps) {
  const companyData = useMemo(() => {
    const companyStats: Record<string, { exitos: number; devoluciones: number; }> = {}

    shipments.forEach((shipment) => {
      let companyName = shipment.transportadora || "Desconocido"
      if (companyName === "REMESAS Y MENSAJES") companyName = "Natura"
      
      if (!companyStats[companyName]) {
        companyStats[companyName] = { exitos: 0, devoluciones: 0 }
      }

      const status = (shipment.estado || "").trim().toUpperCase()
      
      if (status === "ENTREGADO") {
        companyStats[companyName].exitos++
      } else if (status === "DEVOLUCION" || status === "DEVUELTO") {
        companyStats[companyName].devoluciones++
      }
    })

    return Object.entries(companyStats)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.exitos - a.exitos)
      .slice(0, 6)
  }, [shipments])

  const monthlyData = useMemo(() => {
    const monthlyStats: Record<string, { total: number; delivered: number }> = {}

    shipments.forEach((shipment) => {
      // Use despatch date or delivery date for stats, fallback to upload date
      const dateStr = shipment.fecha_despacho || shipment.fecha || shipment.created_at
      const date = new Date(dateStr)
      
      // Skip invalid dates
      if (isNaN(date.getTime())) return

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { total: 0, delivered: 0 }
      }

      monthlyStats[monthKey].total++
      const status = (shipment.estado || "").trim().toUpperCase()
      if (status === "ENTREGADO") {
        monthlyStats[monthKey].delivered++
      }
    })

    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const currentYear = new Date().getFullYear()

    return months.map((month, index) => {
      const monthKey = `${currentYear}-${String(index + 1).padStart(2, "0")}`
      const stats = monthlyStats[monthKey]
      const efectividad = stats ? Math.round((stats.delivered / stats.total) * 100) : 0

      return { month, efectividad }
    })
  }, [shipments])

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Comparación por Empresa</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={companyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="exitos" fill="#16a34a" name="Éxitos" />
            <Bar dataKey="devoluciones" fill="#f59e0b" name="Devoluciones" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Evolución Mensual de Efectividad</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="efectividad"
              stroke="#111111"
              strokeWidth={2}
              dot={{ fill: "#111111", r: 4 }}
              name="Efectividad (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

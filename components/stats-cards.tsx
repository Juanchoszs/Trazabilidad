import { Card } from "@/components/ui/card"
import { CheckCircle2, Package, AlertCircle } from "lucide-react"

interface StatsCardsProps {
  stats: {
    total: number
    delivered: number
    failed: number
    returned: number
    lost: number
    novedades: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statsConfig = [
    {
      title: "Éxitos",
      value: stats.delivered,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "Devoluciones",
      value: stats.returned,
      icon: Package,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "Novedades",
      value: stats.novedades,
      icon: AlertCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsConfig.map((stat) => {
        const Icon = stat.icon

        return (
          <Card key={stat.title} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-5 w-5 ${stat.color}`} strokeWidth={2} />
              </div>
            </div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">{stat.title}</h3>
            <p className="text-3xl font-semibold tracking-tight">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">entregas totales</p>
          </Card>
        )
      })}
    </div>
  )
}

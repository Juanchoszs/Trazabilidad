"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History, Truck, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface HistoryEntry {
  id: number
  guia: string
  transportadora: string
  estado: string
  novedad: string
  created_at: string
}

interface ShipmentHistoryProps {
  history: HistoryEntry[]
}

function getStatusIcon(estado: string = "") {
  const e = estado.toLowerCase()
  if (e.includes("entregado")) return <CheckCircle className="h-4 w-4 text-green-500" />
  if (e.includes("novedad") || e.includes("devolucion")) return <AlertCircle className="h-4 w-4 text-red-500" />
  if (e.includes("reparto") || e.includes("transito")) return <Truck className="h-4 w-4 text-blue-500" />
  return <Clock className="h-4 w-4 text-gray-400" />
}

export function ShipmentHistory({ history }: ShipmentHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Historial de Estados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sin historial disponible</p>
        ) : (
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {history.map((entry) => (
              <div key={entry.id} className="relative pl-6 pb-4 border-l last:pb-0 last:border-0">
                <div className="absolute left-[-9px] top-0 bg-white dark:bg-gray-950 p-1">
                  {getStatusIcon(entry.estado)}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">{entry.estado}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {new Date((entry.created_at.endsWith('Z') ? entry.created_at : entry.created_at + 'Z')).toLocaleString("es-CO", {
                        timeZone: 'America/Bogota',
                        day: '2-digit', month: '2-digit', year: '2-digit',
                        hour: '2-digit', minute: '2-digit', hour12: true
                      })}
                    </span>
                  </div>

                  {entry.novedad && (
                    <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                      {entry.novedad}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

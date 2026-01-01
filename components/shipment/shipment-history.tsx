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
            {history.filter(h => h.estado !== "NO ENTREGADO").map((entry) => (
              <div key={entry.id} className="relative pl-6 pb-4 border-l last:pb-0 last:border-0">
                <div className="absolute left-[-9px] top-0 bg-white dark:bg-gray-950 p-1">
                  {getStatusIcon(entry.estado)}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm">{entry.estado}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {(() => {
                        try {
                          const s = String(entry.created_at).trim();
                          // Parse YYYY-MM-DD HH:mm:ss directly to local time components
                          const match = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);

                          let dateObj;
                          if (match) {
                            const year = parseInt(match[1], 10);
                            const month = parseInt(match[2], 10) - 1;
                            const day = parseInt(match[3], 10);
                            const hour = match[4] ? parseInt(match[4], 10) : 0;
                            const minute = match[5] ? parseInt(match[5], 10) : 0;
                            const second = match[6] ? parseInt(match[6], 10) : 0;
                            dateObj = new Date(year, month, day, hour - 10, minute, second);
                          } else {
                            dateObj = new Date(s);
                            dateObj.setHours(dateObj.getHours() - 10);
                          }

                          return dateObj.toLocaleString("es-CO", {
                            day: '2-digit', month: '2-digit', year: '2-digit',
                            hour: '2-digit', minute: '2-digit', hour12: true
                          });
                        } catch (e) {
                          return entry.created_at;
                        }
                      })()}
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

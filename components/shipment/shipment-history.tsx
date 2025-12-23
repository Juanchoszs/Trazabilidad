"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { History } from "lucide-react"

interface HistoryEntry {
  id: number
  shipment_id: number
  campo_modificado: string
  valor_anterior: string | null
  valor_nuevo: string | null
  modified_at: string
  modified_by: string
}

interface ShipmentHistoryProps {
  history: HistoryEntry[]
}

export function ShipmentHistory({ history }: ShipmentHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Historial de Cambios
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">Sin historial de cambios</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {history.map((entry) => (
              <div key={entry.id} className="p-3 rounded-lg border text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-xs uppercase">{entry.campo_modificado}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.modified_at).toLocaleString("es-CO")}
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  {entry.valor_anterior && (
                    <p>
                      <span className="text-red-500">-</span> {entry.valor_anterior}
                    </p>
                  )}
                  {entry.valor_nuevo && (
                    <p>
                      <span className="text-green-500">+</span> {entry.valor_nuevo}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Por: {entry.modified_by}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

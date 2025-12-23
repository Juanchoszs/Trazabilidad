"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { History, FileSpreadsheet } from "lucide-react"

interface UploadBatch {
  id: number
  filename: string
  uploaded_by: string
  uploaded_at: string
  total_rows: number
  inserted_rows: number
  duplicate_rows: number
  error_rows: number
  status: string
}

interface UploadHistoryProps {
  uploadHistory: UploadBatch[] | undefined
}

export function UploadHistory({ uploadHistory }: UploadHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial de Cargas
        </CardTitle>
        <CardDescription>Últimas 50 cargas realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        {!uploadHistory || uploadHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No hay cargas registradas</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {uploadHistory.map((batch) => (
              <div key={batch.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm truncate max-w-[200px]">{batch.filename}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(batch.uploaded_at).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      batch.status === "completed"
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400"
                        : batch.status === "failed"
                          ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400"
                    }`}
                  >
                    {batch.status === "completed"
                      ? "Completado"
                      : batch.status === "failed"
                        ? "Fallido"
                        : "Procesando"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-1 bg-muted rounded">
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">{batch.total_rows}</p>
                  </div>
                  <div className="text-center p-1 bg-muted rounded">
                    <p className="text-muted-foreground">OK</p>
                    <p className="font-medium text-green-600">{batch.inserted_rows}</p>
                  </div>
                  <div className="text-center p-1 bg-muted rounded">
                    <p className="text-muted-foreground">Dup.</p>
                    <p className="font-medium text-yellow-600">{batch.duplicate_rows}</p>
                  </div>
                  <div className="text-center p-1 bg-muted rounded">
                    <p className="text-muted-foreground">Error</p>
                    <p className="font-medium text-red-600">{batch.error_rows}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

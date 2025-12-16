"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useDropzone } from "react-dropzone"
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, ArrowLeft, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import useSWR from "swr"

interface UploadResult {
  success: boolean
  batchId: number
  summary: {
    totalRows: number
    insertedRows: number
    duplicateRows: number
    errorRows: number
    errors: string[]
    detectedHeaders?: string[]
  }
}

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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function UploadPage() {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [client, setClient] = useState("Natura")

  const { data: uploadHistory, mutate } = useSWR<UploadBatch[]>("/api/upload", fetcher)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setUploading(true)
      setProgress(0)
      setResult(null)
      setError(null)

      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("uploadedBy", "Usuario")
        formData.append("cliente", client)

        // Simulate progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90))
        }, 200)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        clearInterval(progressInterval)
        setProgress(100)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al subir archivo")
        }

        const data: UploadResult = await response.json()
        setResult(data)
        mutate() // Refresh upload history
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setUploading(false)
      }
    },
    [mutate, client],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Cargar Excel</h1>
              <p className="text-muted-foreground">Sube archivos Excel para agregar registros a la matriz madre</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upload Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Subir Archivo
                </CardTitle>
                <CardDescription>
                  Arrastra un archivo Excel o haz clic para seleccionar. Los datos se agregarán a la matriz madre.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Empresa / Cliente</label>
                  <Select value={client} onValueChange={setClient} disabled={uploading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Natura">Natura</SelectItem>
                      <SelectItem value="Oriflame">Oriflame</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
                    ${uploading ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  {isDragActive ? (
                    <p className="text-primary font-medium">Suelta el archivo aquí...</p>
                  ) : (
                    <div>
                      <p className="font-medium mb-1">Arrastra un archivo Excel aquí</p>
                      <p className="text-sm text-muted-foreground">o haz clic para seleccionar</p>
                      <p className="text-xs text-muted-foreground mt-2">Formatos: .xlsx, .xls, .csv</p>
                    </div>
                  )}
                </div>

                {uploading && (
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Procesando archivo...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                )}

                {result && (
                  <div className="mt-4 p-4 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Carga completada</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between p-2 bg-background rounded">
                        <span className="text-muted-foreground">Total filas:</span>
                        <span className="font-medium">{result.summary.totalRows}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-background rounded">
                        <span className="text-muted-foreground">Insertadas:</span>
                        <span className="font-medium text-green-600">{result.summary.insertedRows}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-background rounded">
                        <span className="text-muted-foreground">Duplicados:</span>
                        <span className="font-medium text-yellow-600">{result.summary.duplicateRows}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-background rounded">
                        <span className="text-muted-foreground">Errores:</span>
                        <span className="font-medium text-red-600">{result.summary.errorRows}</span>
                      </div>
                    </div>
                    {result.summary.errors.length > 0 && (
                      <div className="mt-3 p-2 bg-red-50 dark:bg-red-950/20 rounded text-sm">
                        <p className="font-medium text-red-600 mb-1">Errores encontrados:</p>
                        <ul className="list-disc list-inside text-red-600/80 space-y-1">
                          {result.summary.errors.map((err, i) => (
                            <li key={i}>{err}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Button className="mt-4 w-full" onClick={() => router.push("/")}>
                      Ver Dashboard
                    </Button>

                    {result.summary.detectedHeaders && result.summary.detectedHeaders.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Columnas detectadas en el archivo:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.summary.detectedHeaders.map((header) => (
                            <span key={header} className="px-2 py-1 bg-background border rounded text-xs font-mono">
                              {header}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {error && (
                  <div className="mt-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/20">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-600">{error}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estructura esperada del Excel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <p className="text-muted-foreground">Las columnas del archivo Excel deben ser:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {[
                      "Transportadora",
                      "Fecha despacho",
                      "Pedido",
                      "Guia",
                      "Estado",
                      "Fecha",
                      "Novedad",
                      "PE",
                      "Cod Cn",
                      "Nombre Cn",
                      "Departamento",
                      "Ciudad",
                      "Direccion",
                      "Telefono",
                    ].map((col) => (
                      <div key={col} className="flex items-center gap-1 p-1 bg-muted rounded">
                        <span className="font-mono">{col}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-yellow-700 dark:text-yellow-500">
                      Los duplicados se detectan por la combinación de <strong>Pedido + Guía</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload History Section */}
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
        </div>
      </div>
    </div>
  )
}

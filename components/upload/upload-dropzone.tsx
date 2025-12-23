"use client"

import { useDropzone } from "react-dropzone"
import { Upload, FileSpreadsheet, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCallback } from "react"
import { useRouter } from "next/navigation"

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

interface UploadDropzoneProps {
  onDrop: (files: File[]) => void
  uploading: boolean
  progress: number
  result: UploadResult | null
  error: string | null
  client: string
  setClient: (client: string) => void
}

export function UploadDropzone({
  onDrop,
  uploading,
  progress,
  result,
  error,
  client,
  setClient
}: UploadDropzoneProps) {
  const router = useRouter()
  
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
                <SelectItem value="Offcors">Offcors</SelectItem>
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
            <p className="text-muted-foreground">Las columnas del archivo Excel para <strong>{client}</strong> deben ser:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              {client === "Oriflame" ? (
                <>
                  {[
                    "DESTINATARIO",
                    "NÚMERO PEDIDO",
                    "CÓDIGO EMPRESARIA/O",
                    "DIRECCIÓN",
                    "TELEFONO",
                    "CIUDAD",
                    "DEPARTAMENTO",
                    "FECHA INGRESO A R&M",
                    "FECHA DE ENTREGA",
                    "FECHA ENTREGA PROMESA",
                    "DIAS PROMESA",
                    "ESTADO",
                    "NOVEDAD",
                    "NOVEDAD 2",
                  ].map((col) => (
                    <div key={col} className="flex items-center gap-1 p-1 bg-muted rounded">
                      <span className="font-mono">{col}</span>
                    </div>
                  ))}
                </>
              ) : client === "Offcors" ? (
                <>
                  {[
                    "FECHA",
                    "NO. CIERRE DESPACHO",
                    "NO. GUIA HERMECO",
                    "DESTINATARIO",
                    "DIRECCIÓN",
                    "TELÉFONO",
                    "CIUDAD",
                    "DEPARTAMENTO",
                    "NRO. ENTREGA",
                    "CEDULA CLIENTE",
                    "UNIDAD EMBALAJE",
                    "CANAL",
                    "TIPO EMBALAJE",
                    "NOVEDAD DESPACHO",
                    "FECHA DESPACHO",
                    "NUMERO GUIA RYM",
                    "FECHA ENTREGA",
                    "ESTADO",
                    "GUIA SUBIDA RYM",
                    "NOVEDAD ENTREGA",
                    "NOVEDAD 1",
                    "NOVEDAD 2",
                  ].map((col) => (
                    <div key={col} className="flex items-center gap-1 p-1 bg-muted rounded">
                      <span className="font-mono">{col}</span>
                    </div>
                  ))}
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
            <div className="flex items-start gap-2 mt-3 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <p className="text-yellow-700 dark:text-yellow-500">
                {client === "Oriflame" 
                  ? <>Los duplicados se detectan por la combinación de <strong>NÚMERO PEDIDO + GUÍA</strong></>
                  : client === "Offcors"
                  ? <>Los duplicados se detectan por la combinación de <strong>No. Guía Hermeco + Guía RYM</strong></>
                  : <>Los duplicados se detectan por la combinación de <strong>Pedido + Guía</strong></>
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import useSWR from "swr"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UploadHistory } from "@/components/upload/upload-history"
import { UploadDropzone } from "@/components/upload/upload-dropzone"

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
          <UploadDropzone
            onDrop={onDrop}
            uploading={uploading}
            progress={progress}
            result={result}
            error={error}
            client={client}
            setClient={setClient}
          />

          {/* Upload History Section */}
          <UploadHistory uploadHistory={uploadHistory} />
        </div>
      </div>
    </div>
  )
}

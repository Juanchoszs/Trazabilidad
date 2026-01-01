"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ShipmentForm } from "@/components/shipment/shipment-form"
import { ShipmentHistory } from "@/components/shipment/shipment-history"
import { useToast } from "@/components/ui/use-toast"

interface EditPageProps {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    source?: string
  }>
}

function normalizeShipmentForForm(shipment: any, sourceTable: string) {
  if (!shipment) return shipment

  // Helper date function
  const toInputDate = (value: any) => {
    if (!value) return ""

    if (typeof value === "string") {
      const trimmed = value.trim()

      // Match exact YYYY-MM-DD
      const yyyymmddMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
      if (yyyymmddMatch) {
        return trimmed;
      }

      // Match YYYY-MM-DD HH:mm:ss or similar start
      // This handles "2025-12-22 00:00:00" -> "2025-12-22"
      const isoStartMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed)
      if (isoStartMatch) {
        return `${isoStartMatch[1]}-${isoStartMatch[2]}-${isoStartMatch[3]}`
      }

      // Handle d/m/y format or d-m-y
      const ddmmyyyyMatch = /^([0-9]{1,2})[\/\-]([0-9]{1,2})[\/\-]([0-9]{4})$/.exec(trimmed)
      if (ddmmyyyyMatch) {
        const [, dd, mm, yyyy] = ddmmyyyyMatch
        return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
      }
    }

    // Fallback to Date object parsing (be careful of timezone, use UTC parts if input is ISO/Z)
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ""

    // If it's effectively a string like "2025-12-18T05:00:00.000Z", 
    // we want the date component. If it's 5AM UTC, it's 00:00 Colombia.
    // Ideally we want the local representation of that moment in Colombia.
    // BUT Date.toISOString() gives UTC.
    // date.getFullYear() gives local system time (server time).

    // We'll use ISO string slice as a safe default for strictly ISO inputs
    try {
      return date.toISOString().split('T')[0]
    } catch (e) {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }
  }

  return {
    ...shipment,
    estado: shipment.estado?.trim(),
    fecha_ingreso: toInputDate(shipment.fecha_ingreso),
    fecha_entrega: toInputDate(shipment.fecha_entrega),
    fecha_promesa: toInputDate(shipment.fecha_promesa),
    fecha_despacho: toInputDate(shipment.fecha_despacho),
    fecha: toInputDate(shipment.fecha),
  }
}

export default function EditPage({ params, searchParams }: EditPageProps) {
  const resolvedParams = use(params)
  const resolvedSearchParams = use(searchParams)

  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<any>(null)
  const [shipment, setShipment] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Determine source table from search params (default to 'natura')
  const sourceTable = resolvedSearchParams.source || "natura"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/shipments/${resolvedParams.id}?source=${sourceTable}`)
        if (!response.ok) {
          throw new Error("Error al cargar datos")
        }
        const data = await response.json()
        const normalized = normalizeShipmentForForm(data.shipment, sourceTable)
        setShipment(normalized)
        setFormData(normalized)
        setHistory(data.history)
      } catch (error) {
        console.error(error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "No se pudo cargar la información del envío",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [resolvedParams.id, sourceTable, toast])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Find changed fields
      const changes: Record<string, { old: any; new: any }> = {}
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== shipment[key]) {
          changes[key] = {
            old: shipment[key],
            new: formData[key],
          }
        }
      })

      if (Object.keys(changes).length === 0) {
        toast({
          title: "Sin cambios",
          description: "No se detectaron cambios para guardar",
        })
        setIsSubmitting(false)
        return
      }

      const response = await fetch(`/api/shipments/${resolvedParams.id}?source=${sourceTable}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          changes,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar cambios")
      }

      const data = await response.json()
      setShipment(data.shipment)
      setHistory(data.history)

      toast({
        title: "Éxito",
        description: "Los cambios se guardaron correctamente",
      })

      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudieron guardar los cambios",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/shipments/${resolvedParams.id}?source=${sourceTable}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar registro")
      }

      toast({
        title: "Registro eliminado",
        description: "El registro ha sido eliminado exitosamente",
      })

      router.push("/")
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el registro",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!shipment) return null

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Link>

        <div className="grid gap-6 lg:grid-cols-3">
          <ShipmentForm
            sourceTable={sourceTable}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            handleDelete={handleDelete}
            isSubmitting={isSubmitting}
            isDeleting={isDeleting}
            router={router}
          />
          <ShipmentHistory history={history} />
        </div>
      </div>
    </div>
  )
}

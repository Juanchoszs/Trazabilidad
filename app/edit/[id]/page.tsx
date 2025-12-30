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
  if (sourceTable !== "oriflame") return shipment

  const toInputDate = (value: any) => {
    if (!value) return value

    if (typeof value === "string") {
      const trimmed = value.trim()

      const ddmmyyyyMatch = /^([0-9]{2})[\/\-]([0-9]{2})[\/\-]([0-9]{4})$/.exec(trimmed)
      if (ddmmyyyyMatch) {
        const [, dd, mm, yyyy] = ddmmyyyyMatch
        return `${yyyy}-${mm}-${dd}`
      }

      if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(trimmed)) {
        return trimmed
      }
    }

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  return {
    ...shipment,
    fecha_ingreso: toInputDate(shipment.fecha_ingreso),
    fecha_entrega: toInputDate(shipment.fecha_entrega),
    fecha_promesa: toInputDate(shipment.fecha_promesa),
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
          href="/"
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

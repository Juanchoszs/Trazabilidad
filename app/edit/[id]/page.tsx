"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ShipmentForm } from "@/components/shipment/shipment-form"
import { ShipmentHistory } from "@/components/shipment/shipment-history"
import { useToast } from "@/components/ui/use-toast"

interface EditPageProps {
  params: {
    id: string
  }
  searchParams: {
    source?: string
  }
}

export default function EditPage({ params, searchParams }: EditPageProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState<any>(null)
  const [shipment, setShipment] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Determine source table from search params (default to 'natura')
  const sourceTable = searchParams.source || 'natura'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/shipments/${params.id}?source=${sourceTable}`)
        if (!response.ok) {
          throw new Error("Error al cargar datos")
        }
        const data = await response.json()
        setShipment(data.shipment)
        setFormData(data.shipment)
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
  }, [params.id, sourceTable, toast])

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

      const response = await fetch(`/api/shipments/${params.id}?source=${sourceTable}`, {
        method: "PUT",
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
        const response = await fetch(`/api/shipments/${params.id}?source=${sourceTable}`, {
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

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Package, Trash2, History } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Shipment, ShipmentHistory } from "@/lib/db"

export default function EditShipmentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [shipment, setShipment] = useState<Shipment | null>(null)
  const [history, setHistory] = useState<ShipmentHistory[]>([])
  const [formData, setFormData] = useState({
    // Common fields
    guia: "",
    estado: "",
    novedad: "",
    departamento: "",
    ciudad: "",
    direccion: "",
    telefono: "",
    // Natura fields
    transportadora: "",
    fecha_despacho: "",
    pedido: "",
    fecha: "",
    pe: "",
    cod_cn: "",
    nombre_cn: "",
    // ORIFLAME fields
    destinatario: "",
    numero_pedido: "",
    codigo_empresaria: "",
    fecha_ingreso: "",
    fecha_entrega: "",
    fecha_promesa: "",
    dias_promesa: "",
    novedad2: "",
  })
  const [sourceTable, setSourceTable] = useState<'natura' | 'oriflame' | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shipmentRes, historyRes] = await Promise.all([
          fetch(`/api/shipments/${id}`),
          fetch(`/api/shipments/${id}/history`),
        ])

        if (!shipmentRes.ok) throw new Error("Error al cargar envío")

        const data = await shipmentRes.json()
        setShipment(data)

        const formatDate = (date: string | null) => {
          if (!date) return ""
          return new Date(date).toISOString().split("T")[0]
        }

        // Detect source table
        const isOriflame = data.source_table === 'oriflame' || data.cliente === 'Oriflame'
        setSourceTable(isOriflame ? 'oriflame' : 'natura')

        setFormData({
          // Common fields
          guia: data.guia || "",
          estado: data.estado ? data.estado.trim().toUpperCase() : "",
          novedad: data.novedad || "",
          departamento: data.departamento || "",
          ciudad: data.ciudad || "",
          direccion: data.direccion || "",
          telefono: data.telefono || "",
          // Natura fields
          transportadora: data.transportadora || "",
          fecha_despacho: formatDate(data.fecha_despacho),
          pedido: data.pedido || "",
          fecha: formatDate(data.fecha),
          pe: data.pe || "",
          cod_cn: data.cod_cn || "",
          nombre_cn: data.nombre_cn || "",
          // ORIFLAME fields
          destinatario: data.destinatario || "",
          numero_pedido: data.numero_pedido || "",
          codigo_empresaria: data.codigo_empresaria || "",
          fecha_ingreso: formatDate(data.fecha_ingreso),
          fecha_entrega: formatDate(data.fecha_entrega),
          fecha_promesa: formatDate(data.fecha_promesa),
          dias_promesa: data.dias_promesa?.toString() || "",
          novedad2: data.novedad2 || "",
        })

        if (historyRes.ok) {
          const historyData = await historyRes.json()
          setHistory(historyData)
        }
      } catch (error) {
        console.error("Error:", error)
        alert("Error al cargar el envío")
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/shipments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fecha_despacho: formData.fecha_despacho || null,
          fecha: formData.fecha || null,
        }),
      })

      if (!response.ok) throw new Error("Error al actualizar envío")

      router.push("/")
    } catch (error) {
      console.error("Error:", error)
      alert("Error al actualizar el envío. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este envío?")) return

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/shipments/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Error al eliminar envío")
      router.push("/")
    } catch (error) {
      console.error("Error:", error)
      alert("Error al eliminar el envío.")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
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
          {/* Main Form */}
          <Card className="lg:col-span-2 border-border shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground">
                  <Package className="h-6 w-6 text-background" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Editar Registro</CardTitle>
                  <CardDescription>
                    Pedido: {formData.pedido} | Guía: {formData.guia}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1: Different fields for ORIFLAME vs Natura */}
                {sourceTable === 'oriflame' ? (
                  /* ORIFLAME Form */
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="guia">Guía</Label>
                      <Input
                        id="guia"
                        value={formData.guia}
                        onChange={(e) => setFormData({ ...formData, guia: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="destinatario">Destinatario</Label>
                      <Input
                        id="destinatario"
                        value={formData.destinatario}
                        onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="numero_pedido">Número Pedido</Label>
                      <Input
                        id="numero_pedido"
                        value={formData.numero_pedido}
                        onChange={(e) => setFormData({ ...formData, numero_pedido: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="codigo_empresaria">Código Empresaria/o</Label>
                      <Input
                        id="codigo_empresaria"
                        value={formData.codigo_empresaria}
                        onChange={(e) => setFormData({ ...formData, codigo_empresaria: e.target.value })}
                      />
                    </div>
                  </div>
                ) : (
                  /* NATURA Form */
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="transportadora">Transportadora</Label>
                      <Input
                        id="transportadora"
                        value={formData.transportadora}
                        onChange={(e) => setFormData({ ...formData, transportadora: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fecha_despacho">Fecha Despacho</Label>
                      <Input
                        id="fecha_despacho"
                        type="date"
                        value={formData.fecha_despacho}
                        onChange={(e) => setFormData({ ...formData, fecha_despacho: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pedido">Pedido</Label>
                      <Input
                        id="pedido"
                        value={formData.pedido}
                        onChange={(e) => setFormData({ ...formData, pedido: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guia">Guía</Label>
                      <Input
                        id="guia"
                        value={formData.guia}
                        onChange={(e) => setFormData({ ...formData, guia: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Row 2: Estado, Dates, Novedad */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                  <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Estado y Novedad
                  </h3>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={formData.estado}
                        onValueChange={(value) => setFormData({ ...formData, estado: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {(sourceTable === 'oriflame'
                            ? ["PENDIENTE", "ENTREGADO"]
                            : [
                                "PENDIENTE",
                                "EN TRANSITO",
                                "EN REPARTO",
                                "ENTREGADO",
                                "NO ENTREGADO",
                                "DEVOLUCION",
                              ]
                          ).map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {sourceTable === 'oriflame' ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="fecha_ingreso">Fecha Ingreso R&M</Label>
                          <Input
                            id="fecha_ingreso"
                            type="date"
                            value={formData.fecha_ingreso}
                            onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fecha_entrega">Fecha Entrega</Label>
                          <Input
                            id="fecha_entrega"
                            type="date"
                            value={formData.fecha_entrega}
                            onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fecha_promesa">Fecha Promesa</Label>
                          <Input
                            id="fecha_promesa"
                            type="date"
                            value={formData.fecha_promesa}
                            onChange={(e) => setFormData({ ...formData, fecha_promesa: e.target.value })}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="fecha">Fecha</Label>
                        <Input
                          id="fecha"
                          type="date"
                          value={formData.fecha}
                          onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="novedad">Novedad</Label>
                      <Input
                        id="novedad"
                        value={formData.novedad}
                        onChange={(e) => setFormData({ ...formData, novedad: e.target.value })}
                      />
                    </div>
                    {sourceTable === 'oriflame' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="dias_promesa">Días Promesa</Label>
                          <Input
                            id="dias_promesa"
                            type="number"
                            value={formData.dias_promesa}
                            onChange={(e) => setFormData({ ...formData, dias_promesa: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="novedad2">Novedad 2</Label>
                          <Input
                            id="novedad2"
                            value={formData.novedad2}
                            onChange={(e) => setFormData({ ...formData, novedad2: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Row 3: PE, Cod Cn, Nombre Cn - Natura only */}
                {sourceTable !== 'oriflame' && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="pe">PE</Label>
                      <Input
                        id="pe"
                        value={formData.pe}
                        onChange={(e) => setFormData({ ...formData, pe: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cod_cn">Cod Cn</Label>
                      <Input
                        id="cod_cn"
                        value={formData.cod_cn}
                        onChange={(e) => setFormData({ ...formData, cod_cn: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nombre_cn">Nombre Cn</Label>
                      <Input
                        id="nombre_cn"
                        value={formData.nombre_cn}
                        onChange={(e) => setFormData({ ...formData, nombre_cn: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Row 4: Departamento, Ciudad, Dirección, Teléfono */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Input
                      id="departamento"
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-between pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isDeleting || isSubmitting}
                    className="border-red-300 text-red-600 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleting ? "Eliminando..." : "Eliminar"}
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/")}
                      disabled={isSubmitting || isDeleting}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || isDeleting}
                      className="bg-foreground text-background hover:bg-foreground/90"
                    >
                      {isSubmitting ? "Guardando..." : "Guardar Cambios"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* History Sidebar */}
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
        </div>
      </div>
    </div>
  )
}

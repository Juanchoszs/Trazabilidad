"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Package } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    transportadora: "",
    fecha_despacho: "",
    pedido: "",
    guia: "",
    estado: "PENDIENTE",
    fecha: "",
    novedad: "",
    pe: "",
    cod_cn: "",
    nombre_cn: "",
    departamento: "",
    ciudad: "",
    direccion: "",
    telefono: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fecha_despacho: formData.fecha_despacho || null,
          fecha: formData.fecha || null,
        }),
      })

      if (!response.ok) throw new Error("Error al crear envío")

      router.push("/")
    } catch (error) {
      console.error("Error:", error)
      alert("Error al registrar el envío. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Link>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground">
                <Package className="h-6 w-6 text-background" />
              </div>
              <div>
                <CardTitle className="text-2xl">Registrar Nuevo Envío</CardTitle>
                <CardDescription>Complete los datos del paquete para agregarlo a la matriz madre</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Transportadora, Fecha despacho, Pedido, Guía */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Identificación</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="transportadora">Transportadora *</Label>
                    <Input
                      id="transportadora"
                      required
                      placeholder="REMESAS Y MENSAJES"
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
                    <Label htmlFor="pedido">Pedido *</Label>
                    <Input
                      id="pedido"
                      required
                      placeholder="25850796"
                      value={formData.pedido}
                      onChange={(e) => setFormData({ ...formData, pedido: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="guia">Guía *</Label>
                    <Input
                      id="guia"
                      required
                      placeholder="2320168"
                      value={formData.guia}
                      onChange={(e) => setFormData({ ...formData, guia: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Estado, Fecha, Novedad, PE */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Estado</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input
                      id="estado"
                      placeholder="ENTREGADO"
                      value={formData.estado}
                      onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="novedad">Novedad</Label>
                    <Input
                      id="novedad"
                      placeholder="Descripción de la novedad"
                      value={formData.novedad}
                      onChange={(e) => setFormData({ ...formData, novedad: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: PE, Cod Cn, Nombre Cn */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Cliente</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="pe">PE</Label>
                    <Input
                      id="pe"
                      placeholder="4"
                      value={formData.pe}
                      onChange={(e) => setFormData({ ...formData, pe: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cod_cn">Cod Cn</Label>
                    <Input
                      id="cod_cn"
                      placeholder="1169507"
                      value={formData.cod_cn}
                      onChange={(e) => setFormData({ ...formData, cod_cn: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombre_cn">Nombre Cn</Label>
                    <Input
                      id="nombre_cn"
                      placeholder="JACKELIN NATALIA SANDOVAL"
                      value={formData.nombre_cn}
                      onChange={(e) => setFormData({ ...formData, nombre_cn: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Departamento, Ciudad, Dirección, Teléfono */}
              <div className="space-y-4">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Ubicación</h3>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Input
                      id="departamento"
                      placeholder="ARAUCA"
                      value={formData.departamento}
                      onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ciudad">Ciudad</Label>
                    <Input
                      id="ciudad"
                      placeholder="ARAUCA"
                      value={formData.ciudad}
                      onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      placeholder="CL 16 BIS #28-29"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      placeholder="3015280967"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => router.push("/")} disabled={isSubmitting}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-foreground text-background hover:bg-foreground/90"
                >
                  {isSubmitting ? "Registrando..." : "Registrar Envío"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

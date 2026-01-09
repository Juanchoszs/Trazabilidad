"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Trash2 } from "lucide-react"

import { NaturaForm } from "./forms/natura-form"
import { OriflameForm } from "./forms/oriflame-form"
import { OffcorsForm } from "./forms/offcors-form"

interface ShipmentFormProps {
  sourceTable: string
  formData: any
  setFormData: (data: any) => void
  handleSubmit: (e: React.FormEvent) => void
  handleDelete: () => void
  isSubmitting: boolean
  isDeleting: boolean
  router: any
}

export function ShipmentForm({
  sourceTable,
  formData,
  setFormData,
  handleSubmit,
  handleDelete,
  isSubmitting,
  isDeleting,
  router
}: ShipmentFormProps) {
  return (
    <Card className="lg:col-span-2 border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-foreground">
            <Package className="h-6 w-6 text-background" />
          </div>
          <div>
            <CardTitle className="text-2xl">Editar Registro</CardTitle>
            <CardDescription>
              {sourceTable === 'natura' && `Pedido: ${formData.pedido || ''} | Guía: ${formData.guia || ''}`}
              {sourceTable === 'oriflame' && `Pedido: ${formData.numero_pedido || ''} | Guía: ${formData.guia || ''}`}
              {sourceTable === 'offcors' && `Entrega: ${formData.nro_entrega || ''} | Guía RYM: ${formData.numero_guia_rym || ''}`}
              {!['natura', 'oriflame', 'offcors'].includes(sourceTable || '') && "Detalles del envío"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Dispatcher logic for specific tables */}
          {sourceTable === 'natura' && <NaturaForm formData={formData} setFormData={setFormData} />}
          {sourceTable === 'oriflame' && <OriflameForm formData={formData} setFormData={setFormData} />}
          {sourceTable === 'offcors' && <OffcorsForm formData={formData} setFormData={setFormData} />}

          {/* Row 4: Shared Fields (Address, Phone) + State/Novedad Section */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Ubicación y Estado
            </h3>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="departamento">Departamento</Label>
                <Input
                  id="departamento"
                  value={formData.departamento || ''}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ciudad">Ciudad</Label>
                <Input
                  id="ciudad"
                  value={formData.ciudad || ''}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion || ''}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono || ''}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <div className="space-y-2">
                <Label htmlFor="estado">Estado Actual</Label>
                <Select
                  value={formData.estado || ''}
                  onValueChange={(value) => setFormData({ ...formData, estado: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {(sourceTable === 'oriflame'
                      ? ["PENDIENTE", "ENTREGADO"]
                      : sourceTable === 'offcors'
                        ? ["PENDIENTE", "ENTREGADO", "NOVEDAD"]
                        : [
                          "PENDIENTE",
                          "EN TRANSITO",
                          "EN REPARTO",
                          "ENTREGADO",
                        ]
                    ).concat(
                      (formData.estado && ![
                        "PENDIENTE", "ENTREGADO", "NOVEDAD", "EN TRANSITO", "EN REPARTO"
                      ].includes(formData.estado)) ? [formData.estado] : []
                    ).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="novedad">Novedad</Label>
                <Input
                  id="novedad"
                  value={formData.novedad || ''}
                  onChange={(e) => setFormData({ ...formData, novedad: e.target.value })}
                />
              </div>
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
  )
}

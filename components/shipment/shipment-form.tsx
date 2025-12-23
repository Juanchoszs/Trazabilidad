"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Trash2 } from "lucide-react"

interface ShipmentFormProps {
  sourceTable: string
  formData: any
  setFormData: (data: any) => void
  handleSubmit: (e: React.FormEvent) => void
  handleDelete: () => void
  isSubmitting: boolean
  isDeleting: boolean
  router: any // Pass router or handle cancel efficiently
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
          {/* Row 1: Different fields for ORIFLAME vs Natura vs Offcors */}
          {sourceTable === 'oriflame' ? (
            /* ORIFLAME Form */
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="guia">Guía</Label>
                <Input
                  id="guia"
                  value={formData.guia || ''}
                  onChange={(e) => setFormData({ ...formData, guia: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinatario">Destinatario</Label>
                <Input
                  id="destinatario"
                  value={formData.destinatario || ''}
                  onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_pedido">Número Pedido</Label>
                <Input
                  id="numero_pedido"
                  value={formData.numero_pedido || ''}
                  onChange={(e) => setFormData({ ...formData, numero_pedido: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo_empresaria">Código Empresaria/o</Label>
                <Input
                  id="codigo_empresaria"
                  value={formData.codigo_empresaria || ''}
                  onChange={(e) => setFormData({ ...formData, codigo_empresaria: e.target.value })}
                />
              </div>
            </div>
          ) : sourceTable === 'offcors' ? (
            /* OFFCORS Form */
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha || ''}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="no_cierre_despacho">No. Cierre Despacho</Label>
                <Input
                  id="no_cierre_despacho"
                  value={formData.no_cierre_despacho || ''}
                  onChange={(e) => setFormData({ ...formData, no_cierre_despacho: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="no_guia_hermeco">No. Guía Hermeco</Label>
                <Input
                  id="no_guia_hermeco"
                  value={formData.no_guia_hermeco || ''}
                  onChange={(e) => setFormData({ ...formData, no_guia_hermeco: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numero_guia_rym">Guía RYM</Label>
                <Input
                  id="numero_guia_rym"
                  value={formData.numero_guia_rym || ''}
                  onChange={(e) => setFormData({ ...formData, numero_guia_rym: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destinatario">Destinatario</Label>
                <Input
                  id="destinatario"
                  value={formData.destinatario || ''}
                  onChange={(e) => setFormData({ ...formData, destinatario: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nro_entrega">Nro. Entrega</Label>
                <Input
                  id="nro_entrega"
                  value={formData.nro_entrega || ''}
                  onChange={(e) => setFormData({ ...formData, nro_entrega: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cedula_cliente">Cédula Cliente</Label>
                <Input
                  id="cedula_cliente"
                  value={formData.cedula_cliente || ''}
                  onChange={(e) => setFormData({ ...formData, cedula_cliente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidad_embalaje">Unidades</Label>
                <Input
                  id="unidad_embalaje"
                  type="number"
                  value={formData.unidad_embalaje || ''}
                  onChange={(e) => setFormData({ ...formData, unidad_embalaje: e.target.value })}
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
                  value={formData.transportadora || ''}
                  onChange={(e) => setFormData({ ...formData, transportadora: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_despacho">Fecha Despacho</Label>
                <Input
                  id="fecha_despacho"
                  type="date"
                  value={formData.fecha_despacho || ''}
                  onChange={(e) => setFormData({ ...formData, fecha_despacho: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pedido">Pedido</Label>
                <Input
                  id="pedido"
                  value={formData.pedido || ''}
                  onChange={(e) => setFormData({ ...formData, pedido: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guia">Guía</Label>
                <Input
                  id="guia"
                  value={formData.guia || ''}
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
                      value={formData.fecha_ingreso || ''}
                      onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_entrega">Fecha Entrega</Label>
                    <Input
                      id="fecha_entrega"
                      type="date"
                      value={formData.fecha_entrega || ''}
                      onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_promesa">Fecha Promesa</Label>
                    <Input
                      id="fecha_promesa"
                      type="date"
                      value={formData.fecha_promesa || ''}
                      onChange={(e) => setFormData({ ...formData, fecha_promesa: e.target.value })}
                    />
                  </div>
                </>
              ) : sourceTable === 'offcors' ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_despacho">Fecha Despacho</Label>
                    <Input
                      id="fecha_despacho"
                      type="date"
                      value={formData.fecha_despacho || ''}
                      onChange={(e) => setFormData({ ...formData, fecha_despacho: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha_entrega">Fecha Entrega</Label>
                    <Input
                      id="fecha_entrega"
                      type="date"
                      value={formData.fecha_entrega || ''}
                      onChange={(e) => setFormData({ ...formData, fecha_entrega: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guia_subida_rym">Guía Subida RYM</Label>
                    <Select
                      value={formData.guia_subida_rym || ''}
                      onValueChange={(value) => setFormData({ ...formData, guia_subida_rym: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Si/No" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SI">SI</SelectItem>
                        <SelectItem value="NO">NO</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="fecha">Fecha</Label>
                  <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha || ''}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="novedad">Novedad</Label>
                <Input
                  id="novedad"
                  value={formData.novedad || ''}
                  onChange={(e) => setFormData({ ...formData, novedad: e.target.value })}
                />
              </div>
            </div>

            {sourceTable === 'oriflame' && (
              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="dias_promesa">Días Promesa</Label>
                  <Input
                    id="dias_promesa"
                    type="number"
                    value={formData.dias_promesa || ''}
                    onChange={(e) => setFormData({ ...formData, dias_promesa: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novedad2">Novedad 2</Label>
                  <Input
                    id="novedad2"
                    value={formData.novedad2 || ''}
                    onChange={(e) => setFormData({ ...formData, novedad2: e.target.value })}
                  />
                </div>
              </div>
            )}

            {sourceTable === 'offcors' && (
              <div className="grid gap-4 md:grid-cols-3 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="canal">Canal</Label>
                  <Input id="canal" value={formData.canal || ''} onChange={(e) => setFormData({ ...formData, canal: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo_embalaje">Tipo Embalaje</Label>
                  <Input id="tipo_embalaje" value={formData.tipo_embalaje || ''} onChange={(e) => setFormData({ ...formData, tipo_embalaje: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novedad_despacho">Novedad Despacho</Label>
                  <Input id="novedad_despacho" value={formData.novedad_despacho || ''} onChange={(e) => setFormData({ ...formData, novedad_despacho: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novedad_entrega">Novedad Entrega</Label>
                  <Input id="novedad_entrega" value={formData.novedad_entrega || ''} onChange={(e) => setFormData({ ...formData, novedad_entrega: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novedad_1">Novedad 1</Label>
                  <Input id="novedad_1" value={formData.novedad_1 || ''} onChange={(e) => setFormData({ ...formData, novedad_1: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novedad_2">Novedad 2</Label>
                  <Input id="novedad_2" value={formData.novedad_2 || ''} onChange={(e) => setFormData({ ...formData, novedad_2: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          {/* Row 3: PE, Cod Cn, Nombre Cn - Natura only */}
          {sourceTable === 'natura' && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pe">PE</Label>
                <Input
                  id="pe"
                  value={formData.pe || ''}
                  onChange={(e) => setFormData({ ...formData, pe: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cod_cn">Cod Cn</Label>
                <Input
                  id="cod_cn"
                  value={formData.cod_cn || ''}
                  onChange={(e) => setFormData({ ...formData, cod_cn: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre_cn">Nombre Cn</Label>
                <Input
                  id="nombre_cn"
                  value={formData.nombre_cn || ''}
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

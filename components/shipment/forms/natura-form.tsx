"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface NaturaFormProps {
    formData: any
    setFormData: (data: any) => void
}

export function NaturaForm({ formData, setFormData }: NaturaFormProps) {
    return (
        <>
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
                        // Ensure we use the date part if it's an ISO string, although normalization handled it
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

            <div className="grid gap-4 md:grid-cols-3 mt-4">
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

            {/* Additional Date field that Natura sometimes uses for status updates */}
            <div className="space-y-2 mt-4">
                <Label htmlFor="fecha">Fecha (Cambio Estado)</Label>
                <Input
                    id="fecha"
                    type="date"
                    value={formData.fecha || ''}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
                <p className="text-[0.8rem] text-muted-foreground">
                    Fecha registrada en el último reporte de estado.
                </p>
            </div>
        </>
    )
}

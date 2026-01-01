"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface OffcorsFormProps {
    formData: any
    setFormData: (data: any) => void
}

export function OffcorsForm({ formData, setFormData }: OffcorsFormProps) {
    return (
        <>
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

            <div className="p-4 rounded-lg bg-muted/50 space-y-4 mt-6">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Detalles de Entrega
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
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
                </div>

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
            </div>
        </>
    )
}

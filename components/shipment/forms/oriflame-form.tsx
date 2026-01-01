"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OriflameFormProps {
    formData: any
    setFormData: (data: any) => void
}

export function OriflameForm({ formData, setFormData }: OriflameFormProps) {
    return (
        <>
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

            <div className="p-4 rounded-lg bg-muted/50 space-y-4 mt-6">
                <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                    Fechas y Seguimiento
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
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
                </div>

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
            </div>
        </>
    )
}


import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit } from "lucide-react"
import Link from "next/link"
import React from "react"
import { ExportColumn, fmtDate } from "@/lib/excel-export"

// --- Headers ---
export const OriflameHeaders = () => (
    <>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Guía</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Destinatario</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Número Pedido</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Código Empresaria/o</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Dirección</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Teléfono</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ciudad</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Departamento</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha Ingreso R&M</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha Entrega</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha Promesa</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Días Promesa</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Estado</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Novedad</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Novedad 2</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground sticky right-0 bg-muted z-10 shadow-[-5px_0px_10px_-5px_rgba(0,0,0,0.1)]">Acciones</th>
    </>
)

// --- Row ---
export const OriflameRow = ({ 
    shipment, 
    isSelected, 
    onToggle, 
    estadoBadge 
}: { 
    shipment: any, 
    isSelected: boolean, 
    onToggle: () => void, 
    estadoBadge: { label: string, color: string } 
}) => {
    return (
        <tr className={`border-b hover:bg-muted/50 transition-colors group ${isSelected ? 'bg-blue-50/50' : ''}`}>
             <td className="py-3 px-2">
                <Checkbox 
                checked={isSelected} 
                onCheckedChange={onToggle}
                />
            </td>
            <td className="py-3 px-2 font-mono text-xs">{shipment.guia || "-"}</td>
            <td className="py-3 px-2 max-w-[120px] truncate text-xs" title={shipment.destinatario || shipment.nombre_cn || ""}>{shipment.destinatario || shipment.nombre_cn || "-"}</td>
            <td className="py-3 px-2 font-mono text-xs">{shipment.numero_pedido || shipment.pedido || "-"}</td>
            <td className="py-3 px-2 font-mono text-xs">{shipment.codigo_empresaria || shipment.cod_cn || "-"}</td>
            <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.direccion || ""}>{shipment.direccion || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.telefono || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.ciudad || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.departamento || "-"}</td>
            <td className="py-3 px-2 text-xs">{fmtDate(shipment.fecha_ingreso || shipment.fecha_despacho)}</td>
            <td className="py-3 px-2 text-xs">{fmtDate(shipment.fecha_entrega || shipment.fecha)}</td>
            <td className="py-3 px-2 text-xs">{fmtDate(shipment.fecha_promesa)}</td>
            <td className="py-3 px-2 text-xs">{shipment.dias_promesa || shipment.pe || "-"}</td>
            <td className="py-3 px-2">
                <Badge className={`${estadoBadge.color} border-0 text-xs`}>{estadoBadge.label}</Badge>
            </td>
            <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad || ""}>{shipment.novedad || "-"}</td>
            <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad2 || ""}>{shipment.novedad2 || "-"}</td>
            
            <td className="py-3 px-2 sticky right-0 bg-background group-hover:bg-muted transition-colors z-10 shadow-[-5px_0px_10px_-5px_rgba(0,0,0,0.1)]">
                <Link href={`/edit/${shipment.id}?source=oriflame`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                </Button>
                </Link>
            </td>
        </tr>
    )
}

// --- Export Config ---
export const oriflameExportColumns: ExportColumn[] = [
    { header: "GUIA", key: "guia" },
    { header: "Destinatario", key: "destinatario", format: (s) => s.destinatario || s.nombre_cn },
    { header: "Numero Pedido", key: "numero_pedido", format: (s) => s.numero_pedido || s.pedido },
    { header: "Codigo empresaria/o", key: "codigo_empresaria", format: (s) => s.codigo_empresaria || s.cod_cn },
    { header: "Direccion", key: "direccion" },
    { header: "Telefono", key: "telefono" },
    { header: "CIUDAD", key: "ciudad" },
    { header: "Departamento", key: "departamento" },
    { header: "Fecha ingreso R&M", key: "fecha_ingreso", format: (s) => fmtDate(s.fecha_ingreso || s.fecha_despacho) },
    { header: "Fecha entrega", key: "fecha_entrega", format: (s) => fmtDate(s.fecha_entrega || s.fecha) },
    { header: "Fecha entrega promesa", key: "fecha_promesa", format: (s) => fmtDate(s.fecha_promesa) },
    { header: "DIAS PROMESA", key: "dias_promesa", format: (s) => s.dias_promesa || s.pe },
    { header: "ESTADO", key: "estado" },
    { header: "NOVEDAD", key: "novedad" },
    { header: "NOVEDAD 2", key: "novedad2", format: (s) => s.novedad2 || s.novedad_2 }
]


import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit } from "lucide-react"
import Link from "next/link"
import React from "react"
import { ExportColumn, fmtDate } from "@/lib/excel-export"

// --- Headers ---
export const OffcorsHeaders = () => (
    <>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">No. Cierre</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">No. Guía Hermeco</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Destinatario</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Dirección</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Teléfono</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ciudad</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Depto</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nro. Entrega</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cedula Cliente</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Unidades</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Canal</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Embalaje</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Novedad Despacho</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha Despacho</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Guía RYM</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha Entrega</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Estado</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Guía Subida RYM</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Novedad Entrega</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Novedad 1</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Novedad 2</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground sticky right-0 bg-muted z-10 shadow-[-5px_0px_10px_-5px_rgba(0,0,0,0.1)]">Acciones</th>
    </>
)

// --- Row ---
export const OffcorsRow = ({ 
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
            <td className="py-3 px-2 text-xs">{fmtDate(shipment.fecha)}</td>
            <td className="py-3 px-2 text-xs">{shipment.no_cierre_despacho || "-"}</td>
            <td className="py-3 px-2 font-mono text-xs">{shipment.pedido || "-"}</td>
            <td className="py-3 px-2 max-w-[120px] truncate text-xs" title={shipment.nombre_cn || ""}>{shipment.nombre_cn || "-"}</td>
            <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.direccion || ""}>{shipment.direccion || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.telefono || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.ciudad || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.departamento || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.nro_entrega || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.cod_cn || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.unidad_embalaje || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.pe || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.tipo_embalaje || "-"}</td>
            <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad || ""}>{shipment.novedad || "-"}</td>
            <td className="py-3 px-2 text-xs">{fmtDate(shipment.fecha_despacho)}</td>
            <td className="py-3 px-2 font-mono text-xs">{shipment.guia || "-"}</td>
            <td className="py-3 px-2 text-xs">{fmtDate(shipment.fecha_entrega)}</td>
            <td className="py-3 px-2">
                <Badge className={`${estadoBadge.color} border-0 text-xs`}>{estadoBadge.label}</Badge>
            </td>
            <td className="py-3 px-2 text-xs">{shipment.guia_subida_rym || "-"}</td>
            <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad_entrega || ""}>{shipment.novedad_entrega || "-"}</td>
            <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad_1 || ""}>{shipment.novedad_1 || "-"}</td>
            <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad_2 || ""}>{shipment.novedad_2 || "-"}</td>
            
            <td className="py-3 px-2 sticky right-0 bg-background group-hover:bg-muted transition-colors z-10 shadow-[-5px_0px_10px_-5px_rgba(0,0,0,0.1)]">
                <Link href={`/edit/${shipment.id}`}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Edit className="h-4 w-4" />
                </Button>
                </Link>
            </td>
        </tr>
    )
}

// --- Export Config ---
export const offcorsExportColumns: ExportColumn[] = [
    { header: "FECHA", key: "fecha", format: (s) => fmtDate(s.fecha) },
    { header: "NO. CIERRE DESPACHO", key: "no_cierre_despacho" },
    { header: "NO. GUIA HERMECO", key: "no_guia_hermeco", format: (s) => s.no_guia_hermeco || s.pedido },
    { header: "DESTINATARIO", key: "destinatario", format: (s) => s.destinatario || s.nombre_cn },
    { header: "DIRECCIÓN", key: "direccion" },
    { header: "TELÉFONO", key: "telefono" },
    { header: "CIUDAD", key: "ciudad" },
    { header: "DEPARTAMENTO", key: "departamento" },
    { header: "NRO. ENTREGA", key: "nro_entrega" },
    { header: "CEDULA CLIENTE", key: "cedula_cliente", format: (s) => s.cedula_cliente || s.cod_cn },
    { header: "UNIDAD EMBALAJE", key: "unidad_embalaje" },
    { header: "CANAL", key: "canal" },
    { header: "TIPO EMBALAJE", key: "tipo_embalaje" },
    { header: "NOVEDAD DESPACHO", key: "novedad_despacho" },
    { header: "FECHA DESPACHO", key: "fecha_despacho", format: (s) => fmtDate(s.fecha_despacho) },
    { header: "NUMERO GUIA RYM", key: "numero_guia_rym", format: (s) => s.numero_guia_rym || s.guia },
    { header: "FECHA ENTREGA", key: "fecha_entrega", format: (s) => fmtDate(s.fecha_entrega) },
    { header: "ESTADO", key: "estado" },
    { header: "GUIA SUBIDA RYM", key: "guia_subida_rym" },
    { header: "NOVEDAD ENTREGA", key: "novedad_entrega" },
    { header: "NOVEDAD 1", key: "novedad_1", format: (s) => s.novedad_1 || s.novedad },
    { header: "NOVEDAD 2", key: "novedad_2", format: (s) => s.novedad_2 || s.novedad2 }
]

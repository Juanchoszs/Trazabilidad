
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit } from "lucide-react"
import Link from "next/link"
import React from "react"
import { ExportColumn, fmtDate } from "@/lib/excel-export"

// --- Headers ---
export const NaturaHeaders = () => (
    <>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Transportadora</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha Despacho</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Pedido</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Guía</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Estado</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Novedad</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">PE</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cod Cn</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nombre Cn</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Departamento</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ciudad</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Dirección</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground">Teléfono</th>
      <th className="text-left py-3 px-2 font-medium text-muted-foreground sticky right-0 bg-muted z-10 shadow-[-5px_0px_10px_-5px_rgba(0,0,0,0.1)]">Acciones</th>
    </>
)

// --- Row ---
export const NaturaRow = ({ 
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
            <td className="py-3 px-2 text-xs">{shipment.transportadora || "-"}</td>
            <td className="py-3 px-2 text-xs">{fmtDate(shipment.fecha_despacho)}</td>
            <td className="py-3 px-2 font-mono text-xs">{shipment.pedido || "-"}</td>
            <td className="py-3 px-2 font-mono text-xs">{shipment.guia || "-"}</td>
            <td className="py-3 px-2">
                <Badge className={`${estadoBadge.color} border-0 text-xs`}>{estadoBadge.label}</Badge>
            </td>
            <td className="py-3 px-2 text-xs">{fmtDate(shipment.fecha)}</td>
            <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad || ""}>{shipment.novedad || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.pe || "-"}</td>
            <td className="py-3 px-2 font-mono text-xs">{shipment.cod_cn || "-"}</td>
            <td className="py-3 px-2 max-w-[120px] truncate text-xs" title={shipment.nombre_cn || ""}>{shipment.nombre_cn || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.departamento || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.ciudad || "-"}</td>
            <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.direccion || ""}>{shipment.direccion || "-"}</td>
            <td className="py-3 px-2 text-xs">{shipment.telefono || "-"}</td>
            
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
export const naturaExportColumns: ExportColumn[] = [
    { header: "Transportadora", key: "transportadora" },
    { header: "Fecha despacho", key: "fecha_despacho", format: (s) => fmtDate(s.fecha_despacho) },
    { header: "Pedido", key: "pedido" },
    { header: "Guia", key: "guia" },
    { header: "Estado", key: "estado" },
    { header: "Fecha", key: "fecha", format: (s) => fmtDate(s.fecha) },
    { header: "Novedad", key: "novedad" },
    { header: "PE", key: "pe" },
    { header: "Cod Cn", key: "cod_cn" },
    { header: "Nombre Cn", key: "nombre_cn" },
    { header: "Departamento", key: "departamento" },
    { header: "Ciudad", key: "ciudad" },
    { header: "Direccion", key: "direccion" },
    { header: "Telefono", key: "telefono" }
]

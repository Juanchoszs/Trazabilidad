"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Filter, Edit, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import Link from "next/link"

interface DataTableProps {
  shipments: any[]
}

// Map estado values to badge colors
function getEstadoBadge(estado: string | null) {
  if (!estado) return { label: "PENDIENTE", color: "bg-neutral-100 text-neutral-700" }

  const estadoUpper = estado.toUpperCase()

  if (estadoUpper.includes("ENTREGADO")) return { label: estado, color: "bg-green-100 text-green-700" }
  if (estadoUpper.includes("FALLIDO") || estadoUpper.includes("RECHAZADO"))
    return { label: estado, color: "bg-red-100 text-red-700" }
  if (estadoUpper.includes("DEVUEL")) return { label: estado, color: "bg-yellow-100 text-yellow-700" }
  if (estadoUpper.includes("PERDIDO") || estadoUpper.includes("EXTRAVIADO"))
    return { label: estado, color: "bg-neutral-400 text-white" }
  if (estadoUpper.includes("TRANSITO") || estadoUpper.includes("CAMINO"))
    return { label: estado, color: "bg-blue-100 text-blue-700" }

  return { label: estado, color: "bg-neutral-100 text-neutral-700" }
}

const ITEMS_PER_PAGE = 20

export function DataTable({ shipments }: DataTableProps) {
  const [transportadoraFilter, setTransportadoraFilter] = useState("Todas")
  const [estadoFilter, setEstadoFilter] = useState("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const transportadoras = useMemo(() => {
    const unique = Array.from(new Set(shipments.map((s) => s.transportadora).filter(Boolean)))
    return ["Todas", ...unique.sort()]
  }, [shipments])

  const estados = useMemo(() => {
    // If a specific company is selected, show its allowed statuses
    if (transportadoraFilter === "Oriflame") {
      return ["Todos", "PENDIENTE", "ENTREGADO", "NOVEDAD 1", "NOVEDAD 2", "DEVOLUCION"]
    }
    if (transportadoraFilter === "REMESAS Y MENSAJES") {
      return ["Todos", "EN REPARTO", "EN TRANSITO", "ENTREGADO", "DEVOLUCION"]
    }

    // Default: Show unique values from data + Special Filters
    const unique = Array.from(new Set(shipments.map((s) => s.estado).filter(Boolean)))
    return ["Todos", ...unique.sort(), "NOVEDAD 1", "NOVEDAD 2"]
  }, [shipments, transportadoraFilter])

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      // Direct match
      const transportadoraMatch = transportadoraFilter === "Todas" || shipment.transportadora === transportadoraFilter

      let estadoMatch = true
      if (estadoFilter !== "Todos") {
        if (estadoFilter === "NOVEDAD 1") {
          estadoMatch = !!shipment.novedad && shipment.novedad.trim() !== ""
        } else if (estadoFilter === "NOVEDAD 2") {
          estadoMatch = !!shipment.novedad2 && shipment.novedad2.trim() !== ""
        } else {
          estadoMatch = shipment.estado === estadoFilter
        }
      }

      const searchLower = searchQuery.toLowerCase()
      const searchMatch =
        !searchQuery ||
        (shipment.pedido && shipment.pedido.toLowerCase().includes(searchLower)) ||
        (shipment.guia && shipment.guia.toLowerCase().includes(searchLower)) ||
        (shipment.nombre_cn && shipment.nombre_cn.toLowerCase().includes(searchLower)) ||
        (shipment.ciudad && shipment.ciudad.toLowerCase().includes(searchLower)) ||
        (shipment.nombre_cn && shipment.nombre_cn.toLowerCase().includes(searchLower)) ||
        (shipment.ciudad && shipment.ciudad.toLowerCase().includes(searchLower)) ||
        (shipment.cod_cn && shipment.cod_cn.toLowerCase().includes(searchLower)) ||
        (shipment.novedad && shipment.novedad.toLowerCase().includes(searchLower)) ||
        (shipment.novedad2 && shipment.novedad2.toLowerCase().includes(searchLower))

      return transportadoraMatch && estadoMatch && searchMatch
    })
  }, [shipments, transportadoraFilter, estadoFilter, searchQuery])

  const totalPages = Math.ceil(filteredShipments.length / ITEMS_PER_PAGE)
  const paginatedShipments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredShipments.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredShipments, currentPage])

  // Reset page when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [transportadoraFilter, estadoFilter, searchQuery])

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Matriz Madre - Trazabilidad</h2>
          <p className="text-sm text-muted-foreground">
            {filteredShipments.length} registros
            {filteredShipments.length !== shipments.length && ` de ${shipments.length} total`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar Excel
          </Button>
          <Button variant="outline" size="sm" className="gap-2 bg-transparent">
            <FileText className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por pedido, guía, nombre, código CN o ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={transportadoraFilter} onValueChange={setTransportadoraFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Transportadora" />
            </SelectTrigger>
            <SelectContent>
              {transportadoras.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Select value={estadoFilter} onValueChange={setEstadoFilter}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {estados.map((e) => (
              <SelectItem key={e} value={e}>
                {e}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Transportadora</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha Despacho</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Pedido</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Guía</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Estado</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Fecha</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Novedad</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Novedad 2</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">PE</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Cod Cn</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Nombre Cn</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Departamento</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ciudad</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Dirección</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground">Teléfono</th>
              <th className="text-left py-3 px-2 font-medium text-muted-foreground sticky right-0 bg-muted z-10 shadow-[-5px_0px_10px_-5px_rgba(0,0,0,0.1)]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedShipments.length === 0 ? (
              <tr>
                <td colSpan={15} className="py-12 text-center text-muted-foreground">
                  No hay envíos registrados
                </td>
              </tr>
            ) : (
              paginatedShipments.map((shipment) => {
                const estadoBadge = getEstadoBadge(shipment.estado)
                const fechaDespacho = shipment.fecha_despacho
                  ? new Date(shipment.fecha_despacho).toLocaleDateString("es-CO")
                  : "-"
                const fecha = shipment.fecha ? new Date(shipment.fecha).toLocaleDateString("es-CO") : "-"

                return (
                  <tr key={shipment.id} className="border-b hover:bg-muted/50 transition-colors group">
                    <td className="py-3 px-2 text-xs">{shipment.transportadora || "-"}</td>
                    <td className="py-3 px-2 text-xs">{fechaDespacho}</td>
                    <td className="py-3 px-2 font-mono text-xs">{shipment.pedido || "-"}</td>
                    <td className="py-3 px-2 font-mono text-xs">{shipment.guia || "-"}</td>
                    <td className="py-3 px-2">
                      <Badge className={`${estadoBadge.color} border-0 text-xs`}>{estadoBadge.label}</Badge>
                    </td>
                    <td className="py-3 px-2 text-xs">{fecha}</td>
                    <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad || ""}>
                      {shipment.novedad || "-"}
                    </td>
                    <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad2 || ""}>
                      {shipment.novedad2 || "-"}
                    </td>
                    <td className="py-3 px-2 text-xs">{shipment.pe || "-"}</td>
                    <td className="py-3 px-2 font-mono text-xs">{shipment.cod_cn || "-"}</td>
                    <td className="py-3 px-2 max-w-[120px] truncate text-xs" title={shipment.nombre_cn || ""}>
                      {shipment.nombre_cn || "-"}
                    </td>
                    <td className="py-3 px-2 text-xs">{shipment.departamento || "-"}</td>
                    <td className="py-3 px-2 text-xs">{shipment.ciudad || "-"}</td>
                    <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.direccion || ""}>
                      {shipment.direccion || "-"}
                    </td>
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
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

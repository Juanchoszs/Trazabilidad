"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Filter, Search, ChevronLeft, ChevronRight, CheckSquare, XCircle } from "lucide-react"
import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"

import { exportToExcel } from "@/lib/excel-export"
import { NaturaHeaders, NaturaRow, naturaExportColumns } from "./data-table/companies/natura"
import { OriflameHeaders, OriflameRow, oriflameExportColumns } from "./data-table/companies/oriflame"
import { OffcorsHeaders, OffcorsRow, offcorsExportColumns } from "./data-table/companies/offcors"

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

interface DataTableProps {
  shipments: any[]
}

export function DataTable({ shipments }: DataTableProps) {
  const [transportadoraFilter, setTransportadoraFilter] = useState("Natura")
  const [estadoFilter, setEstadoFilter] = useState("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Select Strategy based on filter
  const strategy = useMemo(() => {
    if (transportadoraFilter === "Oriflame") {
        return { Headers: OriflameHeaders, Row: OriflameRow, exportCols: oriflameExportColumns }
    }
    if (transportadoraFilter === "Offcors") {
        return { Headers: OffcorsHeaders, Row: OffcorsRow, exportCols: offcorsExportColumns }
    }
    // Default / Natura
    return { Headers: NaturaHeaders, Row: NaturaRow, exportCols: naturaExportColumns }
  }, [transportadoraFilter])

  const toggleAll = (checked: boolean) => {
    if (checked) {
      const allIds = paginatedShipments.map((s) => s.id)
      setSelectedIds(new Set(allIds))
    } else {
      setSelectedIds(new Set())
    }
  }

  const toggleOne = (id: number) => {
    const next = new Set(selectedIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedIds(next)
  }

  const transportadoras = useMemo(() => {
    const unique = Array.from(new Set(shipments.map((s) => s.transportadora).filter(Boolean)))
    // Map "REMESAS Y MENSAJES" to "Natura" for the filter list
    const mapped = unique.map(t => t === "REMESAS Y MENSAJES" ? "Natura" : t)
    const sorted = Array.from(new Set(mapped)).sort()
    return sorted
  }, [shipments])

  const estados = useMemo(() => {
    // If a specific company is selected, show its allowed statuses
    if (transportadoraFilter === "Oriflame") {
      return ["Todos", "PENDIENTE", "ENTREGADO", "NOVEDAD 1", "NOVEDAD 2", "DEVOLUCION"]
    }
    if (transportadoraFilter === "Natura") {
      return ["Todos", "EN TRANSITO", "EN REPARTO", "ENTREGADO", "DEVOLUCION", "NOVEDAD"]
    }
    if (transportadoraFilter === "Offcors") {
      return ["Todos", "PENDIENTE", "ENTREGADO", "NOVEDAD"]
    }

    // Default: Show unique values from data + Special Filters
    const unique = Array.from(new Set(shipments.map((s) => s.estado).filter(Boolean)))
    // Filter out FALLIDO and PERDIDO if they are likely Natura records mixed in
    return ["Todos", ...unique.filter(e => e !== "FALLIDO" && e !== "PERDIDO").sort(), "NOVEDAD", "NOVEDAD 1", "NOVEDAD 2"]
  }, [shipments, transportadoraFilter])

  const filteredShipments = useMemo(() => {
    return shipments.filter((shipment) => {
      // Direct match handling renaming
      const isNaturaFilter = transportadoraFilter === "Natura"
      const transportadoraMatch = 
        transportadoraFilter === "Todas" || 
        (isNaturaFilter && shipment.transportadora === "REMESAS Y MENSAJES") ||
        (!isNaturaFilter && shipment.transportadora === transportadoraFilter)

      let estadoMatch = true
      if (estadoFilter !== "Todos") {
        if (estadoFilter === "NOVEDAD" || estadoFilter === "NOVEDAD 1") {
          estadoMatch = !!shipment.novedad && shipment.novedad.trim() !== ""
        } else if (estadoFilter === "NOVEDAD 2") {
          estadoMatch = !!shipment.novedad2 && shipment.novedad2.trim() !== ""
        } else {
          // Case insensitive match with trim
          estadoMatch = shipment.estado?.trim().toUpperCase() === estadoFilter.trim().toUpperCase()
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

  // Reset selection when filters or page change
  useMemo(() => {
    setSelectedIds(new Set())
    setCurrentPage(1)
  }, [transportadoraFilter, estadoFilter, searchQuery])

  useMemo(() => {
    setSelectedIds(new Set())
  }, [currentPage])

  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleBulkUpdate = async (newStatus: string) => {
    setIsUpdating(true)
    try {
      const response = await fetch("/api/shipments/bulk-update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          status: newStatus,
          company: transportadoraFilter
        }),
      })

      if (!response.ok) throw new Error("Error en la actualización masiva")

      setSelectedIds(new Set())
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Error al actualizar registros")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleExportExcel = () => {
    let dataToExport = filteredShipments
    
    // Sort Oriflame by fecha_ingreso (oldest to newest from 2025)
    if (transportadoraFilter === "Oriflame") {
      dataToExport = [...filteredShipments].sort((a, b) => {
        const dateA = new Date(a.fecha_ingreso || a.fecha_despacho || 0)
        const dateB = new Date(b.fecha_ingreso || b.fecha_despacho || 0)
        return dateA.getTime() - dateB.getTime() // Ascending (oldest first)
      })
    }
    
    const fileName = `Trazabilidad_${transportadoraFilter}_${new Date().toISOString().split('T')[0]}.xlsx`
    exportToExcel(
      fileName,
      dataToExport,
      strategy.exportCols,
      transportadoraFilter === "Oriflame" ? { applyOriflameStyles: true } : undefined,
    )
  }

  return (
    <Card className="p-6 relative">
      {/* Floating Bulk Action Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white border shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 border-r pr-4">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-sm whitespace-nowrap">
              {selectedIds.size} seleccionados
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Cambiar estado a:</span>
            <div className="flex gap-1">
              {(transportadoraFilter === "Oriflame" 
                ? ["PENDIENTE", "ENTREGADO"]
                : ["PENDIENTE", "EN TRANSITO", "EN REPARTO", "ENTREGADO", "DEVOLUCION"]
              ).map((status) => (
                <Button 
                  key={status}
                  variant="outline" 
                  size="sm" 
                  className="rounded-full text-[10px] h-7 px-3 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200"
                  onClick={() => handleBulkUpdate(status)}
                  disabled={isUpdating}
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full h-8 w-8 p-0"
            onClick={() => setSelectedIds(new Set())}
          >
            <XCircle className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold">Matriz Madre - Trazabilidad</h2>
          <p className="text-sm text-muted-foreground">
            {filteredShipments.length} registros
            {filteredShipments.length !== shipments.length && ` de ${shipments.length} total`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2 bg-transparent" onClick={handleExportExcel}>
            <Download className="h-4 w-4" />
            Exportar Excel
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
              <th className="w-10 py-3 px-2">
                <Checkbox 
                  checked={paginatedShipments.length > 0 && selectedIds.size === paginatedShipments.length}
                  onCheckedChange={toggleAll}
                />
              </th>
              {strategy && <strategy.Headers />}
            </tr>
          </thead>
          <tbody>
            {paginatedShipments.length === 0 ? (
              <tr>
                <td colSpan={16} className="py-12 text-center text-muted-foreground">
                  No hay envíos registrados
                </td>
              </tr>
            ) : (
              paginatedShipments.map((shipment) => (
                <strategy.Row
                  key={shipment.id}
                  shipment={shipment}
                  isSelected={selectedIds.has(shipment.id)}
                  onToggle={() => toggleOne(shipment.id)}
                  estadoBadge={getEstadoBadge(shipment.estado)}
                />
              ))
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

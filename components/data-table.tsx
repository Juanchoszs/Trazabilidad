"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Filter, Edit, Search, ChevronLeft, ChevronRight, CheckSquare } from "lucide-react"
import { useState, useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, XCircle } from "lucide-react"
import * as XLSX from "xlsx"

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
  const [transportadoraFilter, setTransportadoraFilter] = useState("Natura")
  const [estadoFilter, setEstadoFilter] = useState("Todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

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

  // Determine if Novedad 2 column should be shown (Only hidden for Natura)
  const showNovedad2 = transportadoraFilter !== "Natura" && transportadoraFilter !== "REMESAS Y MENSAJES"

  const handleExportExcel = () => {
    // Define headers and mapping based on selected company
    let headers: string[] = []
    let dataToExport: any[] = []
    
    // Helper to format date consistent with import expectations
    const fmtDate = (dateVal: any) => {
        if (!dateVal) return "";
        return new Date(dateVal).toLocaleDateString("es-CO");
    }

    if (transportadoraFilter === "Oriflame") {
      headers = [
        "GUÍA", "DESTINATARIO", "NÚMERO PEDIDO", "CÓDIGO EMPRESARIA/O", 
        "DIRECCIÓN", "TELÉFONO", "CIUDAD", "DEPARTAMENTO", 
        "FECHA INGRESO A R&M", "FECHA DE ENTREGA", "FECHA ENTREGA PROMESA", 
        "DÍAS PROMESA", "ESTADO", "NOVEDAD", "NOVEDAD 2"
      ]
      
      dataToExport = filteredShipments.map(s => ({
        "GUÍA": s.guia,
        "DESTINATARIO": s.destinatario || s.nombre_cn,
        "NÚMERO PEDIDO": s.numero_pedido || s.pedido,
        "CÓDIGO EMPRESARIA/O": s.codigo_empresaria || s.cod_cn,
        "DIRECCIÓN": s.direccion,
        "TELÉFONO": s.telefono,
        "CIUDAD": s.ciudad,
        "DEPARTAMENTO": s.departamento,
        "FECHA INGRESO A R&M": fmtDate(s.fecha_ingreso || s.fecha_despacho),
        "FECHA DE ENTREGA": fmtDate(s.fecha_entrega || s.fecha),
        "FECHA ENTREGA PROMESA": fmtDate(s.fecha_promesa),
        "DÍAS PROMESA": s.dias_promesa || s.pe,
        "ESTADO": s.estado,
        "NOVEDAD": s.novedad,
        "NOVEDAD 2": s.novedad2
      }))
    } else if (transportadoraFilter === "Offcors") {
      headers = [
        "FECHA", "NO. CIERRE DESPACHO", "NO. GUIA HERMECO", "DESTINATARIO",
        "DIRECCIÓN", "TELÉFONO", "CIUDAD", "DEPARTAMENTO", "NRO. ENTREGA",
        "CEDULA CLIENTE", "UNIDAD EMBALAJE", "CANAL", "TIPO EMBALAJE", 
        "NOVEDAD DESPACHO", "FECHA DESPACHO", "NUMERO GUIA RYM", 
        "FECHA ENTREGA", "ESTADO", "GUIA SUBIDA RYM", 
        "NOVEDAD ENTREGA", "NOVEDAD 1", "NOVEDAD 2"
      ]

      dataToExport = filteredShipments.map(s => ({
        "FECHA": fmtDate(s.fecha),
        "NO. CIERRE DESPACHO": s.no_cierre_despacho,
        "NO. GUIA HERMECO": s.no_guia_hermeco || s.pedido, // Fallback if mixed
        "DESTINATARIO": s.destinatario || s.nombre_cn,
        "DIRECCIÓN": s.direccion,
        "TELÉFONO": s.telefono,
        "CIUDAD": s.ciudad,
        "DEPARTAMENTO": s.departamento,
        "NRO. ENTREGA": s.nro_entrega,
        "CEDULA CLIENTE": s.cedula_cliente || s.cod_cn,
        "UNIDAD EMBALAJE": s.unidad_embalaje,
        "CANAL": s.canal,
        "TIPO EMBALAJE": s.tipo_embalaje,
        "NOVEDAD DESPACHO": s.novedad_despacho,
        "FECHA DESPACHO": fmtDate(s.fecha_despacho),
        "NUMERO GUIA RYM": s.numero_guia_rym || s.guia,
        "FECHA ENTREGA": fmtDate(s.fecha_entrega),
        "ESTADO": s.estado,
        "GUIA SUBIDA RYM": s.guia_subida_rym,
        "NOVEDAD ENTREGA": s.novedad_entrega,
        "NOVEDAD 1": s.novedad_1 || s.novedad,
        "NOVEDAD 2": s.novedad_2 || s.novedad2
      }))
    } else {
      // Natura / Default
      headers = [
        "Transportadora", "Fecha despacho", "Pedido", "Guia", "Estado", 
        "Fecha", "Novedad", "PE", "Cod Cn", "Nombre Cn", 
        "Departamento", "Ciudad", "Direccion", "Telefono"
      ]

      dataToExport = filteredShipments.map(s => ({
        "Transportadora": s.transportadora,
        "Fecha despacho": fmtDate(s.fecha_despacho),
        "Pedido": s.pedido,
        "Guia": s.guia,
        "Estado": s.estado,
        "Fecha": fmtDate(s.fecha),
        "Novedad": s.novedad,
        "PE": s.pe,
        "Cod Cn": s.cod_cn,
        "Nombre Cn": s.nombre_cn,
        "Departamento": s.departamento,
        "Ciudad": s.ciudad,
        "Direccion": s.direccion,
        "Telefono": s.telefono
      }))
    }

    // Generate worksheet
    const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: headers })
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Trazabilidad")
    
    // Save file
    const fileName = `Trazabilidad_${transportadoraFilter}_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(workbook, fileName)
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
              {transportadoraFilter === "Oriflame" ? (
                /* ORIFLAME Column Headers - matching Excel structure */
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
              ) : transportadoraFilter === "Offcors" ? (
                /* OFFCORS Column Headers */
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
              ) : (
                /* NATURA Column Headers */
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
              )}
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
              paginatedShipments.map((shipment) => {
                const estadoBadge = getEstadoBadge(shipment.estado)
                const formatDate = (date: string | null) => 
                  date ? new Date(date).toLocaleDateString("es-CO") : "-"

                return (
                  <tr key={shipment.id} className={`border-b hover:bg-muted/50 transition-colors group ${selectedIds.has(shipment.id) ? 'bg-blue-50/50' : ''}`}>
                    <td className="py-3 px-2">
                      <Checkbox 
                        checked={selectedIds.has(shipment.id)} 
                        onCheckedChange={() => toggleOne(shipment.id)}
                      />
                    </td>
                    {transportadoraFilter === "Oriflame" ? (
                      /* ORIFLAME Row Data - matching Excel structure */
                      <>
                        <td className="py-3 px-2 font-mono text-xs">{shipment.guia || "-"}</td>
                        <td className="py-3 px-2 max-w-[120px] truncate text-xs" title={shipment.destinatario || shipment.nombre_cn || ""}>{shipment.destinatario || shipment.nombre_cn || "-"}</td>
                        <td className="py-3 px-2 font-mono text-xs">{shipment.numero_pedido || shipment.pedido || "-"}</td>
                        <td className="py-3 px-2 font-mono text-xs">{shipment.codigo_empresaria || shipment.cod_cn || "-"}</td>
                        <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.direccion || ""}>{shipment.direccion || "-"}</td>
                        <td className="py-3 px-2 text-xs">{shipment.telefono || "-"}</td>
                        <td className="py-3 px-2 text-xs">{shipment.ciudad || "-"}</td>
                        <td className="py-3 px-2 text-xs">{shipment.departamento || "-"}</td>
                        <td className="py-3 px-2 text-xs">{formatDate(shipment.fecha_ingreso || shipment.fecha_despacho)}</td>
                        <td className="py-3 px-2 text-xs">{formatDate(shipment.fecha_entrega || shipment.fecha)}</td>
                        <td className="py-3 px-2 text-xs">{formatDate(shipment.fecha_promesa)}</td>
                        <td className="py-3 px-2 text-xs">{shipment.dias_promesa || shipment.pe || "-"}</td>
                        <td className="py-3 px-2">
                          <Badge className={`${estadoBadge.color} border-0 text-xs`}>{estadoBadge.label}</Badge>
                        </td>
                        <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad || ""}>{shipment.novedad || "-"}</td>
                        <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad2 || ""}>{shipment.novedad2 || "-"}</td>
                      </>
                    ) : transportadoraFilter === "Offcors" ? (
                      /* OFFCORS Row Data */
                      <>
                        <td className="py-3 px-2 text-xs">{formatDate(shipment.fecha)}</td>
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
                        <td className="py-3 px-2 text-xs">{formatDate(shipment.fecha_despacho)}</td>
                        <td className="py-3 px-2 font-mono text-xs">{shipment.guia || "-"}</td>
                        <td className="py-3 px-2 text-xs">{formatDate(shipment.fecha_entrega)}</td>
                        <td className="py-3 px-2">
                          <Badge className={`${estadoBadge.color} border-0 text-xs`}>{estadoBadge.label}</Badge>
                        </td>
                        <td className="py-3 px-2 text-xs">{shipment.guia_subida_rym || "-"}</td>
                        <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad_entrega || ""}>{shipment.novedad_entrega || "-"}</td>
                        <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad_1 || ""}>{shipment.novedad_1 || "-"}</td>
                        <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad_2 || ""}>{shipment.novedad_2 || "-"}</td>
                      </>
                    ) : (
                      /* NATURA Row Data */
                      <>
                        <td className="py-3 px-2 text-xs">{shipment.transportadora || "-"}</td>
                        <td className="py-3 px-2 text-xs">{formatDate(shipment.fecha_despacho)}</td>
                        <td className="py-3 px-2 font-mono text-xs">{shipment.pedido || "-"}</td>
                        <td className="py-3 px-2 font-mono text-xs">{shipment.guia || "-"}</td>
                        <td className="py-3 px-2">
                          <Badge className={`${estadoBadge.color} border-0 text-xs`}>{estadoBadge.label}</Badge>
                        </td>
                        <td className="py-3 px-2 text-xs">{formatDate(shipment.fecha)}</td>
                        <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.novedad || ""}>{shipment.novedad || "-"}</td>
                        <td className="py-3 px-2 text-xs">{shipment.pe || "-"}</td>
                        <td className="py-3 px-2 font-mono text-xs">{shipment.cod_cn || "-"}</td>
                        <td className="py-3 px-2 max-w-[120px] truncate text-xs" title={shipment.nombre_cn || ""}>{shipment.nombre_cn || "-"}</td>
                        <td className="py-3 px-2 text-xs">{shipment.departamento || "-"}</td>
                        <td className="py-3 px-2 text-xs">{shipment.ciudad || "-"}</td>
                        <td className="py-3 px-2 max-w-[100px] truncate text-xs" title={shipment.direccion || ""}>{shipment.direccion || "-"}</td>
                        <td className="py-3 px-2 text-xs">{shipment.telefono || "-"}</td>
                      </>
                    )}
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

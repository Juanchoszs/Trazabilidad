import { useState, useMemo } from "react"

export function useShipmentFiltering(shipments: any[], itemsPerPage = 20) {
    const [transportadoraFilter, setTransportadoraFilter] = useState("Natura")
    const [estadoFilter, setEstadoFilter] = useState("Todos")
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)

    // Memoized Transportadoras
    const transportadoras = useMemo(() => {
        const unique = Array.from(new Set(shipments.map((s) => s.transportadora).filter(Boolean)))
        // Map "REMESAS Y MENSAJES" to "Natura" for the filter list
        const mapped = unique.map(t => t === "REMESAS Y MENSAJES" ? "Natura" : t)
        const sorted = Array.from(new Set(mapped)).sort()
        return sorted
    }, [shipments])

    // Memoized Estados based on selection
    const estados = useMemo(() => {
        // If a specific company is selected, show its allowed statuses
        if (transportadoraFilter === "Oriflame") {
            return ["Todos", "PENDIENTE", "ENTREGADO", "NOVEDAD 1", "NOVEDAD 2", "DEVOLUCION"]
        }
        if (transportadoraFilter === "Natura") {
            return ["Todos", "EN TRANSITO", "EN REPARTO", "ENTREGADO", "NOVEDAD"]
        }
        if (transportadoraFilter === "Offcors") {
            return ["Todos", "PENDIENTE", "ENTREGADO", "NOVEDAD"]
        }

        // Default: Show unique values from data + Special Filters
        const unique = Array.from(new Set(shipments.map((s) => s.estado).filter(Boolean)))
        // Filter out FALLIDO and PERDIDO if they are likely Natura records mixed in
        return ["Todos", ...unique.filter(e => e !== "FALLIDO" && e !== "PERDIDO").sort(), "NOVEDAD", "NOVEDAD 1", "NOVEDAD 2"]
    }, [shipments, transportadoraFilter])

    // Filtering Logic
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

    // Simple Pagination
    const totalPages = Math.ceil(filteredShipments.length / itemsPerPage)
    const paginatedShipments = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredShipments.slice(start, start + itemsPerPage)
    }, [filteredShipments, currentPage, itemsPerPage])

    return {
        transportadoraFilter,
        setTransportadoraFilter,
        estadoFilter,
        setEstadoFilter,
        searchQuery,
        setSearchQuery,
        currentPage,
        setCurrentPage,
        transportadoras,
        estados,
        filteredShipments,
        paginatedShipments,
        totalPages
    }
}

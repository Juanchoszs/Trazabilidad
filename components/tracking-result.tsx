"use client"

import { useState, useRef, useEffect } from "react"
import { formatToColombiaTime } from "@/lib/date-utils"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Circle, Truck, Package, Clock, AlertTriangle, FileImage, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Shipment {
    guia: string
    pedido: string
    destinatario: string
    direccion: string
    ciudad: string
    departamento: string
    estado: string
    fecha_despacho: string
    fecha_entrega: string
    transportadora: string
    servicio: string
    novedad: string
}

interface HistoryItem {
    id: number
    estado: string
    novedad: string
    created_at: string | Date
}

interface TrackingResultProps {
    data: {
        shipment: Shipment
        history: HistoryItem[]
    }
}

export function TrackingResult({ data }: TrackingResultProps) {
    const { shipment, history } = data
    const [showImage, setShowImage] = useState(false)
    const [imageLoading, setImageLoading] = useState(false)
    const [imageError, setImageError] = useState(false)

    // Verificar si es una guía de Natura (más robusto)
    const isNatura = Boolean(
        (shipment.servicio && (
            shipment.servicio.toLowerCase() === 'natura' ||
            shipment.servicio === 'Natura'
        )) ||
        (shipment.transportadora && shipment.transportadora.toLowerCase().includes('natura'))
    )

    const getStatusColor = (status: string) => {
        if (!status) return "bg-gray-500"
        const s = status.toLowerCase()
        if (s.includes("entregado")) return "bg-green-500"
        if (s.includes("pendiente")) return "bg-yellow-500"
        if (s.includes("transito") || s.includes("camino") || s.includes("reparto")) return "bg-blue-500"
        if (s.includes("novedad") || s.includes("fallido") || s.includes("devuelto") || s.includes("devolucion")) return "bg-red-500"
        return "bg-gray-500"
    }

    const handleToggleImage = () => {
        if (!showImage) {
            setImageLoading(true)
            setImageError(false)
            // Forzar recarga al mostrar
            setTimeout(() => {
                const img = document.querySelector(`img[alt="Guía ${shipment.guia || 'N/A'}"]`) as HTMLImageElement
                if (img) {
                    img.src = `/api/tracking/${encodeURIComponent(shipment.guia || '')}/image?t=${Date.now()}`
                }
            }, 100)
        } else {
            setImageLoading(false)
            setImageError(false)
        }
        setShowImage(!showImage)
    }

    return (
        <div className="space-y-6 w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="border-none shadow-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm overflow-hidden">
                <div className={`h-2 w-full ${getStatusColor(shipment.estado)}`} />
                <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Guía de Rastreo</p>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{shipment.guia}</h2>
                        </div>
                        <Badge className={`text-base px-4 py-1 hover:bg-opacity-90 ${getStatusColor(shipment.estado).replace('bg-', 'bg-')}`}>
                            {shipment.estado}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Package className="h-5 w-5 text-orange-600" />
                                Detalles del Envío
                            </h3>
                            <div className="grid grid-cols-2 gap-y-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Pedido</p>
                                    <p className="font-medium">{shipment.pedido || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Transportadora</p>
                                    <p className="font-medium">{shipment.transportadora || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Fecha Despacho</p>
                                    <p className="font-medium">{shipment.fecha_despacho ? typeof shipment.fecha_despacho === 'string' ? shipment.fecha_despacho.split('T')[0] : shipment.fecha_despacho : "N/A"}</p>
                                </div>

                                {/* Hide Fecha Entrega for Natura/General as requested. 
                                    Oriflame might still need it, but user asked to remove it "por que para eso esta el apartado de historial".
                                    SAFE: Hide it globally or conditionally if needed. User "recuerda que esto es unicamente natura". 
                                    We will hide it if it looks like Natura (has 'pe' or 'cod_cn' field) OR just generally as requested.
                                    Let's hide it generally since history covers it, or specific to logic. 
                                    User said "la fecha de entrega quitalo".
                                */}
                                {shipment.transportadora !== 'REMESAS Y MENSAJES' && ( // Quick heuristic or just remove
                                    /* Actually user said "unicamente natura". Natura usuall has 'transportadora' field. */
                                    /* Let's strictly check if NOT natura before showing, or just comment out */
                                    null
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                <Truck className="h-5 w-5 text-orange-600" />
                                Destino
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Destinatario</p>
                                    <p className="font-medium text-base">{shipment.destinatario || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Dirección</p>
                                    <p className="font-medium">{shipment.direccion || "N/A"}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Ciudad / Dept</p>
                                    <p className="font-medium">{shipment.ciudad} {shipment.departamento && `, ${shipment.departamento}`}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator className="my-8" />

                    {/* Sección de imagen de guía para Natura */}
                    {isNatura && (
                        <>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-lg flex items-center gap-2">
                                        <FileImage className="h-5 w-5 text-orange-600" />
                                        Visualización de Guía
                                    </h3>
                                    <Button
                                        onClick={handleToggleImage}
                                        variant="outline"
                                        size="sm"
                                        className="flex items-center gap-2"
                                    >
                                        {showImage ? (
                                            <>
                                                Ocultar Imagen
                                            </>
                                        ) : (
                                            <>
                                                {imageLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                                Ver Imagen de Guía
                                            </>
                                        )}
                                    </Button>
                                </div>
                                
                                {showImage && (
                                    <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                                        {imageLoading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 z-10">
                                                <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
                                            </div>
                                        )}
                                        {imageError ? (
                                            <div className="p-8 text-center text-muted-foreground">
                                                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
                                                <p className="mb-2">Error al cargar la imagen de la guía</p>
                                                <Button
                                                    onClick={() => {
                                                        setImageError(false)
                                                        setImageLoading(true)
                                                        // Forzar recarga
                                                        const img = document.querySelector(`img[alt="Guía ${shipment.guia}"]`) as HTMLImageElement
                                                        if (img) {
                                                            img.src = `/api/tracking/${encodeURIComponent(shipment.guia)}/image?t=${Date.now()}`
                                                        }
                                                    }}
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Reintentar
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="relative w-full" style={{ minHeight: '400px' }}>
                                                <img
                                                    key={`guia-img-${shipment.guia}-${showImage}`}
                                                    src={`/api/tracking/${encodeURIComponent(shipment.guia || '')}/image?t=${Date.now()}`}
                                                    alt={`Guía ${shipment.guia || 'N/A'}`}
                                                    className="w-full h-auto"
                                                    onLoad={(e) => {
                                                        console.log('Imagen cargada exitosamente:', shipment.guia)
                                                        setImageLoading(false)
                                                        setImageError(false)
                                                    }}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement
                                                        console.error('Error cargando imagen de guía:', shipment.guia)
                                                        console.error('URL intentada:', target.src)
                                                        console.error('Error event:', e)
                                                        setImageLoading(false)
                                                        setImageError(true)
                                                    }}
                                                    style={{ 
                                                        display: imageError ? 'none' : 'block',
                                                        maxWidth: '100%',
                                                        height: 'auto'
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <Separator className="my-8" />
                        </>
                    )}

                    <div className="space-y-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-600" />
                            Historial de Estados
                        </h3>

                        <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-800 space-y-8">
                            {history.map((item, idx) => (
                                <div key={idx} className="relative">
                                    <div className="absolute -left-[29px] top-1 h-3 w-3 rounded-full bg-orange-600 border-4 border-white dark:border-gray-900 shadow-sm" />
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                        <div>
                                            <p className="font-semibold text-base">{item.estado}</p>
                                            {item.novedad && (
                                                <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1">
                                                    <span className="inline-block mt-0.5"><AlertTriangle className="h-3 w-3" /></span>
                                                    {item.novedad}
                                                </p>
                                            )}
                                        </div>
                                        <time className="text-xs text-muted-foreground font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded self-start sm:self-auto">
                                            {formatToColombiaTime(item.created_at)}
                                        </time>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {history.length === 0 && (
                            <p className="text-muted-foreground italic">No hay historial disponible recientemente.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

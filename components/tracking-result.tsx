"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, Circle, Truck, Package, Clock, AlertTriangle } from "lucide-react"

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

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase() || ""
        if (s.includes("entregado")) return "bg-green-500"
        if (s.includes("pendiente")) return "bg-yellow-500"
        if (s.includes("transito") || s.includes("camino") || s.includes("reparto")) return "bg-blue-500"
        if (s.includes("novedad") || s.includes("fallido") || s.includes("devuelto") || s.includes("devolucion")) return "bg-red-500"
        return "bg-gray-500"
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
                                            {(() => {
                                                const d = item.created_at;
                                                let dateObj: Date;

                                                try {
                                                    if (d instanceof Date) {
                                                        dateObj = d;
                                                    } else {
                                                        const s = String(d).trim();
                                                        // Parse YYYY-MM-DD HH:mm:ss directly to local time components
                                                        const match = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/);

                                                        if (match) {
                                                            const year = parseInt(match[1], 10);
                                                            const month = parseInt(match[2], 10) - 1;
                                                            const day = parseInt(match[3], 10);
                                                            const hour = match[4] ? parseInt(match[4], 10) : 0;
                                                            const minute = match[5] ? parseInt(match[5], 10) : 0;
                                                            const second = match[6] ? parseInt(match[6], 10) : 0;
                                                            // Adjust to Colombia (UTC-5): Subtract 10 hours to fix double offset
                                                            dateObj = new Date(year, month, day, hour - 10, minute, second);
                                                        } else {
                                                            // Fallback
                                                            dateObj = new Date(s);
                                                            dateObj.setHours(dateObj.getHours() - 10);
                                                        }
                                                    }

                                                    // Format: "jueves, 1 de enero de 2026, 3:56 p.m."
                                                    return dateObj.toLocaleDateString('es-CO', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: 'numeric',
                                                        minute: '2-digit',
                                                        hour12: true
                                                    });
                                                } catch (e) {
                                                    return String(d);
                                                }
                                            })()}
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

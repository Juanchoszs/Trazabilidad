import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { ensureTables } from "@/lib/db-schema"
import { generateNaturaGuiaImage } from "@/lib/guia-image-generator"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ guia: string }> }
) {
    try {
        const { guia } = await params

        // Validar que la guía existe
        if (!guia || typeof guia !== 'string' || guia.trim() === '') {
            return NextResponse.json(
                { error: "Número de guía inválido" },
                { status: 400 }
            )
        }

        await ensureTables()
        
        // Buscar solo en Natura (según requerimiento)
        const natura = await sql`
            SELECT * FROM natura_shipments 
            WHERE guia = ${guia.trim()} OR pedido = ${guia.trim()} 
            LIMIT 1
        `

        if (!natura || natura.length === 0) {
            // Retornar imagen de error en lugar de JSON
            try {
                const { createCanvas } = await import('@napi-rs/canvas')
                const errorCanvas = createCanvas(600, 200)
                const errorCtx = errorCanvas.getContext('2d')
                
                errorCtx.fillStyle = '#FFFFFF'
                errorCtx.fillRect(0, 0, 600, 200)
                errorCtx.fillStyle = '#FF6B35'
                errorCtx.font = 'bold 20px Arial'
                errorCtx.fillText('Guía no encontrada', 50, 80)
                errorCtx.fillStyle = '#666666'
                errorCtx.font = '16px Arial'
                errorCtx.fillText(`Guía: ${guia}`, 50, 120)
                
                const errorBuffer = errorCanvas.toBuffer('image/png')
                
                return new NextResponse(errorBuffer, {
                    status: 404,
                    headers: {
                        'Content-Type': 'image/png',
                        'Cache-Control': 'no-cache'
                    }
                })
            } catch (canvasError) {
                return NextResponse.json(
                    { error: "Guía de Natura no encontrada" },
                    { status: 404 }
                )
            }
        }

        const shipment = natura[0]

        // Validar que la guía existe en el shipment
        if (!shipment.guia) {
            // Retornar imagen de error
            try {
                const { createCanvas } = await import('@napi-rs/canvas')
                const errorCanvas = createCanvas(600, 200)
                const errorCtx = errorCanvas.getContext('2d')
                
                errorCtx.fillStyle = '#FFFFFF'
                errorCtx.fillRect(0, 0, 600, 200)
                errorCtx.fillStyle = '#FF6B35'
                errorCtx.font = 'bold 20px Arial'
                errorCtx.fillText('Guía inválida', 50, 80)
                errorCtx.fillStyle = '#666666'
                errorCtx.font = '16px Arial'
                errorCtx.fillText('La guía no tiene un número válido', 50, 120)
                
                const errorBuffer = errorCanvas.toBuffer('image/png')
                
                return new NextResponse(errorBuffer, {
                    status: 400,
                    headers: {
                        'Content-Type': 'image/png',
                        'Cache-Control': 'no-cache'
                    }
                })
            } catch (canvasError) {
                return NextResponse.json(
                    { error: "La guía no tiene un número de guía válido" },
                    { status: 400 }
                )
            }
        }

        // Preparar datos para la generación de imagen con valores por defecto
        const guiaData = {
            transportadora: shipment.transportadora || null,
            fecha_despacho: shipment.fecha_despacho || null,
            pedido: shipment.pedido || null,
            guia: String(shipment.guia).trim(), // Asegurar que siempre sea string
            estado: shipment.estado || null,
            fecha: shipment.fecha || null,
            novedad: shipment.novedad || null,
            pe: shipment.pe || null,
            cod_cn: shipment.cod_cn || null,
            nombre_cn: shipment.nombre_cn || null,
            departamento: shipment.departamento || null,
            ciudad: shipment.ciudad || null,
            direccion: shipment.direccion || null,
            telefono: shipment.telefono || null
        }

        // Generar imagen bajo demanda
        let imageBuffer: Buffer
        try {
            imageBuffer = await generateNaturaGuiaImage(guiaData)
            
            // Validar que el buffer se generó correctamente
            if (!imageBuffer || imageBuffer.length === 0) {
                throw new Error("Buffer de imagen vacío")
            }
        } catch (genError: any) {
            console.error("Error en generateNaturaGuiaImage:", genError)
            console.error("Stack:", genError?.stack)
            
            // Generar imagen de error
            const { createCanvas } = await import('@napi-rs/canvas')
            const errorCanvas = createCanvas(600, 300)
            const errorCtx = errorCanvas.getContext('2d')
            
            errorCtx.fillStyle = '#FFFFFF'
            errorCtx.fillRect(0, 0, 600, 300)
            errorCtx.fillStyle = '#FF0000'
            errorCtx.font = 'bold 24px Arial'
            errorCtx.fillText('Error al generar imagen', 50, 100)
            errorCtx.fillStyle = '#666666'
            errorCtx.font = '16px Arial'
            errorCtx.fillText(`Guía: ${guiaData.guia}`, 50, 140)
            if (process.env.NODE_ENV === 'development') {
                errorCtx.fillText(genError?.message || 'Error desconocido', 50, 170)
            }
            
            imageBuffer = errorCanvas.toBuffer('image/png')
        }

        // Retornar imagen como respuesta
        return new NextResponse(imageBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'image/png',
                'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache por 1 hora
                'Content-Disposition': `inline; filename="guia_${guiaData.guia.replace(/[^a-zA-Z0-9]/g, '_')}.png"`
            }
        })

    } catch (error: any) {
        console.error("Error generando imagen de guía:", error)
        console.error("Stack trace:", error?.stack)
        
        // Retornar una imagen de error en lugar de JSON para que el componente pueda manejarla
        try {
            const { createCanvas } = await import('@napi-rs/canvas')
            const errorCanvas = createCanvas(400, 200)
            const errorCtx = errorCanvas.getContext('2d')
            
            errorCtx.fillStyle = '#FFFFFF'
            errorCtx.fillRect(0, 0, 400, 200)
            errorCtx.fillStyle = '#FF0000'
            errorCtx.font = '20px Arial'
            errorCtx.fillText('Error al generar imagen', 50, 100)
            
            const errorBuffer = errorCanvas.toBuffer('image/png')
            
            return new NextResponse(errorBuffer, {
                status: 500,
                headers: {
                    'Content-Type': 'image/png',
                    'Cache-Control': 'no-cache'
                }
            })
        } catch (canvasError) {
            // Si no se puede generar imagen de error, retornar JSON
            const errorMessage = error?.message || "Error desconocido al generar la imagen de la guía"
            
            return NextResponse.json(
                { 
                    error: "Error al generar la imagen de la guía",
                    details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
                },
                { status: 500 }
            )
        }
    }
}

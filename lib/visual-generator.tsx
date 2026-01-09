import React from "react"
import { formatToColombiaTime } from "@/lib/date-utils"
import satori from "satori"
import { Resvg } from "@resvg/resvg-js"
import QRCode from "qrcode"

export interface VisualGuideData {
  guia: string
  pedido: string
  destinatario: string
  direccion: string
  ciudad: string
  departamento: string
  estado: string
  fecha_despacho: string
  transportadora: string
  servicio: string
  history: any[]
}

let fontCache: ArrayBuffer | null = null
let fontBoldCache: ArrayBuffer | null = null

async function getFont() {
  if (fontCache) return fontCache
  // Usamos un CDN ultra-estable (jsDelivr / Fontsource)
  const response = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf"
  )
  fontCache = await response.arrayBuffer()
  return fontCache
}

async function getFontBold() {
  if (fontBoldCache) return fontBoldCache
  const response = await fetch(
    "https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf"
  )
  fontBoldCache = await response.arrayBuffer()
  return fontBoldCache
}

export async function generateVisualGuide(data: VisualGuideData): Promise<Buffer> {
  const fontData = await getFont()
  const fontDataBold = await getFontBold()
  
  const svg = await satori(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fff",
        padding: "40px",
        fontFamily: "Inter",
        border: "1px solid #e5e7eb",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "24px", fontWeight: "bold", color: "#ea580c" }}>REMESAS Y MENSAJES</span>
          <span style={{ fontSize: "14px", color: "#6b7280" }}>Trazabilidad Online</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
        {/* Main Info */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase" }}>Número de Guía</span>
            <span style={{ fontSize: "20px", fontWeight: "bold" }}>{data.guia}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "12px", color: "#6b7280", textTransform: "uppercase" }}>Pedido</span>
            <span style={{ fontSize: "16px" }}>{data.pedido}</span>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "10px 20px",
          backgroundColor: data.estado === "ENTREGADO" ? "#dcfce7" : "#fef3c7",
          color: data.estado === "ENTREGADO" ? "#166534" : "#92400e",
          borderRadius: "9999px",
          height: "fit-content",
          fontWeight: "bold"
        }}>
          {data.estado}
        </div>
      </div>

      {/* Details Grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", padding: "20px", backgroundColor: "#f9fafb", borderRadius: "8px", marginBottom: "30px" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "45%" }}>
          <span style={{ fontSize: "10px", color: "#6b7280" }}>DESTINATARIO</span>
          <span style={{ fontSize: "13px", fontWeight: "bold" }}>{data.destinatario}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "45%" }}>
          <span style={{ fontSize: "10px", color: "#6b7280" }}>CIUDAD / DEPTO</span>
          <span style={{ fontSize: "13px" }}>{data.ciudad} / {data.departamento}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <span style={{ fontSize: "10px", color: "#6b7280" }}>DIRECCIÓN</span>
          <span style={{ fontSize: "13px" }}>{data.direccion}</span>
        </div>
      </div>

      {/* History Table Header */}
      <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", paddingBottom: "10px", marginBottom: "10px" }}>
        <span style={{ fontSize: "12px", fontWeight: "bold", width: "40%" }}>Fecha / Hora</span>
        <span style={{ fontSize: "12px", fontWeight: "bold", width: "35%" }}>Estado</span>
        <span style={{ fontSize: "12px", fontWeight: "bold", width: "25%" }}>Novedad</span>
      </div>

      {/* History Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {data.history.slice(0, 5).map((item, idx) => (
          <div key={idx} style={{ display: "flex", fontSize: "11px" }}>
            <span style={{ width: "40%" }}>
              {formatToColombiaTime(item.created_at)}
            </span>
            <span style={{ width: "35%", fontWeight: "bold" }}>{item.estado}</span>
            <span style={{ width: "25%", color: "#6b7280" }}>{item.novedad || "-"}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: "auto", display: "flex", justifyContent: "center", fontSize: "10px", color: "#9ca3af" }}>
        Generado dinámicamente el {new Date().toLocaleString()} - Prohibida su reproducción
      </div>
    </div>,
    {
      width: 600,
      height: 800,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          weight: 400,
          style: "normal",
        },
        {
          name: "Inter",
          data: fontDataBold,
          weight: 700,
          style: "normal",
        },
      ],
    }
  )

  const resvg = new Resvg(svg, {
    background: "rgba(255, 255, 255, 1)",
  })
  
  const pngData = resvg.render().asPng()
  return Buffer.from(pngData)
}

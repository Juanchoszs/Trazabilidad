"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Search, Loader2, LogIn, ChevronRight, Package, Truck, Clock } from "lucide-react"
import { TrackingResult } from "@/components/tracking-result"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function TrackingPage() {
  const [guia, setGuia] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!guia.trim()) return

    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(`/api/tracking/${encodeURIComponent(guia.trim())}`)
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "No se encontró la guía")
      }
    } catch (err) {
      setError("Error al consultar la guía. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FB] dark:bg-gray-950 font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="relative w-40 h-12">
            <Image
              src="/logo-3d-remesas-y-mensajes.jpg"
              alt="Logo Remesas y Mensajes"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2 text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-500 font-medium">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Acceso Clientes</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col justify-center min-h-[calc(100vh-140px)]">
        <div className="container mx-auto px-4 flex flex-col items-center -mt-20">

          {/* Hero Section */}
          <div className={`w-full max-w-3xl text-center space-y-8 transition-all duration-700 ease-out ${result ? 'mb-8' : 'mb-12 scale-100 opacity-100'}`}>

            {!result && (
              <div className="flex justify-center mb-6 animate-in fade-in zoom-in duration-700">
                <div className="relative w-72 h-72 md:w-96 md:h-96 drop-shadow-2xl">
                  <Image
                    src="/logo-3d-remesas-y-mensajes.jpg"
                    alt="Logo 3D"
                    fill
                    className="object-contain mix-blend-multiply dark:mix-blend-normal"
                    priority
                  />
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white leading-tight">
                Rastrea tu envío <span className="text-orange-600">en tiempo real</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Ingresa tu número de guía para consultar el estado actual de tu paquete.
              </p>
            </div>

            <Card className="p-2 shadow-2xl shadow-orange-500/10 dark:shadow-black/50 border-0 ring-1 ring-gray-100 dark:ring-gray-800 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden mt-8 max-w-xl mx-auto transform transition-all hover:scale-[1.01]">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Ingresa tu número de guía..."
                    className="pl-12 h-14 text-lg border-0 bg-transparent focus-visible:ring-0 placeholder:text-gray-400"
                    value={guia}
                    onChange={(e) => setGuia(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-orange-500/25 shrink-0"
                  disabled={loading}
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Rastrear"}
                </Button>
              </form>
            </Card>

            {error && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-sm font-medium animate-in fade-in slide-in-from-top-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                {error}
              </div>
            )}
          </div>

          {/* Results Section */}
          {result && (
            <div className="w-full max-w-4xl">
              <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground hover:text-orange-600 transition-colors cursor-pointer w-fit" onClick={() => setResult(null)}>
                <ChevronRight className="h-4 w-4 rotate-180" />
                Volver a búsqueda
              </div>
              <TrackingResult data={result} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-32 h-10 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
              <Image
                src="/logo-3d-remesas-y-mensajes.jpg"
                alt="Logo Footer"
                fill
                className="object-contain object-left"
              />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © {new Date().getFullYear()} Remesas y Mensajes. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

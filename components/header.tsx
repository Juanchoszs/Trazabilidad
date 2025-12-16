import { Package } from "lucide-react"
import { Navigation } from "./navigation"

export function Header() {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8" strokeWidth={1.5} />
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-balance">Trazabilidad Remesas</h1>
              <p className="text-sm text-muted-foreground mt-1">Control y seguimiento de entregas y devoluciones</p>
            </div>
          </div>
        </div>
        <Navigation />
      </div>
    </header>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Plus, Upload } from "lucide-react"
import Link from "next/link"

export function Navigation() {
  return (
    <nav className="flex gap-3 items-center">
      <Link href="/upload">
        <Button variant="outline" className="gap-2 bg-transparent">
          <Upload className="h-4 w-4" />
          Cargar Excel
        </Button>
      </Link>
      <Link href="/register">
        <Button className="bg-black text-white hover:bg-neutral-800 gap-2">
          <Plus className="h-4 w-4" />
          Registrar Envío
        </Button>
      </Link>
    </nav>
  )
}

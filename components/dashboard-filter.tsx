"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

interface DashboardFilterProps {
  companies: string[]
}

export function DashboardFilter({ companies }: DashboardFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCompany = searchParams.get("transportadora") || "Natura"
  const showNovedades = searchParams.get("novedades") === "true"

  const onCompanyChange = (value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set("transportadora", value)
    } else {
      params.set("transportadora", "Natura")
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  const onNovedadesChange = (checked: boolean) => {
    const params = new URLSearchParams(searchParams)
    if (checked) {
      params.set("novedades", "true")
    } else {
      params.delete("novedades")
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">Empresa:</span>
          <Select value={currentCompany} onValueChange={onCompanyChange}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Seleccionar empresa" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company} value={company}>
                  {company}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="novedades"
            checked={showNovedades}
            onChange={(e) => onNovedadesChange(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="novedades" className="text-sm font-medium cursor-pointer select-none">
            Solo con Novedades
          </label>
        </div>
      </div>
    </Card>
  )
}

"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

interface OverallEffectivenessProps {
  stats: {
    total: number
    delivered: number
  }
}

export function OverallEffectiveness({ stats }: OverallEffectivenessProps) {
  const [progress, setProgress] = useState(0)
  const total = stats.total
  const delivered = stats.delivered
  const target = total > 0 ? Math.round((delivered / total) * 100) : 0

  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < target) {
        setProgress(progress + 1)
      }
    }, 20)
    return () => clearTimeout(timer)
  }, [progress, target])

  return (
    <Card className="p-8 bg-primary text-primary-foreground">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-semibold mb-2">Trazabilidad General</h2>
          <p className="text-primary-foreground/80 text-sm">Efectividad total en entregas de remesas</p>
        </div>
        <div className="relative">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="opacity-20" />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
              className="transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold">{progress}%</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

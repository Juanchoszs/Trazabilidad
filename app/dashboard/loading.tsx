"use client"

import { Loader2 } from "lucide-react"

export default function Loading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <div className="text-center space-y-4">
                <Loader2 className="animate-spin h-12 w-12 mx-auto text-orange-600" />
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Cargando dashboard...
                </p>
            </div>
        </div>
    )
}

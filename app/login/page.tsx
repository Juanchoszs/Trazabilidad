"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            // Create abort controller for timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            if (res.ok) {
                // Navigate immediately - loading.tsx will show while dashboard loads
                window.location.href = "/dashboard"
            } else {
                const data = await res.json()
                setError(data.error || "Error al iniciar sesión")
            }
        } catch (err) {
            if (err instanceof Error && err.name === "AbortError") {
                setError("La solicitud tardó demasiado. Por favor, intenta de nuevo.")
            } else {
                setError("Error de conexión. Verifica tu red e intenta de nuevo.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-center mb-8">
                    <div className="relative w-48 h-20">
                        <Image
                            src="/logo-3d-remesas-y-mensajes.jpg"
                            alt="Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
                    Administración
                </h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Usuario</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 rounded-md border border-gray-300 dark:border-gray-700 bg-transparent"
                            required
                        />
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-md font-medium transition-colors flex justify-center items-center"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    )
}

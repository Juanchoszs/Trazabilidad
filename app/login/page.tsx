"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [isRedirecting, setIsRedirecting] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            })

            if (res.ok) {
                setIsRedirecting(true)
                // Usamos window.location para una redirección más "pesada" que fuerce la carga
                // o router.push si preferimos la experiencia SPA. 
                // Dado el problema de rendimiento, un overlay es mejor.
                router.push("/dashboard")
            } else {
                const data = await res.json()
                setError(data.error || "Error al iniciar sesión")
                setLoading(false)
            }
        } catch (err) {
            setError("Error de conexión")
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            {isRedirecting && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white/90 dark:bg-gray-950/90 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="relative w-64 h-32 mb-8 animate-bounce">
                        <Image
                            src="/logo-3d-remesas-y-mensajes.jpg"
                            alt="Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-orange-600" />
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                ¡Bienvenido de nuevo!
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">
                                Estamos preparandolo todo para ti... Redirigiendo al dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            )}
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

import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        // Validate environment variables are loaded
        const adminUser = process.env.ADMIN_USER
        const adminPassword = process.env.ADMIN_PASSWORD

        if (!adminUser || !adminPassword) {
            console.error("Environment variables not loaded:", {
                hasAdminUser: !!adminUser,
                hasAdminPassword: !!adminPassword,
                nodeEnv: process.env.NODE_ENV
            })
            return NextResponse.json(
                { error: "Error de configuración del servidor" },
                { status: 500 }
            )
        }

        // Check credentials against .env
        if (username === adminUser && password === adminPassword) {
            // Set simple auth cookie
            const cookieStore = await cookies()
            cookieStore.set("auth_token", "admin-session-valid", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: "/",
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    } catch (error) {
        console.error("Login error:", error)
        return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
    }
}

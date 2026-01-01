import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        // Check credentials against .env
        if (
            username === process.env.ADMIN_USER &&
            password === process.env.ADMIN_PASSWORD
        ) {
            // Set simple auth cookie
            // In production use a signed JWT or session
            const cookieStore = await cookies()
            cookieStore.set("auth_token", "admin-session-valid", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 7, // 1 week
                path: "/",
            })

            return NextResponse.json({ success: true })
        }

        return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    } catch (error) {
        return NextResponse.json({ error: "Error en el servidor" }, { status: 500 })
    }
}

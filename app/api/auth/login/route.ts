import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
    const startTime = Date.now()
    
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
                { 
                    status: 500,
                    headers: {
                        "Cache-Control": "no-store, no-cache, must-revalidate",
                    }
                }
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

            const duration = Date.now() - startTime
            console.log(`Login successful in ${duration}ms`)

            return NextResponse.json(
                { success: true },
                {
                    headers: {
                        "Cache-Control": "no-store, no-cache, must-revalidate",
                    }
                }
            )
        }

        const duration = Date.now() - startTime
        console.log(`Login failed (invalid credentials) in ${duration}ms`)
        
        return NextResponse.json(
            { error: "Credenciales inválidas" }, 
            { 
                status: 401,
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                }
            }
        )
    } catch (error) {
        const duration = Date.now() - startTime
        console.error(`Login error after ${duration}ms:`, error)
        
        return NextResponse.json(
            { error: "Error en el servidor" }, 
            { 
                status: 500,
                headers: {
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                }
            }
        )
    }
}

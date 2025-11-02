// app/api/ai/route.ts
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { message } = await req.json()

        // forward to Python FastAPI backend
        const response = await fetch("http://127.0.0.1:8000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        })

        const data = await response.json()
        return NextResponse.json({ reply: data.response })
    } catch (err: any) {
        console.error("AI route error:", err)
        return NextResponse.json({ reply: "⚠️ Backend not reachable." })
    }
}

"use client"
import { useState } from "react"

export default function AIChatPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{role: string, text: string}[]>([])

  const sendMessage = async () => {
    if (!input.trim()) return
    setMessages(prev => [...prev, { role: "user", text: input }])

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    })
    const data = await res.json()
    setMessages(prev => [...prev, { role: "assistant", text: data.reply }])
    setInput("")
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl mb-4 font-bold">🧠 Terra AI Assistant</h1>
      <div className="space-y-2 max-h-[70vh] overflow-auto bg-black/40 p-4 rounded-lg">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-green-400" : "text-blue-300"}>
            <b>{m.role === "user" ? "You" : "AI"}:</b> {m.text}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 p-2 rounded bg-slate-800 border border-slate-600"
          placeholder="Ask Terra AI..."
        />
        <button onClick={sendMessage} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
          Send
        </button>
      </div>
    </div>
  )
}

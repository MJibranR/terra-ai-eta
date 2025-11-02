"use client"

import { useState } from "react"
import { MessageSquare, X, Send } from "lucide-react"

export default function AIButton() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [chat, setChat] = useState<{ role: string; text: string }[]>([])
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim()) return
    setLoading(true)
    const userMsg = { role: "user", text: message }
    setChat((prev) => [...prev, userMsg])
    setMessage("")

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })
    const data = await res.json()

    setChat((prev) => [...prev, { role: "ai", text: data.reply }])
    setLoading(false)
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 z-50 transition"
      >
        {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 bg-slate-900/90 backdrop-blur-md border border-blue-500/30 rounded-2xl shadow-xl p-4 text-white z-50 flex flex-col">
          <div className="text-sm font-semibold mb-2 text-blue-300">Terra AI Assistant</div>
          <div className="flex-1 overflow-y-auto max-h-64 mb-2 space-y-2 text-sm">
            {chat.map((c, i) => (
              <div
                key={i}
                className={`p-2 rounded-xl ${
                  c.role === "user"
                    ? "bg-blue-600/40 self-end text-right"
                    : "bg-gray-700/50 text-left"
                }`}
              >
                {c.text}
              </div>
            ))}
            {loading && <div className="text-gray-400 text-xs">Thinking...</div>}
          </div>
          <div className="flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent border border-gray-600 rounded-lg px-2 py-1 text-sm outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 px-3 py-1 rounded-lg hover:bg-blue-700"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

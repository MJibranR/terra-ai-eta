"use client"

import { useState } from "react"
import { sendMessageToGemini } from "@/lib/gemini-client"

export default function AIAssistant() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<{ from: "user" | "ai"; text: string }[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return
    const userMessage = { from: "user" as const, text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const reply = await sendMessageToGemini(input)
      setMessages((prev) => [...prev, { from: "ai", text: reply }])
    } catch {
      setMessages((prev) => [...prev, { from: "ai", text: "⚠️ Error contacting TerraAI Assistant." }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-cyan-500 text-white p-4 rounded-full shadow-lg hover:opacity-90 transition z-50"
        >
          💬
        </button>
      )}

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-[#0b0f1a] text-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-blue-600/40 animate-fadeIn z-50">
          {/* Header */}
          <div className="flex justify-between items-center p-3 bg-blue-600/30 border-b border-blue-600/40">
            <h2 className="font-semibold">TerraAI Assistant</h2>
            <button
              onClick={() => setOpen(false)}
              className="text-gray-300 hover:text-white transition text-lg"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {messages.length === 0 && (
              <div className="text-gray-400 text-sm text-center mt-10">
                👋 Hi! I’m TerraAI Assistant. Ask me about TerraAI or its developer!
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[80%] ${
                  m.from === "user"
                    ? "bg-blue-600 self-end ml-auto"
                    : "bg-gray-800 border border-blue-500/30"
                }`}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="text-sm text-gray-400">Thinking...</div>}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-blue-600/40 flex bg-[#111626]">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about TerraAI..."
              className="flex-1 bg-transparent text-white text-sm p-2 rounded-l-lg outline-none"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 px-4 py-2 rounded-r-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  )
}

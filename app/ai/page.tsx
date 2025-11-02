"use client"
import { useState, useRef, useEffect } from "react"
import { 
  Send, Brain, Zap, Sparkles, User, Bot, Trash2, Copy, Download, 
  MapPin, Sprout, TreePine, Droplets, Thermometer, CloudRain, 
  TrendingUp, BookOpen, Lightbulb, Target, Clock, Calendar,
  Shield
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FarmAIChatPage() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<{role: string, text: string, timestamp: Date, type?: string}[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Farm education knowledge base
  const farmKnowledge = {
    locations: [
      {
        region: "Midwest USA",
        crops: ["Corn", "Soybeans", "Wheat"],
        soil: "Rich prairie soil",
        climate: "Temperate continental",
        water: "Good rainfall, irrigation available",
        pros: "High yield potential, established infrastructure",
        cons: "Competitive land prices"
      },
      {
        region: "California Central Valley",
        crops: ["Almonds", "Grapes", "Tomatoes", "Lettuce"],
        soil: "Alluvial soil",
        climate: "Mediterranean",
        water: "Irrigation dependent",
        pros: "Year-round growing season, high-value crops",
        cons: "Water scarcity issues"
      },
      {
        region: "Southeast USA",
        crops: ["Cotton", "Peanuts", "Peaches", "Tobacco"],
        soil: "Sandy loam",
        climate: "Humid subtropical",
        water: "Adequate rainfall",
        pros: "Long growing season, diverse crop options",
        cons: "Pest pressure, humidity challenges"
      }
    ],
    crops: [
      {
        name: "Corn",
        season: "Summer",
        duration: "90-120 days",
        water: "Medium-high",
        soil: "Well-drained loam",
        profit: "Medium",
        difficulty: "Easy"
      },
      {
        name: "Soybeans",
        season: "Summer",
        duration: "100-130 days",
        water: "Medium",
        soil: "Various types",
        profit: "Medium",
        difficulty: "Easy"
      },
      {
        name: "Wheat",
        season: "Winter/Spring",
        duration: "120-150 days",
        water: "Low-medium",
        soil: "Well-drained",
        profit: "Low-medium",
        difficulty: "Easy"
      }
    ],
    steps: [
      "Land Selection & Soil Testing",
      "Business Planning & Financing",
      "Crop Selection & Rotation Planning",
      "Equipment Acquisition",
      "Soil Preparation & Planting",
      "Irrigation Setup",
      "Pest & Disease Management",
      "Harvesting & Storage",
      "Marketing & Sales"
    ]
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    
    const userMessage = { role: "user", text: input, timestamp: new Date() }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response with farm knowledge
    setTimeout(() => {
      const aiResponse = generateAIResponse(input)
      const aiMessage = { role: "assistant", text: aiResponse, timestamp: new Date(), type: "education" }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    
    if (input.includes("where") && input.includes("farm")) {
      return `🌍 **Best Locations for Farming:**\n\n${farmKnowledge.locations.map(loc => `
**${loc.region}**
• **Main Crops:** ${loc.crops.join(", ")}
• **Soil Type:** ${loc.soil}
• **Climate:** ${loc.climate}
• **Water:** ${loc.water}
• **✅ Pros:** ${loc.pros}
• **⚠️ Cons:** ${loc.cons}
      `).join('\n')}\n\n*Consider soil testing and local market demand before deciding.*`
    }

    if (input.includes("crop") || input.includes("plant") || input.includes("grow")) {
      return `🌱 **Popular Crops for Beginners:**\n\n${farmKnowledge.crops.map(crop => `
**${crop.name}**
• **Season:** ${crop.season}
• **Growth Duration:** ${crop.duration}
• **Water Needs:** ${crop.water}
• **Soil Preference:** ${crop.soil}
• **Profit Potential:** ${crop.profit}
• **Difficulty:** ${crop.difficulty}
      `).join('\n')}\n\n*Start with 2-3 crops to manage complexity.*`
    }

    if (input.includes("start") && input.includes("farm")) {
      return `🚜 **How to Start a Farm - Step by Step:**\n\n${farmKnowledge.steps.map((step, index) => 
        `${index + 1}. **${step}**`
      ).join('\n')}\n\n**Key Considerations:**\n• Start small (5-20 acres)\n• Focus on high-value crops\n• Build relationships with local markets\n• Implement sustainable practices from day one\n• Plan for crop rotation`
    }

    if (input.includes("soil") || input.includes("land")) {
      return `🌱 **Soil & Land Preparation:**\n\n**Soil Testing:**\n• Test pH levels (6.0-7.0 ideal for most crops)\n• Check nutrient levels (N-P-K)\n• Analyze soil texture and composition\n\n**Land Preparation:**\n• Clear land of debris and weeds\n• Plow and till soil\n• Add organic matter/compost\n• Ensure proper drainage\n• Consider contour planting for slopes`
    }

    if (input.includes("water") || input.includes("irrigation")) {
      return `💧 **Water Management & Irrigation:**\n\n**Systems:**\n• Drip irrigation (most efficient)\n• Sprinkler systems\n• Flood irrigation\n• Center pivot\n\n**Best Practices:**\n• Water early morning\n• Monitor soil moisture\n• Use mulch to retain moisture\n• Collect rainwater\n• Implement drought-resistant crops`
    }

    if (input.includes("seed") || input.includes("planting")) {
      return `🌾 **Seeds & Planting Guide:**\n\n**Seed Selection:**\n• Choose certified seeds\n• Consider hybrid vs. heirloom\n• Check germination rates\n• Select disease-resistant varieties\n\n**Planting Methods:**\n• Direct seeding\n• Transplanting seedlings\n• Row planting\n• Companion planting\n\n**Timing:**\n• Follow local planting calendars\n• Consider frost dates\n• Stagger planting for continuous harvest`
    }

    return `🌾 **Farm Education AI**\n\nI can help you with:\n\n📍 **Farm Location Selection** - Best regions based on crops and climate\n🌱 **Crop Planning** - What to grow and when\n🚜 **Starting a Farm** - Step-by-step guidance\n💧 **Water & Irrigation** - Efficient water management\n🌱 **Soil Health** - Testing and improvement\n📊 **Business Planning** - Costs, profits, and markets\n🛡️ **Sustainable Practices** - Organic and eco-friendly methods\n\nAsk me anything about farming! For example:\n• "Where should I start a vegetable farm?"\n• "What crops are most profitable?"\n• "How do I test my soil?"\n• "What equipment do I need to start?"`
  }

  const clearChat = () => {
    setMessages([])
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportChat = () => {
    const chatText = messages.map(m => 
      `${m.role === 'user' ? 'You' : 'Farm AI'}: ${m.text}`
    ).join('\n\n')
    
    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `farm-ai-education-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const suggestedQuestions = [
    "Where is the best place to start a farm?",
    "What crops should I grow for maximum profit?",
    "How do I test and prepare soil for farming?",
    "What equipment do I need to start farming?",
    "How much water do different crops need?",
    "What are the steps to start a successful farm?",
    "How to manage pests organically?",
    "What are the best irrigation systems?"
  ]

  const quickTopics = [
    { icon: MapPin, title: "Farm Locations", color: "blue", questions: [
      "Best regions for organic farming",
      "Climate requirements for specific crops",
      "Land acquisition tips"
    ]},
    { icon: Sprout, title: "Crop Selection", color: "green", questions: [
      "High-profit crops for beginners",
      "Seasonal planting guide",
      "Crop rotation strategies"
    ]},
    { icon: Droplets, title: "Water Management", color: "cyan", questions: [
      "Efficient irrigation systems",
      "Water conservation techniques",
      "Rainwater harvesting"
    ]},
    { icon: TreePine, title: "Soil Health", color: "amber", questions: [
      "Soil testing methods",
      "Organic soil amendments",
      "Composting techniques"
    ]}
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-lime-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-green-500/30">
                <Sprout className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Brain className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-white bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Farm Education AI
              </h1>
              <p className="text-green-300 text-sm md:text-base mt-2">
                Your Complete Guide to Starting & Managing a Successful Farm
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <Badge className="bg-green-600/20 text-green-300 border-green-500/30">
              <MapPin className="w-3 h-3 mr-1" />
              Location Analysis
            </Badge>
            <Badge className="bg-blue-600/20 text-blue-300 border-blue-500/30">
              <Sprout className="w-3 h-3 mr-1" />
              Crop Planning
            </Badge>
            <Badge className="bg-amber-600/20 text-amber-300 border-amber-500/30">
              <BookOpen className="w-3 h-3 mr-1" />
              Step-by-Step Guide
            </Badge>
            <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
              <TrendingUp className="w-3 h-3 mr-1" />
              Profit Optimization
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/20">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="learn" className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Learning Hub
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="space-y-4">
                {/* Chat Container */}
                <Card className="bg-black/40 backdrop-blur-xl border border-green-500/30 shadow-2xl shadow-green-500/20">
                  <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <CardTitle className="text-white flex items-center gap-2">
                        <Bot className="w-5 h-5 text-green-400" />
                        Farm Education Assistant
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={exportChat}
                          className="border-green-500/30 text-green-300 hover:bg-green-500/10"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Export</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearChat}
                          className="border-red-500/30 text-red-300 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          <span className="hidden sm:inline">Clear</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Messages Area */}
                    <div className="h-[400px] sm:h-[500px] overflow-y-auto p-4 space-y-4">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 p-8">
                          <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-600/20 rounded-2xl flex items-center justify-center">
                            <Sprout className="w-10 h-10 text-green-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">
                              Start Your Farming Journey
                            </h3>
                            <p className="text-gray-400 max-w-md">
                              Ask me anything about farm locations, crop selection, soil preparation, 
                              irrigation systems, business planning, and sustainable practices.
                            </p>
                          </div>
                        </div>
                      ) : (
                        messages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                          >
                            {/* Avatar */}
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === "user" 
                                ? "bg-blue-500/20 border border-blue-500/30" 
                                : "bg-green-500/20 border border-green-500/30"
                            }`}>
                              {message.role === "user" ? (
                                <User className="w-4 h-4 text-blue-400" />
                              ) : (
                                <Bot className="w-4 h-4 text-green-400" />
                              )}
                            </div>

                            {/* Message Bubble */}
                            <div className={`flex-1 max-w-[85%] ${message.role === "user" ? "text-right" : "text-left"}`}>
                              <div className={`inline-block p-3 sm:p-4 rounded-2xl ${
                                message.role === "user"
                                  ? "bg-blue-500/20 border border-blue-500/30 text-blue-100"
                                  : "bg-green-500/20 border border-green-500/30 text-green-100"
                              }`}>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                                <div className={`text-xs mt-2 opacity-70 ${
                                  message.role === "user" ? "text-blue-300" : "text-green-300"
                                }`}>
                                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                              
                              {/* Copy Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(message.text)}
                                className="mt-1 opacity-70 hover:opacity-100 transition-opacity h-6 w-6 p-0"
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {/* Loading Indicator */}
                      {isLoading && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-green-400" />
                          </div>
                          <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-4">
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-100"></div>
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-green-500/20 p-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              sendMessage()
                            }
                          }}
                          placeholder="Ask about farm locations, crops, soil, irrigation, business planning..."
                          className="flex-1 bg-black/30 border-green-500/30 text-white placeholder-gray-400 resize-none min-h-[80px]"
                          rows={2}
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={isLoading || !input.trim()}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 sm:px-8 h-auto py-3"
                        >
                          {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              <span className="hidden sm:inline">Send</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="learn">
                <div className="grid md:grid-cols-2 gap-4">
                  {quickTopics.map((topic, index) => {
                    const Icon = topic.icon
                    return (
                      <Card key={index} className="bg-black/40 backdrop-blur-xl border border-green-500/30">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-white text-sm flex items-center gap-2">
                            <Icon className={`w-4 h-4 text-${topic.color}-400`} />
                            {topic.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {topic.questions.map((question, qIndex) => (
                            <Button
                              key={qIndex}
                              variant="outline"
                              onClick={() => {
                                setInput(question)
                                setActiveTab("chat")
                              }}
                              className="w-full text-xs text-left h-auto p-2 border-green-500/20 text-green-300 hover:bg-green-500/10 justify-start"
                            >
                              {question}
                            </Button>
                          ))}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Suggested Questions */}
            <Card className="bg-black/40 backdrop-blur-xl border border-blue-500/30">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-400" />
                  Quick Start Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setInput(question)}
                    className="w-full text-xs text-left h-auto p-2 border-blue-500/20 text-blue-300 hover:bg-blue-500/10 justify-start"
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Farming Essentials */}
            <Card className="bg-black/40 backdrop-blur-xl border border-amber-500/30">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  Farming Essentials
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-gray-300">
                <div className="flex items-center gap-2 p-2 bg-amber-500/10 rounded">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>Location Analysis</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded">
                  <Sprout className="w-3 h-3 text-green-400" />
                  <span>Crop Selection Guide</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-blue-500/10 rounded">
                  <Droplets className="w-3 h-3 text-blue-400" />
                  <span>Water Management</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-purple-500/10 rounded">
                  <TreePine className="w-3 h-3 text-purple-400" />
                  <span>Soil Health</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-red-500/10 rounded">
                  <Shield className="w-3 h-3 text-red-400" />
                  <span>Pest Control</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-cyan-500/10 rounded">
                  <TrendingUp className="w-3 h-3 text-cyan-400" />
                  <span>Business Planning</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-black/40 backdrop-blur-xl border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  Farm Quick Facts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Startup Cost</span>
                  <span className="text-green-400">$10K-$50K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Break-even</span>
                  <span className="text-amber-400">1-3 years</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Acres (Beginner)</span>
                  <span className="text-blue-400">5-20 acres</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">High-Profit Crops</span>
                  <span className="text-purple-400">Microgreens</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          Farm Education AI • Complete Agricultural Knowledge • Sustainable Practices • Business Guidance
        </div>
      </div>
    </div>
  )
}
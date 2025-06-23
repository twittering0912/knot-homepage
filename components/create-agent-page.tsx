"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Send,
  Check,
  Bot,
  Settings,
  MessageSquare,
  Code,
  Zap,
  Plus,
  Search,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import type { Agent, AgentConfig } from "../types/agent"

interface CreateAgentPageProps {
  onBack: () => void
  onPublish: (agent: Agent) => void
  initialAgentData?: Agent | null
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const defaultAgentConfig: AgentConfig = {
  name: "",
  model: "deepseekV3",
  prompt: "",
  knowledgeBases: [],
  mcpServices: [],
  rules: [],
}

export default function CreateAgentPage({ onBack, onPublish, initialAgentData }: CreateAgentPageProps) {
  const [agentConfig, setAgentConfig] = useState<AgentConfig>(defaultAgentConfig)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "你好！我是你配置的智能体，你可以在这里测试我的功能。请随时向我提问！",
      timestamp: new Date(),
    },
  ])

  const [inputMessage, setInputMessage] = useState("")
  const [isPublishedThisSession, setIsPublishedThisSession] = useState(false) // Tracks if a *new* agent was published in this session
  const [apiInfoForConfirmation, setApiInfoForConfirmation] = useState<Agent["apiInfo"] | null>(null)
  const [showPublishConfirmDialog, setShowPublishConfirmDialog] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showConfirmApiKey, setShowConfirmApiKey] = useState(false)

  const [showKnowledgePanel, setShowKnowledgePanel] = useState(false)
  const [showMcpPanel, setShowMcpPanel] = useState(false)
  const [showAddKnowledgeBaseDialog, setShowAddKnowledgeBaseDialog] = useState(false)

  const [newKbName, setNewKbName] = useState("")
  const [newKbType, setNewKbType] = useState("")
  const [newKbUrl, setNewKbUrl] = useState("")
  const [newKbApprover, setNewKbApprover] = useState("")

  const [knowledgeSearchTerm, setKnowledgeSearchTerm] = useState("")
  const [mcpSearchTerm, setMcpSearchTerm] = useState("")
  const [rulesSearchTerm, setRulesSearchTerm] = useState("")
  const [showRulesPanel, setShowRulesPanel] = useState(false)
  const [selectedRuleCategory, setSelectedRuleCategory] = useState("全部")

  const isEditing = !!initialAgentData

  useEffect(() => {
    if (initialAgentData) {
      setAgentConfig(initialAgentData.config)
      // apiInfo will be handled during publish attempt if editing
      setIsPublishedThisSession(false) // Allow editing
    } else {
      setAgentConfig(defaultAgentConfig) // Reset for new agent
      setApiInfoForConfirmation(null)
      setIsPublishedThisSession(false)
    }
  }, [initialAgentData])

  const availableModels = [
    { value: "deepseekV3", label: "Deepseek V3" },
    { value: "deepseekR1", label: "Deepseek R1" },
  ]

  const availableMCP = [
    { value: "web-search", label: "网络搜索", description: "提供实时网络搜索能力" },
    { value: "code-execution", label: "代码执行", description: "执行Python和JavaScript代码" },
    { value: "file-operations", label: "文件操作", description: "读取和处理文件" },
    { value: "database-query", label: "数据库查询", description: "查询数据库信息" },
  ]

  const availableRules = [
    { value: "safety-filter", label: "安全过滤", description: "过滤不当内容", category: "安全" },
    { value: "response-length", label: "回复长度限制", description: "限制回复长度", category: "输出控制" },
    { value: "professional-tone", label: "专业语调", description: "保持专业的对话语调", category: "语调风格" },
    { value: "fact-check", label: "事实核查", description: "验证信息准确性", category: "质量控制" },
  ]

  const availableKnowledgeBases = [
    {
      id: "kb1",
      name: "test-sisiychen",
      type: "代码库",
      status: "处理中",
      url: "https://git.woa.com/sisiychen-demo/test-sisiychen...",
      updateTime: "2025-06-05 19:27:50",
      icon: "🔶",
      bgColor: "bg-orange-100",
    },
    {
      id: "kb2",
      name: "sisiychen(备选)",
      type: "维基",
      status: "重新索引中",
      url: "https://iwiki.woa.com/space/~sisiychen",
      updateTime: "2025-06-19 20:10:08",
      icon: "W",
      bgColor: "bg-purple-100",
    },
  ]

  const filteredKnowledgeBases = availableKnowledgeBases.filter(
    (kb) =>
      kb.name.toLowerCase().includes(knowledgeSearchTerm.toLowerCase()) ||
      kb.type.toLowerCase().includes(knowledgeSearchTerm.toLowerCase()) ||
      kb.url.toLowerCase().includes(knowledgeSearchTerm.toLowerCase()),
  )

  const filteredMCP = availableMCP.filter(
    (mcp) =>
      mcp.label.toLowerCase().includes(mcpSearchTerm.toLowerCase()) ||
      mcp.description.toLowerCase().includes(mcpSearchTerm.toLowerCase()),
  )

  const filteredRules = availableRules.filter((rule) => {
    const matchesSearch =
      rule.label.toLowerCase().includes(rulesSearchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(rulesSearchTerm.toLowerCase())
    const matchesCategory = selectedRuleCategory === "全部" || rule.category === selectedRuleCategory
    return matchesSearch && matchesCategory
  })

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `基于你的配置（模型：${agentConfig.model}，已选择${agentConfig.mcpServices.length}个MCP服务和${agentConfig.rules.length}个规则），我理解你的问题是："${inputMessage}"。这是一个模拟回复。`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  const attemptPublish = () => {
    if (!agentConfig.name || !agentConfig.prompt) {
      alert("请填写智能体名称和Prompt")
      return
    }

    const agentId = initialAgentData?.apiInfo?.agentId || `agent_${Date.now()}`
    // Ensure endpoint uses the correct part of agentId if it's new or existing
    const idSuffix = agentId.startsWith("agent_") ? agentId.substring("agent_".length) : Date.now()
    const endpoint = initialAgentData?.apiInfo?.endpoint || `https://api.knot.com/v1/agents/${idSuffix}`

    const generatedApiInfo: Agent["apiInfo"] = {
      endpoint: endpoint,
      apiKey: `knot_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`, // Always new key
      agentId: agentId,
    }
    setApiInfoForConfirmation(generatedApiInfo)
    setShowPublishConfirmDialog(true)
    setShowConfirmApiKey(false) // Reset API key visibility for dialog
  }

  const confirmAndPublish = () => {
    if (!apiInfoForConfirmation) return

    onPublish({
      config: agentConfig,
      apiInfo: apiInfoForConfirmation,
      status: "运行中",
    })

    if (!isEditing) {
      setIsPublishedThisSession(true)
    }
    // Parent component (app/page.tsx) handles navigation via onPublish
    setShowPublishConfirmDialog(false)
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const handleAddNewKnowledgeBase = () => {
    if (!newKbName || !newKbType || !newKbUrl) {
      alert("请填写所有必填项")
      return
    }
    if (newKbType === "iwiki文档" && !newKbApprover) {
      alert("请填写审批人")
      return
    }
    console.log("New Knowledge Base:", { name: newKbName, type: newKbType, url: newKbUrl, approver: newKbApprover })
    alert("新知识库已添加 (模拟)")
    setNewKbName("")
    setNewKbType("")
    setNewKbUrl("")
    setNewKbApprover("")
    setShowAddKnowledgeBaseDialog(false)
  }

  const formDisabled = isPublishedThisSession && !isEditing

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{isEditing ? "编辑智能体" : "创建智能体"}</h1>
              <p className="text-sm text-gray-500">配置你的专属AI助手</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={attemptPublish} disabled={formDisabled}>
              {isEditing ? "更新智能体" : isPublishedThisSession ? "已发布" : "发布智能体"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Panel - Configuration */}
        <div className="w-1/2 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>基础配置</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="agent-name">智能体名称</Label>
                  <Input
                    id="agent-name"
                    placeholder="为你的智能体起个名字"
                    value={agentConfig.name}
                    onChange={(e) => setAgentConfig((prev) => ({ ...prev, name: e.target.value }))}
                    disabled={formDisabled}
                  />
                </div>
                <div>
                  <Label htmlFor="model-select">选择模型</Label>
                  <Select
                    value={agentConfig.model}
                    onValueChange={(value) => setAgentConfig((prev) => ({ ...prev, model: value }))}
                    disabled={formDisabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择AI模型" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model.value} value={model.value}>
                          {model.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="prompt">系统Prompt</Label>
                  <Textarea
                    id="prompt"
                    placeholder="描述你的智能体应该如何行为，它的角色和能力..."
                    rows={6}
                    value={agentConfig.prompt}
                    onChange={(e) => setAgentConfig((prev) => ({ ...prev, prompt: e.target.value }))}
                    disabled={formDisabled}
                  />
                  <p className="text-xs text-gray-500 mt-1">提示：详细的prompt能让智能体更好地理解你的需求</p>
                </div>
              </CardContent>
            </Card>

            {/* KnowledgeBase, MCP, Rules Cards... (content mostly unchanged, ensure disabled={formDisabled} is applied to buttons) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5" />
                  <span>知识库</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* ... existing KB rendering ... ensure remove buttons are disabled={formDisabled} */}
                  {agentConfig.knowledgeBases.length > 0 ? (
                    <div className="space-y-2">
                      {agentConfig.knowledgeBases.map((kbId) => {
                        const kb = availableKnowledgeBases.find((k) => k.id === kbId)
                        return kb ? (
                          <div
                            key={kbId}
                            className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 ${kb.bgColor} rounded flex items-center justify-center text-xs`}>
                                {kb.icon}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{kb.name}</p>
                                <p className="text-xs text-gray-500">{kb.type}</p>
                              </div>
                            </div>
                            {!formDisabled && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setAgentConfig((prev) => ({
                                    ...prev,
                                    knowledgeBases: prev.knowledgeBases.filter((id) => id !== kbId),
                                  }))
                                }}
                              >
                                移除
                              </Button>
                            )}
                          </div>
                        ) : null
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Bot className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                      <p className="text-sm">暂未选择知识库</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowKnowledgePanel(true)}
                    disabled={formDisabled}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加知识库
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5" />
                  <span>MCP服务</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agentConfig.mcpServices.length > 0 ? (
                    <div className="space-y-2">
                      {agentConfig.mcpServices.map((mcpId) => {
                        const mcp = availableMCP.find((m) => m.value === mcpId)
                        return mcp ? (
                          <div
                            key={mcpId}
                            className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-sm">{mcp.label}</p>
                              <p className="text-xs text-gray-500">{mcp.description}</p>
                            </div>
                            {!formDisabled && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setAgentConfig((prev) => ({
                                    ...prev,
                                    mcpServices: prev.mcpServices.filter((id) => id !== mcpId),
                                  }))
                                }}
                              >
                                移除
                              </Button>
                            )}
                          </div>
                        ) : null
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Zap className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                      <p className="text-sm">暂未选择MCP服务</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowMcpPanel(true)}
                    disabled={formDisabled}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加MCP服务
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Code className="w-5 h-5" />
                  <span>Rules规则</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {agentConfig.rules.length > 0 ? (
                    <div className="space-y-2">
                      {agentConfig.rules.map((ruleId) => {
                        const rule = availableRules.find((r) => r.value === ruleId)
                        return rule ? (
                          <div
                            key={ruleId}
                            className="flex items-center justify-between p-2 bg-purple-50 border border-purple-200 rounded-lg"
                          >
                            <div>
                              <p className="font-medium text-sm">{rule.label}</p>
                              <p className="text-xs text-gray-500">{rule.description}</p>
                            </div>
                            {!formDisabled && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setAgentConfig((prev) => ({
                                    ...prev,
                                    rules: prev.rules.filter((id) => id !== ruleId),
                                  }))
                                }}
                              >
                                移除
                              </Button>
                            )}
                          </div>
                        ) : null
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Code className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                      <p className="text-sm">暂未选择规则</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowRulesPanel(true)}
                    disabled={formDisabled}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    添加规则
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Panel - Chat Testing (unchanged) */}
        <div className="w-1/2 bg-gray-50 flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>对话测试</span>
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-900"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="输入消息测试你的智能体..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Selection Panels (KnowledgeBase, MCP, Rules - mostly unchanged, ensure selection works with formDisabled state) */}
      {showKnowledgePanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="ml-auto w-96 bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">选择知识库</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowKnowledgePanel(false)}>
                ✕
              </Button>
            </div>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索知识库..."
                  value={knowledgeSearchTerm}
                  onChange={(e) => setKnowledgeSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredKnowledgeBases.length > 0 ? (
                filteredKnowledgeBases.map((kb) => (
                  <Card
                    key={kb.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${agentConfig.knowledgeBases.includes(kb.id) ? "ring-2 ring-blue-500 bg-blue-50" : ""}`}
                    onClick={() => {
                      setAgentConfig((prev) => ({
                        ...prev,
                        knowledgeBases: prev.knowledgeBases.includes(kb.id)
                          ? prev.knowledgeBases.filter((id) => id !== kb.id)
                          : [...prev.knowledgeBases, kb.id],
                      }))
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-10 h-10 ${kb.bgColor} rounded-lg flex items-center justify-center text-lg flex-shrink-0`}
                        >
                          {kb.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{kb.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            {kb.type && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">{kb.type}</span>
                            )}
                            {kb.status && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                {kb.status}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-2 truncate">{kb.url}</p>
                          <p className="text-xs text-gray-400 mt-1">更新时间：{kb.updateTime}</p>
                        </div>
                        {agentConfig.knowledgeBases.includes(kb.id) && (
                          <div className="flex-shrink-0">
                            <Check className="w-5 h-5 text-blue-600" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">未找到匹配的知识库</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50 space-y-2">
              <Button className="w-full" onClick={() => setShowKnowledgePanel(false)}>
                确认选择 ({agentConfig.knowledgeBases.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MCP Selection Panel */}
      {showMcpPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="ml-auto w-96 bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">选择MCP服务</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowMcpPanel(false)}>
                ✕
              </Button>
            </div>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索MCP服务..."
                  value={mcpSearchTerm}
                  onChange={(e) => setMcpSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredMCP.length > 0 ? (
                filteredMCP.map((mcp) => (
                  <Card
                    key={mcp.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${agentConfig.mcpServices.includes(mcp.value) ? "ring-2 ring-green-500 bg-green-50" : ""}`}
                    onClick={() => {
                      setAgentConfig((prev) => ({
                        ...prev,
                        mcpServices: prev.mcpServices.includes(mcp.value)
                          ? prev.mcpServices.filter((id) => id !== mcp.value)
                          : [...prev.mcpServices, mcp.value],
                      }))
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{mcp.label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{mcp.description}</p>
                        </div>
                        {agentConfig.mcpServices.includes(mcp.value) && (
                          <div className="flex-shrink-0">
                            <Check className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Zap className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">未找到匹配的MCP服务</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50">
              <Button className="w-full" onClick={() => setShowMcpPanel(false)}>
                确认选择 ({agentConfig.mcpServices.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Rules Selection Panel */}
      {showRulesPanel && (
        <div className="fixed inset-0 z-50 flex">
          <div className="ml-auto w-96 bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">选择Rules规则</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowRulesPanel(false)}>
                ✕
              </Button>
            </div>
            <div className="p-4 border-b space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索规则..."
                  value={rulesSearchTerm}
                  onChange={(e) => setRulesSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["全部", "安全", "输出控制", "语调风格", "质量控制"].map((category) => (
                  <Button
                    key={category}
                    variant={selectedRuleCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRuleCategory(category)}
                    className="text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredRules.length > 0 ? (
                filteredRules.map((rule) => (
                  <Card
                    key={rule.value}
                    className={`cursor-pointer transition-all hover:shadow-md ${agentConfig.rules.includes(rule.value) ? "ring-2 ring-purple-500 bg-purple-50" : ""}`}
                    onClick={() => {
                      setAgentConfig((prev) => ({
                        ...prev,
                        rules: prev.rules.includes(rule.value)
                          ? prev.rules.filter((id) => id !== rule.value)
                          : [...prev.rules, rule.value],
                      }))
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Code className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{rule.label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                        </div>
                        {agentConfig.rules.includes(rule.value) && (
                          <div className="flex-shrink-0">
                            <Check className="w-5 h-5 text-purple-600" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Code className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">未找到匹配的规则</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50">
              <Button className="w-full" onClick={() => setShowRulesPanel(false)}>
                确认选择 ({agentConfig.rules.length})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Knowledge Base Dialog */}
      <Dialog open={showAddKnowledgeBaseDialog} onOpenChange={setShowAddKnowledgeBaseDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>添加新知识库</DialogTitle>
            <DialogDescription>填写新知识库的信息。</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-kb-name" className="text-right">
                名称
              </Label>
              <Input
                id="new-kb-name"
                placeholder="知识库名称"
                className="col-span-3"
                value={newKbName}
                onChange={(e) => setNewKbName(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-kb-type" className="text-right">
                类型
              </Label>
              <Select value={newKbType} onValueChange={setNewKbType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="工蜂仓库">工蜂仓库</SelectItem>
                  <SelectItem value="iwiki文档">iwiki文档</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="new-kb-url" className="text-right">
                链接
              </Label>
              <Input
                id="new-kb-url"
                placeholder="https://example.com/kb"
                className="col-span-3"
                value={newKbUrl}
                onChange={(e) => setNewKbUrl(e.target.value)}
              />
            </div>
            {newKbType === "iwiki文档" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-kb-approver" className="text-right">
                  审批人
                </Label>
                <Input
                  id="new-kb-approver"
                  placeholder="审批人姓名"
                  className="col-span-3"
                  value={newKbApprover}
                  onChange={(e) => setNewKbApprover(e.target.value)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddKnowledgeBaseDialog(false)}>
              取消
            </Button>
            <Button type="submit" onClick={handleAddNewKnowledgeBase}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Confirmation Dialog */}
      <Dialog open={showPublishConfirmDialog} onOpenChange={setShowPublishConfirmDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "确认更新智能体" : "确认发布智能体"}</DialogTitle>
            <DialogDescription>
              请检查以下使用方式。点击"{isEditing ? "确认更新" : "确认发布"}"以{isEditing ? "更新" : "创建"}智能体。
            </DialogDescription>
          </DialogHeader>
          {apiInfoForConfirmation && (
            <div className="grid gap-6 py-4">
              <div>
                <Label className="text-lg font-medium mb-3 block">使用方式</Label>

                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">方式一：API调用</h4>
                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-gray-600">API端点</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input value={apiInfoForConfirmation.endpoint} readOnly className="font-mono text-xs" />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(apiInfoForConfirmation.endpoint, "confirmEndpoint")}
                          >
                            {copiedField === "confirmEndpoint" ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">API密钥</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input
                            value={apiInfoForConfirmation.apiKey}
                            readOnly
                            type={showConfirmApiKey ? "text" : "password"}
                            className="font-mono text-xs flex-grow"
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setShowConfirmApiKey(!showConfirmApiKey)}
                            className="p-1"
                          >
                            {showConfirmApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(apiInfoForConfirmation.apiKey, "confirmApiKey")}
                          >
                            {copiedField === "confirmApiKey" ? (
                              <Check className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-sm mb-2">方式二：CodeBuddy中使用</h4>
                    <p className="text-xs text-gray-600 mb-2">在CodeBuddy中直接@智能体名称即可调用：</p>
                    <div className="bg-gray-100 p-2 rounded text-xs font-mono">@{agentConfig.name} 你的问题或指令</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishConfirmDialog(false)}>
              取消
            </Button>
            <Button onClick={confirmAndPublish}>{isEditing ? "确认更新" : "确认发布"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

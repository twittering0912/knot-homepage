"use client"

import { useState } from "react"
import {
  ArrowLeft,
  Settings,
  Code,
  BarChart2,
  MessageSquare,
  Copy,
  Check,
  Bot,
  Zap,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
} from "lucide-react" // Added Edit3, Eye, EyeOff
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Agent } from "../types/agent"

interface AgentDetailPageProps {
  agent: Agent
  onBack: () => void
  onDelete: (agent: Agent) => void
  onEdit: (agent: Agent) => void // Added onEdit prop
}

const mockDialogues = [
  {
    id: 1,
    sessionId: "sess_abc123", // Added
    username: "user_001", // Added
    model: "deepseekV3", // Added
    timestamp: "2025-06-22 10:30:15",
    user: "你好，请问这个知识库是关于什么的？",
    assistant: "你好！这个知识库主要包含了我们公司的所有产品文档和开发规范。",
    tokens: 128,
  },
  {
    id: 2,
    sessionId: "sess_def456", // Added
    username: "user_002", // Added
    model: "deepseekR1", // Added
    timestamp: "2025-06-22 10:32:45",
    user: "如何部署polaris-go项目？",
    assistant: "部署polaris-go项目，您需要首先准备好Go语言环境，然后执行 `go build` 命令...",
    tokens: 256,
  },
  {
    id: 3,
    sessionId: "sess_ghi789", // Added
    username: "user_001", // Added
    model: "deepseekV3", // Added
    timestamp: "2025-06-21 15:10:02",
    user: "查询一下最近的订单",
    assistant: "对不起，我无法访问实时的订单数据。我的知识截止于2025年6月。",
    tokens: 96,
  },
]

// Mock data for display purposes, assuming these are defined elsewhere or passed as props
const availableKnowledgeBases = [
  { id: "kb1", name: "test-sisiychen", type: "代码库", icon: "🔶", bgColor: "bg-orange-100" },
  { id: "kb2", name: "sisiychen(备选)", type: "维基", icon: "W", bgColor: "bg-purple-100" },
]
const availableMCP = [
  { value: "web-search", label: "网络搜索" },
  { value: "code-execution", label: "代码执行" },
]
const availableRules = [
  { value: "safety-filter", label: "安全过滤" },
  { value: "response-length", label: "回复长度限制" },
]

export default function AgentDetailPage({ agent, onBack, onDelete, onEdit }: AgentDetailPageProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [showDetailApiKey, setShowDetailApiKey] = useState(false)

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-4 -ml-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回智能体列表
            </Button>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                <Bot className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{agent.config.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-gray-600">查看和管理您的智能体详情</p>
                  {agent.status === "运行中" && (
                    <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      {agent.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => onEdit(agent)}>
              <Edit3 className="w-4 h-4 mr-2" />
              编辑
            </Button>
            <Button variant="destructive" onClick={() => onDelete(agent)}>
              <Trash2 className="w-4 h-4 mr-2" />
              删除智能体
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="config">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">
            <Settings className="w-4 h-4 mr-2" />
            配置详情
          </TabsTrigger>
          <TabsTrigger value="api">
            <Code className="w-4 h-4 mr-2" />
            使用方式
          </TabsTrigger>
          <TabsTrigger value="dialogues">
            <MessageSquare className="w-4 h-4 mr-2" />
            对话数据
          </TabsTrigger>
          <TabsTrigger value="monitoring">
            <BarChart2 className="w-4 h-4 mr-2" />
            监控数据
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>基础配置</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <Label>智能体名称</Label>
                  <p className="text-gray-800">{agent.config.name}</p>
                </div>
                <div>
                  <Label>使用模型</Label>
                  <p className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded inline-block">
                    {agent.config.model}
                  </p>
                </div>
                <div>
                  <Label>系统Prompt</Label>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-md whitespace-pre-wrap">{agent.config.prompt}</p>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>知识库 ({agent.config.knowledgeBases.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {agent.config.knowledgeBases.length > 0 ? (
                    <ul className="space-y-2">
                      {agent.config.knowledgeBases.map((kb) => {
                        const kbDetails = availableKnowledgeBases.find((k) => k.id === kb)
                        return (
                          <li
                            key={kb}
                            className="flex items-center space-x-2 text-sm p-2 bg-blue-50 border border-blue-200 rounded-md"
                          >
                            <div
                              className={`w-6 h-6 ${kbDetails?.bgColor || "bg-gray-100"} rounded flex items-center justify-center text-xs`}
                            >
                              {kbDetails?.icon || <Bot className="w-4 h-4 text-blue-500" />}
                            </div>
                            <span>{kbDetails?.name || kb}</span>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">未配置知识库</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>MCP服务 ({agent.config.mcpServices.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {agent.config.mcpServices.length > 0 ? (
                    <ul className="space-y-2">
                      {agent.config.mcpServices.map((mcp) => {
                        const mcpDetails = availableMCP.find((s) => s.value === mcp)
                        return (
                          <li
                            key={mcp}
                            className="flex items-center space-x-2 text-sm p-2 bg-green-50 border border-green-200 rounded-md"
                          >
                            <Zap className="w-4 h-4 text-green-500" />
                            <span>{mcpDetails?.label || mcp}</span>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">未配置MCP服务</p>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Rules规则 ({agent.config.rules.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {agent.config.rules.length > 0 ? (
                    <ul className="space-y-2">
                      {agent.config.rules.map((rule) => {
                        const ruleDetails = availableRules.find((r) => r.value === rule)
                        return (
                          <li
                            key={rule}
                            className="flex items-center space-x-2 text-sm p-2 bg-purple-50 border border-purple-200 rounded-md"
                          >
                            <Code className="w-4 h-4 text-purple-500" />
                            <span>{ruleDetails?.label || rule}</span>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">未配置Rules规则</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="api" className="py-6">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>方式一：API调用</CardTitle>
                <CardDescription>通过API接口与您的智能体进行交互。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">API端点</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value={agent.apiInfo.endpoint} readOnly className="font-mono text-sm flex-grow" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(agent.apiInfo.endpoint, "endpoint")}
                    >
                      {copiedField === "endpoint" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">API密钥</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      value={agent.apiInfo.apiKey}
                      readOnly
                      type={showDetailApiKey ? "text" : "password"}
                      className="font-mono text-sm flex-grow"
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowDetailApiKey(!showDetailApiKey)}
                      className="p-2"
                    >
                      {showDetailApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyToClipboard(agent.apiInfo.apiKey, "apiKey")}>
                      {copiedField === "apiKey" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">智能体ID</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input value={agent.apiInfo.agentId} readOnly className="font-mono text-sm flex-grow" />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(agent.apiInfo.agentId, "agentId")}
                    >
                      {copiedField === "agentId" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="pt-4">
                  <Label className="text-sm font-medium">调用示例 (cURL)</Label>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto mt-1">
                    <pre>{`curl -X POST "${agent.apiInfo.endpoint}/chat" \\
-H "Authorization: Bearer ${agent.apiInfo.apiKey}" \\
-H "Content-Type: application/json" \\
-d '{
"message": "你好，请介绍一下你的功能",
"stream": false
}'`}</pre>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() =>
                      copyToClipboard(
                        `curl -X POST "${agent.apiInfo.endpoint}/chat" \\\n-H "Authorization: Bearer ${agent.apiInfo.apiKey}" \\\n-H "Content-Type: application/json" \\\n-d '{\n  "message": "你好，请介绍一下你的功能",\n  "stream": false\n}'`,
                        "curlExample",
                      )
                    }
                  >
                    {copiedField === "curlExample" ? (
                      <Check className="w-4 h-4 mr-2" />
                    ) : (
                      <Copy className="w-4 h-4 mr-2" />
                    )}
                    复制示例代码
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>方式二：CodeBuddy中使用</CardTitle>
                <CardDescription>在CodeBuddy中直接@智能体名称即可调用。</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">使用格式</Label>
                    <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm mt-1">
                      @{agent.config.name} 你的问题或指令
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">使用示例</Label>
                    <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm mt-1">
                      @{agent.config.name} 请帮我分析一下这段代码的性能问题
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dialogues" className="py-6">
          <Card>
            <CardHeader>
              <CardTitle>对话数据</CardTitle>
              <CardDescription>查看最近与该智能体的对话记录。</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">会话ID</TableHead> {/* Added */}
                    <TableHead className="w-[100px]">用户名</TableHead> {/* Added */}
                    <TableHead className="w-[100px]">模型</TableHead> {/* Added */}
                    <TableHead className="w-[200px]">时间戳</TableHead>
                    <TableHead>用户提问</TableHead>
                    <TableHead>智能体回复</TableHead>
                    <TableHead className="text-right">Token数</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockDialogues.map((dialogue) => (
                    <TableRow key={dialogue.id}>
                      <TableCell className="font-medium">{dialogue.sessionId}</TableCell>
                      <TableCell>{dialogue.username}</TableCell>
                      <TableCell>{dialogue.model}</TableCell>
                      <TableCell>{dialogue.timestamp}</TableCell>
                      <TableCell className="font-medium">{dialogue.user}</TableCell>
                      <TableCell>{dialogue.assistant}</TableCell>
                      <TableCell className="text-right">{dialogue.tokens}</TableCell>
                    </TableRow>
                  ))}
                  {mockDialogues.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                        暂无对话数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="py-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">总调用次数</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均响应时间</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1.2s</div>
                <p className="text-xs text-muted-foreground">-5.2% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">错误率</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0.8%</div>
                <p className="text-xs text-muted-foreground">+0.1% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">平均Token数</CardTitle>
                <BarChart2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">180</div>
                <p className="text-xs text-muted-foreground">per request</p>
              </CardContent>
            </Card>
          </div>
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>调用量趋势</CardTitle>
                <CardDescription>过去30天的每日API调用量。</CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center bg-gray-50 rounded-md">
                <p className="text-gray-500">[图表占位符 - 调用量趋势]</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}

"use client"
import { Plus, Bot, Sparkles, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import type { Agent } from "../types/agent"

interface AgentPageProps {
  agents: Agent[]
  onCreate: () => void
  onViewDetail: (agent: Agent) => void
}

export default function AgentPage({ agents, onCreate, onViewDetail }: AgentPageProps) {
  if (agents.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center min-h-[600px] text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-8">
            <Bot className="w-16 h-16 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">创建智能体，让AI成为您最得力的工作伙伴</h1>

          <p className="text-lg text-gray-600 mb-8 max-w-2xl">
            根据业务需求定制智能体，自动执行复杂任务，关键运营数据一目了然。

          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button size="lg" className="flex items-center space-x-2" onClick={onCreate}>
              <Plus className="w-5 h-5" />
              <span>新建智能体</span>
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <Card className="text-left">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">垂直</h3>
                <p className="text-gray-600 text-sm">基于专属业务场景，定制智能体</p>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">集成</h3>
                <p className="text-gray-600 text-sm">聚合知识库、MCP、Rules等上下文</p>
              </CardContent>
            </Card>

            <Card className="text-left">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <div className="w-6 h-6 text-purple-600 font-bold">🔗</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">运营</h3>
                <p className="text-gray-600 text-sm">便捷观测对话效果及监控运营数据</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">我的智能体</h1>
          <p className="text-gray-600 mt-1">管理和查看您已发布的智能体。</p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="w-4 h-4 mr-2" />
          新建智能体
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.apiInfo.agentId} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-blue-600" />
                  </div>
                  <span>{agent.config.name}</span>
                </CardTitle>
                {agent.status === "运行中" && (
                  <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {agent.status}
                  </span>
                )}
              </div>
              <CardDescription className="pt-2 line-clamp-2 h-[40px]">
                {agent.config.prompt || "暂无描述"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex items-center">
                  <span className="font-medium w-20">模型:</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">{agent.config.model}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-20">知识库:</span>
                  <span>{agent.config.knowledgeBases.length} 个</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-20">MCP服务:</span>
                  <span>{agent.config.mcpServices.length} 个</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => onViewDetail(agent)}>
                查看详情
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  )
}

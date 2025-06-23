"use client"

import { useState } from "react"
import { User } from "lucide-react"
import KnowledgeBasePage from "../components/knowledge-base-page"
import AgentPage from "../components/agent-page"
import CreateAgentPage from "../components/create-agent-page"
import AgentDetailPage from "../components/agent-detail-page"
import ConfirmDialog from "../components/confirm-dialog"
import type { Agent } from "../types/agent"

type View = "list" | "create" | "detail"

export default function Page() {
  const [activeTab, setActiveTab] = useState("智能体")
  const [agentView, setAgentView] = useState<View>("list")
  const [publishedAgents, setPublishedAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [agentToEdit, setAgentToEdit] = useState<Agent | null>(null)

  const [agentPendingDeletion, setAgentPendingDeletion] = useState<Agent | null>(null)
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false)

  const handlePublishAgent = (agentData: Agent) => {
    setPublishedAgents((prevAgents) => {
      const existingAgentIndex = prevAgents.findIndex((a) => a.apiInfo.agentId === agentData.apiInfo.agentId)
      if (existingAgentIndex !== -1) {
        // Update existing agent
        const updatedAgents = [...prevAgents]
        updatedAgents[existingAgentIndex] = agentData
        return updatedAgents
      } else {
        // Add new agent
        return [...prevAgents, agentData]
      }
    })
    setAgentView("list")
    setAgentToEdit(null) // Clear editing state
    setSelectedAgent(null) // Clear selected agent as we are back to list
  }

  const handleViewAgentDetail = (agent: Agent) => {
    setSelectedAgent(agent)
    setAgentView("detail")
  }

  const handleBackToList = () => {
    setSelectedAgent(null)
    setAgentToEdit(null) // Clear editing state if any
    setAgentView("list")
  }

  const handleRequestEditAgent = (agent: Agent) => {
    setAgentToEdit(agent)
    setAgentView("create")
  }

  const requestDeleteAgent = (agent: Agent) => {
    setAgentPendingDeletion(agent)
    setShowDeleteConfirmDialog(true)
  }

  const confirmDeleteAgent = () => {
    if (agentPendingDeletion) {
      setPublishedAgents((prev) => prev.filter((a) => a.apiInfo.agentId !== agentPendingDeletion.apiInfo.agentId))
      if (selectedAgent?.apiInfo.agentId === agentPendingDeletion.apiInfo.agentId) {
        handleBackToList() // Also clears selectedAgent
      }
    }
    setShowDeleteConfirmDialog(false)
    setAgentPendingDeletion(null)
  }

  const renderAgentContent = () => {
    switch (agentView) {
      case "create":
        return (
          <CreateAgentPage onBack={handleBackToList} onPublish={handlePublishAgent} initialAgentData={agentToEdit} />
        )
      case "detail":
        if (selectedAgent) {
          return (
            <AgentDetailPage
              agent={selectedAgent}
              onBack={handleBackToList}
              onDelete={requestDeleteAgent}
              onEdit={handleRequestEditAgent}
            />
          )
        }
        setAgentView("list") // Fallback
        return null
      case "list":
      default:
        return (
          <AgentPage
            agents={publishedAgents}
            onViewDetail={handleViewAgentDetail}
            onCreate={() => {
              setAgentToEdit(null) // Ensure not in edit mode when creating new
              setAgentView("create")
            }}
          />
        )
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "智能体":
        return renderAgentContent()
      case "知识库":
      case "MCP":
      case "Rules":
        return (
          <div className="flex items-center justify-center h-[60vh] text-center">
            <p className="text-gray-500 text-lg">
              此页面 ({activeTab}) 正在建设中。
              <br />
              请先体验 "智能体" 功能。
            </p>
          </div>
        )
      case "首页":
      default:
        return <KnowledgeBasePage />
    }
  }

  const navItems = ["首页", "智能体", "知识库", "MCP", "Rules"]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">K</span>
                </div>
                <span className="text-xl font-semibold text-gray-900">Knot</span>
              </div>

              <nav className="flex space-x-8">
                {navItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => setActiveTab(item)}
                    className={`px-3 py-2 text-sm font-medium border-b-2 ${
                      activeTab === item
                        ? "text-gray-900 border-blue-600"
                        : "text-gray-500 hover:text-gray-900 border-transparent"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">
                帮助中心
              </a>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700">sisiychen</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {renderContent()}

      <ConfirmDialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
        title="确认删除智能体"
        description={`您确定要删除智能体 "${agentPendingDeletion?.config.name}" 吗？此操作无法撤销。`}
        onConfirm={confirmDeleteAgent}
      />
    </div>
  )
}

export interface AgentConfig {
  name: string
  model: string
  prompt: string
  knowledgeBases: string[]
  mcpServices: string[]
  rules: string[]
}

export interface Agent {
  config: AgentConfig
  apiInfo: {
    endpoint: string
    apiKey: string
    agentId: string
  }
  status: string // Added status field
}

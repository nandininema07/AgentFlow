"use client"
import { useCallback, useState } from "react"
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes,
} from "reactflow"
import "reactflow/dist/style.css"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PersonaNode } from "@/components/nodes/persona-node"
import { DocumentsNode } from "@/components/nodes/documents-node"
import { TaskNode } from "@/components/nodes/task-node"
import { UpdatesNode } from "@/components/nodes/updates-node"

// Define custom node types
const nodeTypes: NodeTypes = {
  persona: PersonaNode,
  documents: DocumentsNode,
  task: TaskNode,
  updates: UpdatesNode,
}

// Pre-configured nodes based on the provided JSON
const initialNodes: Node[] = [
  {
    id: "persona-001",
    type: "persona",
    position: { x: 100, y: 100 },
    data: {
      label: "Digital Marketing Specialist",
      description:
        "An AI agent specializing in digital marketing, SEO, content strategy, and social media management.",
      role: "Analytical, creative, data-driven, strategic",
    },
  },
  {
    id: "documents-001",
    type: "documents",
    position: { x: 300, y: 100 },
    data: {
      label: "Brand Guidelines",
      sources: ["/marketing/brand_guidelines.pdf"],
    },
  },
  {
    id: "documents-002",
    type: "documents",
    position: { x: 300, y: 200 },
    data: {
      label: "Keyword Research Report",
      sources: ["/marketing/keyword_research_2024.xlsx"],
    },
  },
  {
    id: "task-seo-optimizer",
    type: "task",
    position: { x: 500, y: 100 },
    data: {
      label: "SEO Optimizer",
      subtype: "seoOptimizer",
      keywords: ["organic seo", "digital marketing trends", "content marketing strategy"],
      content: "Optimizing blog content for target keywords...",
      frequency: "daily",
    },
  },
  {
    id: "task-competitor-watchdog",
    type: "task",
    position: { x: 500, y: 200 },
    data: {
      label: "Competitor Watchdog",
      subtype: "competitorWatchdog",
      websites: ["competitor1.com", "competitor2.com"],
      frequency: "weekly",
    },
  },
  {
    id: "task-post-creator",
    type: "task",
    position: { x: 700, y: 100 },
    data: {
      label: "Post Creator",
      subtype: "postCreator",
      topic: "Top 5 Digital Marketing Trends in 2024",
      platform: "LinkedIn",
      frequency: "weekly",
    },
  },
  {
    id: "task-smart-email-manager",
    type: "task",
    position: { x: 700, y: 200 },
    data: {
      label: "Smart Email Manager",
      subtype: "smartEmailManager",
      action: "Send",
      recipient: "leads@example.com",
      subject: "Exclusive Insights: [Topic] Trends for 2024",
      body: "Dear [Name],\n\nWe're excited to share our latest insights on...",
      tone: "persuasive",
      role: "Marketing Manager",
      company_name: "Acme Marketing Solutions",
      custom_inclusions: "Include a link to our latest case study",
      word_limit: 200,
      template_reuse: true,
      frequency: "weekly",
    },
  },
  {
    id: "task-customer-feedback-analyzer",
    type: "task",
    position: { x: 900, y: 100 },
    data: {
      label: "Customer Feedback Analyzer",
      subtype: "customerFeedbackAnalyzer",
      sourceType: "api",
      apiEndpoint: "https://api.example.com/feedback",
      frequency: "daily",
    },
  },
  {
    id: "updates-api",
    type: "updates",
    position: { x: 1100, y: 100 },
    data: {
      label: "API Updates",
      frequency: "daily",
      endpoint: "https://api.example.com/marketing_alerts",
    },
  },
  {
    id: "updates-mail",
    type: "updates",
    position: { x: 1100, y: 200 },
    data: {
      label: "Email Updates",
      frequency: "daily",
      recipient: "marketing_team@example.com",
    },
  },
]

// Initial edges connecting the nodes
const initialEdges: Edge[] = [
  { id: "e1-2", source: "persona-001", target: "documents-001" },
  { id: "e1-3", source: "persona-001", target: "documents-002" },
  { id: "e2-4", source: "documents-001", target: "task-seo-optimizer" },
  { id: "e3-5", source: "documents-002", target: "task-competitor-watchdog" },
  { id: "e4-6", source: "task-seo-optimizer", target: "task-post-creator" },
  { id: "e5-7", source: "task-competitor-watchdog", target: "task-smart-email-manager" },
  { id: "e6-8", source: "task-post-creator", target: "task-customer-feedback-analyzer" },
  { id: "e7-9", source: "task-smart-email-manager", target: "updates-api" },
  { id: "e8-10", source: "task-customer-feedback-analyzer", target: "updates-mail" },
]

export default function MarketingAgencyCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex">
      {/* Canvas */}
      <div className="flex-1 overflow-auto h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
"use client"
import { DocumentsNode } from "@/components/nodes/documents-node"
import { PersonaNode } from "@/components/nodes/persona-node"
import { TaskNode } from "@/components/nodes/task-node"
import { UpdatesNode } from "@/components/nodes/updates-node"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Crown, FolderOpen, Lock, Plus, Save } from "lucide-react"
import type React from "react"
import { useCallback, useRef, useState } from "react"
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Panel,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes
} from "reactflow"
import "reactflow/dist/style.css"
import { AgentNode } from "./nodes/agent-node"

// Define custom node types
const nodeTypes: NodeTypes = {
  agent: AgentNode,
  persona: PersonaNode,
  documents: DocumentsNode,
  task: TaskNode,
  updates: UpdatesNode,
}

// Initial nodes and edges
const initialNodes: Node[] = [
  {
    id: "agent-core",
    type: "agent",
    position: { x: window.innerWidth / 2 - 100, y: window.innerHeight / 2 - 50 },
    data: {},
    deletable: false,
    draggable: false,
  },
]
const initialEdges: Edge[] = []

export function CanvasView() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  )
}

function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [showTaskModal, setShowTaskModal] = useState(false)

  // Handle connections between nodes
  const onConnect = useCallback((params: Connection) => {
    const sourceNode = nodes.find((n) => n.id === params.source)
    const targetNode = nodes.find((n) => n.id === params.target)

    // Prevent core node connections to anything except agent
    if (["persona", "documents", "updates"].includes(sourceNode?.type!)) {
      if (targetNode?.type !== "agent") return
      if (params.targetHandle !== sourceNode?.type) return
    }

    // Task workflow connections
    if (sourceNode?.type === "task") {
      if (targetNode?.type !== "task" && targetNode?.type !== "agent") return
      if (targetNode?.type === "agent" && params.targetHandle !== "task-workflow") return
    }

    setEdges((eds) => addEdge(params, eds))
  }, [setEdges, nodes])

  // Handle node selection
  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
  }, [])

  // Handle node data update
  const updateNodeData = useCallback(
    (id: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            // Create a deep copy of the existing data to avoid reference issues
            const updatedData = {
              ...node.data,
              ...newData,
            };
            
            // Ensure no undefined values for form fields
            Object.keys(updatedData).forEach(key => {
              if (updatedData[key] === undefined && 
                  (key === 'label' || key === 'description' || key === 'role')) {
                updatedData[key] = '';
              }
            });
            
            return {
              ...node,
              data: updatedData,
            };
          }
          return node;
        }),
      );
    },
    [setNodes],
  );

  // Add a new node
  const addNode = useCallback(
    (type: string, subtype?: string) => {
      if (type === "task" && !subtype) {
        setShowTaskModal(true)
        return
      }

      const newNode: Node = {
        id: `${Date.now()}`,
        type,
        position: {
          x: Math.random() * 500,
          y: Math.random() * 500,
        },
        data: {
          label: subtype
            ? `${subtype.replace(/([A-Z])/g, " $1").trim()} Node`
            : `New ${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          description: "Add a description here",
          role: "", // Initialize with empty string instead of undefined
          subtype: subtype,
          onUpdate: updateNodeData,
        },
      }

      // Initialize default data for specific node types
      if (type === "persona") {
        newNode.data.role = ""
      } else if (type === "documents") {
        newNode.data.sources = []
      } else if (type === "updates") {
        newNode.data.frequency = ""
      } else if (type === "task" && subtype) {
        // Initialize task subtypes
        newNode.data = {
          ...newNode.data,
          ...(subtype === "smartEmailManager" && { action: "send" }),
          ...(subtype === "customerFeedbackAnalyzer" && { sourceType: "csv" }),
          ...(subtype === "meetingSummarizer" && { sourceType: "file" }),
          ...(subtype === "contractSummarizer" && { sourceType: "file" }),
        }
      }

      setNodes((nds) => [...nds, newNode])
    },
    [nodes, setNodes, updateNodeData],
  )

  // Delete selected node
  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode || selectedNode.type === "agent") return
    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id))
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id))
    setSelectedNode(null)
  }, [selectedNode, setNodes, setEdges])

  // Save workflow
  const saveWorkflow = useCallback(async () => {
    const workflow = {
      nodes,
      edges,
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/agents/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(workflow),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()
      console.log("Workflow saved successfully:", data)
      alert("Workflow saved successfully!")
    } catch (error) {
      console.error("Error saving workflow:", error)
      alert("Failed to save workflow.")
    }
  }, [nodes, edges])

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex">
      {/* Task Type Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg grid grid-cols-2 gap-4 w-[600px]">
            <h3 className="col-span-2 text-lg font-semibold mb-4">Free Components</h3>

            {[

              // complex components
              "seoOptimizer",
              "competitorWatchdog",
              "productRecommendationAI",
              "postCreator",
              "smartEmailManager",
              "meetingSummarizer",
              "customerFeedbackAnalyzer",
              "contractSummarizer",
              "aiResearchAssistant",
              "regulatoryComplianceWatchdog",
            ].map((taskType) => (
              <Button
                key={taskType}
                variant="outline"
                onClick={() => {
                  addNode("task", taskType)
                  setShowTaskModal(false)
                }}
              >

                {taskType
                  .replace(/([A-Z])/g, " $1")
                  .trim()
                  .toLowerCase()
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </Button>
            ))}
            <h3 className="col-span-2 text-lg font-semibold mb-4"> <Crown className="inline-block mr-4"/> Premium Components</h3>

            {[
              // simple compoents
              "mailSender",
              "aiPrompter",
              "scrapeWebPage",
              "summriseData",
              "createImage",
              "callApi",

            ].map((taskType) => (
              <Button
                key={taskType}
                disabled
                variant="secondary"
                onClick={() => {
                  addNode("task", taskType)
                  setShowTaskModal(false)
                }}
              >
                <Lock className="mr-2 h-4 w-4" />
                {taskType
                  .replace(/([A-Z])/g, " $1")
                  .trim()
                  .toLowerCase()
                  .replace(/\b\w/g, (char) => char.toUpperCase())}
              </Button>
            ))}

          </div>
        </div>
      )}

      {/* Node Palette */}
      <div className="w-[20%] border-r p-4 overflow-y-auto">
        <h3 className="font-bold mb-4">Node Palette</h3>
        <Button onClick={() => addNode("persona")} className="w-full mb-2">
          Add Persona
        </Button>
        <Button onClick={() => addNode("documents")} className="w-full mb-2">
          Add Documents
        </Button>
        <Button onClick={() => addNode("task")} className="w-full mb-2">
          Add Task
        </Button>
        <Button onClick={() => addNode("updates")} className="w-full mb-2">
          Add Updates
        </Button>

        <h3 className="font-bold mt-4 mb-2">Workflow Actions</h3>
        <Button onClick={saveWorkflow} className="w-full mb-2">
          <Save className="mr-2 h-4 w-4" />
          Save Workflow
        </Button>
        <Button className="w-full mb-2">
          <FolderOpen className="mr-2 h-4 w-4" />
          Load Workflow
        </Button>
        <Button className="w-full mb-2">
          <Plus className="mr-2 h-4 w-4" />
          New Workflow
        </Button>
      </div>

      {/* Canvas */}
      <div ref={reactFlowWrapper} className="flex-1 overflow-auto h-full w-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <Panel position="top-right" className="flex gap-2">
            {selectedNode && (
              <Button variant="destructive" onClick={deleteSelectedNode}>
                Delete Node
              </Button>
            )}
          </Panel>
        </ReactFlow>
      </div>

      {/* Inspector Panel */}
      {selectedNode && (
        <div className="w-[30%] border-l p-4 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>Node Inspector</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="node-label">Label</Label>
                <Input
                  id="node-label"
                  value={selectedNode.data.label}
                  onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="node-description">Description</Label>
                <Textarea
                  id="node-description"
                  value={selectedNode.data.description}
                  onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                />
              </div>

              {/* Dynamic Node Inputs */}
              {selectedNode.type === "persona" && (
                <div className="space-y-2">
                  <Label htmlFor="persona-role">Role</Label>
                  <Select
                    value={selectedNode.data.role || ""}
                    onValueChange={(value) => updateNodeData(selectedNode.id, { role: value })}
                  >
                    <SelectTrigger id="persona-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assistant">Assistant</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="analyst">Analyst</SelectItem>
                      <SelectItem value="researcher">Researcher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedNode.type === "documents" && (
                <div className="space-y-2">
                  <Label htmlFor="documents-sources">Sources</Label>
                  <Textarea
                    id="documents-sources"
                    value={selectedNode.data.sources?.join("\n") || ""}
                    onChange={(e) =>
                      updateNodeData(selectedNode.id, {
                        sources: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                    placeholder="Enter one source per line"
                  />
                </div>
              )}

              {selectedNode.type === "updates" && (
                <div className="space-y-2">
                  <Label htmlFor="updates-frequency">Frequency</Label>
                  <Select
                    value={selectedNode.data.frequency || ""}
                    onValueChange={(value) => updateNodeData(selectedNode.id, { frequency: value })}
                  >
                    <SelectTrigger id="updates-frequency">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedNode.type === "task" && (
                <TaskNodeInspector node={selectedNode} updateNodeData={updateNodeData} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// Helper component for task node inspector
const TaskNodeInspector = ({ node, updateNodeData }: any) => {
  const taskInputs = {
    seoOptimizer: ({ data, updateData }) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Keywords</Label>
          <Textarea
            value={data.keywords?.join("\n") || ""}
            onChange={(e) => updateData("keywords", e.target.value.split("\n"))}
            placeholder="One keyword per line"
          />
        </div>
        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea
            value={data.content || ""}
            onChange={(e) => updateData("content", e.target.value)}
            placeholder="Content to optimize"
          />
        </div>
      </div>
    ),

    competitorWatchdog: ({ data, updateData }) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Websites</Label>
          <Textarea
            value={data.websites?.join("\n") || ""}
            onChange={(e) => updateData("websites", e.target.value.split("\n"))}
            placeholder="One URL per line"
          />
        </div>
        <div className="space-y-2">
          <Label>Frequency</Label>
          <Select
            value={data.frequency || ""}
            onValueChange={(v) => updateData("frequency", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    ),

    productRecommendationAI: ({ data, updateData }) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Products</Label>
          <Textarea
            value={data.products?.join("\n") || ""}
            onChange={(e) => updateData("products", e.target.value.split("\n"))}
            placeholder="One product per line"
          />
        </div>
        <div className="space-y-2">
          <Label>Data Source</Label>
          <Select
            value={data.source || ""}
            onValueChange={(v) => updateData("source", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="purchase-history">Purchase History</SelectItem>
              <SelectItem value="browsing-history">Browsing History</SelectItem>
              <SelectItem value="demographics">Demographics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    ),

    postCreator: ({ data, updateData }) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Topic</Label>
          <Input
            value={data.topic || ""}
            onChange={(e) => updateData("topic", e.target.value)}
            placeholder="Enter post topic"
          />
        </div>
        <div className="space-y-2">
          <Label>Platform</Label>
          <Select
            value={data.platform || ""}
            onValueChange={(v) => updateData("platform", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="blog">Blog</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    ),

    smartEmailManager: ({ data, updateData }) => {
      const renderInputs = () => {
        switch (data.action) {
          case "send":
            return (
              <>
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <Input
                    value={data.recipient || ""}
                    onChange={(e) => updateData("recipient", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    value={data.subject || ""}
                    onChange={(e) => updateData("subject", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Body</Label>
                  <Textarea
                    value={data.body || ""}
                    onChange={(e) => updateData("body", e.target.value)}
                  />
                </div>
              </>
            )
          case "summarize":
            return (
              <div className="space-y-2">
                <Label>Inbox URL</Label>
                <Input
                  value={data.inbox || ""}
                  onChange={(e) => updateData("inbox", e.target.value)}
                />
              </div>
            )
          case "filter":
            return (
              <div className="space-y-2">
                <Label>Keywords</Label>
                <Textarea
                  value={data.filterKeywords?.join("\n") || ""}
                  onChange={(e) => updateData("filterKeywords", e.target.value.split("\n"))}
                  placeholder="One keyword per line"
                />
              </div>
            )
          default:
            return null
        }
      }

      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Action</Label>
            <Select
              value={data.action || ""}
              onValueChange={(v) => updateData("action", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send">Send</SelectItem>
                <SelectItem value="summarize">Summarize</SelectItem>
                <SelectItem value="filter">Filter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {renderInputs()}
        </div>
      )
    },

    meetingSummarizer: ({ data, updateData }) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Source Type</Label>
          <Select
            value={data.sourceType}
            onValueChange={(v) => updateData("sourceType", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="file">File Upload</SelectItem>
              <SelectItem value="url">URL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Source Path</Label>
          <Input
            value={data.source || ""}
            onChange={(e) => updateData("source", e.target.value)}
          />
        </div>
      </div>
    ),

    customerFeedbackAnalyzer: ({ data, updateData }) => {
      const renderInputs = () => {
        switch (data.sourceType) {
          case "csv":
            return (
              <div className="space-y-2">
                <Label>CSV Path</Label>
                <Input
                  value={data.csvPath || ""}
                  onChange={(e) => updateData("csvPath", e.target.value)}
                />
              </div>
            )
          case "api":
            return (
              <div className="space-y-2">
                <Label>API Endpoint</Label>
                <Input
                  value={data.apiEndpoint || ""}
                  onChange={(e) => updateData("apiEndpoint", e.target.value)}
                />
              </div>
            )
          case "text":
            return (
              <div className="space-y-2">
                <Label>Feedback Text</Label>
                <Textarea
                  value={data.feedbackText || ""}
                  onChange={(e) => updateData("feedbackText", e.target.value)}
                />
              </div>
            )
          default:
            return null
        }
      }

      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Source Type</Label>
            <Select
              value={data.sourceType}
              onValueChange={(v) => updateData("sourceType", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="api">API</SelectItem>
                <SelectItem value="text">Text</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {renderInputs()}
        </div>
      )
    },

    contractSummarizer: ({ data, updateData }) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Source Type</Label>
          <Select
            value={data.sourceType}
            onValueChange={(v) => updateData("sourceType", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="file">File Upload</SelectItem>
              <SelectItem value="url">URL</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Source Path</Label>
          <Input
            value={data.source || ""}
            onChange={(e) => updateData("source", e.target.value)}
          />
        </div>
      </div>
    ),

    aiResearchAssistant: ({ data, updateData }) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Research Topics</Label>
          <Textarea
            value={data.topics?.join("\n") || ""}
            onChange={(e) => updateData("topics", e.target.value.split("\n"))}
            placeholder="One topic per line"
          />
        </div>
        <div className="space-y-2">
          <Label>Data Sources</Label>
          <div className="grid gap-2">
            {["scholar", "legal", "patents", "news"].map((source) => (
              <div key={source} className="flex items-center gap-2">
                <Checkbox
                  id={source}
                  checked={data.sources?.includes(source)}
                  onCheckedChange={(checked) => {
                    const sources = new Set(data.sources || [])
                    checked ? sources.add(source) : sources.delete(source)
                    updateData("sources", Array.from(sources))
                  }}
                />
                <Label htmlFor={source} className="font-normal">
                  {source.charAt(0).toUpperCase() + source.slice(1)}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    regulatoryComplianceWatchdog: ({ data, updateData }) => (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Regulatory Bodies</Label>
          <Textarea
            value={data.bodies?.join("\n") || ""}
            onChange={(e) => updateData("bodies", e.target.value.split("\n"))}
            placeholder="e.g., FDA, SEC"
          />
        </div>
        <div className="space-y-2">
          <Label>Keywords</Label>
          <Textarea
            value={data.keywords?.join("\n") || ""}
            onChange={(e) => updateData("keywords", e.target.value.split("\n"))}
            placeholder="Keywords to monitor"
          />
        </div>
      </div>
    ),
  }

  const TaskForm = taskInputs[node.data.subtype] || (() => null)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Task Type</Label>
        <Input
          value={node.data.subtype?.replace(/([A-Z])/g, " $1").trim() || ""}
          disabled
        />
      </div>

      <TaskForm
        data={node.data}
        updateData={(key: string, value: any) =>
          updateNodeData(node.id, { [key]: value })
        }
      />
    </div>
  )
}
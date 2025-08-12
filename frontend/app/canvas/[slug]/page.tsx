"use client";

import { useEffect, useState, use } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonaNode } from "@/components/nodes/persona-node";
import { DocumentsNode } from "@/components/nodes/documents-node";
import { TaskNode } from "@/components/nodes/task-node";
import { UpdatesNode } from "@/components/nodes/updates-node";
import { ChartBar, Loader2, Play, Power, Save, FolderOpen, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// Define types for the API response
interface AgentPersona {
  name: string;
  qualities: string;
  description: string;
}

interface AgentDocument {
  name: string;
  path: string;
}

interface BaseTask {
  type: string;
  frequency: string;
  last_run: string;
}

interface SeoOptimizerTask extends BaseTask {
  type: "seo_optimizer";
  keywords: string[];
  content: string;
}

interface CompetitorWatchdogTask extends BaseTask {
  type: "competitor_watchdog";
  websites: string[];
}

interface ProductRecommendationTask extends BaseTask {
  type: "product_recommendation";
  products: string[];
  user_data_source: string;
  source_url: string;
  uploaded_csv_path: string;
  company_pdf_path: string;
}

interface PostCreatorTask extends BaseTask {
  type: "post_creator";
  topic: string;
  platform: string;
}

interface SmartEmailManagerTask extends BaseTask {
  type: "smart_email_manager";
  action: string;
  to: string[];
  cc: string[];
  bcc: string[];
  subject: string;
  body: string;
  inbox: string;
  keywords: string[];
  tone: string;
  role: string;
  company_name: string;
  custom_inclusions: string;
  word_limit: number;
  template_reuse: boolean;
}

interface MeetingSummarizerTask extends BaseTask {
  type: "meeting_summarizer";
  recording_source: string;
  source_url: string;
}

interface CustomerFeedbackAnalyzerTask extends BaseTask {
  type: "customer_feedback_analyzer";
  feedback_source: string;
  file_path: string;
  api_endpoint: string;
  feedback_text: string;
}

interface ContractSummarizerTask extends BaseTask {
  type: "contract_summarizer";
  contract_source: string;
  source_url: string;
}

interface AiResearchAssistantTask extends BaseTask {
  type: "ai_research_assistant";
  research_topics: string[];
  data_sources: string[];
}

interface RegulatoryComplianceWatchdogTask extends BaseTask {
  type: "regulatory_compliance_watchdog";
  regulatory_bodies: string[];
  keywords: string[];
}

type AgentTask =
  | SeoOptimizerTask
  | CompetitorWatchdogTask
  | ProductRecommendationTask
  | PostCreatorTask
  | SmartEmailManagerTask
  | MeetingSummarizerTask
  | CustomerFeedbackAnalyzerTask
  | ContractSummarizerTask
  | AiResearchAssistantTask
  | RegulatoryComplianceWatchdogTask;

interface ApiUpdate {
  type: "api";
  endpoint: string;
}

interface MailUpdate {
  type: "mail";
  to: string;
}

type AgentUpdate = ApiUpdate | MailUpdate;

interface AgentData {
  id: string;
  persona: AgentPersona;
  documents: AgentDocument[];
  tasks: AgentTask[];
  updates: AgentUpdate[];
}

// Define custom node types
const nodeTypes: NodeTypes = {
  persona: PersonaNode,
  documents: DocumentsNode,
  task: TaskNode,
  updates: UpdatesNode,
};

// Helper function to convert snake_case to camelCase
const snakeToCamel = (str: string): string =>
  str.replace(/_([a-z])/g, (match, p1) => p1.toUpperCase());

// Helper function to convert task type to subtype format
const formatTaskSubtype = (type: string): string => {
  const camelCase = snakeToCamel(type);
  return camelCase.charAt(0).toLowerCase() + camelCase.slice(1);
};

export default function AgentCanvas({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [nextNodeId, setNextNodeId] = useState<number>(0);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/agents/${slug}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch agent data: ${response.statusText}`);
        }
        
        const agentData: AgentData = await response.json();
        
        // Build nodes and edges from the agent data
        const generatedNodes: Node[] = [];
        const generatedEdges: Edge[] = [];
        let nodeIndex = 0;
        let lastNodeId: string | null = null;
        
        // Add persona node
        const personaId = `persona-${nodeIndex}`;
        generatedNodes.push({
          id: personaId,
          type: "persona",
          position: { x: 100, y: 100 },
          data: {
            label: agentData.persona.name || "Agent Persona",
            description: agentData.persona.description || "",
            role: agentData.persona.qualities || "",
          },
        });
        
        lastNodeId = personaId;
        nodeIndex++;
        
        // Add document nodes
        if (agentData.documents && agentData.documents.length > 0) {
          agentData.documents.forEach((doc, index) => {
            const docId = `documents-${nodeIndex}`;
            generatedNodes.push({
              id: docId,
              type: "documents",
              position: { x: 500, y: 200 + (index * 200) },
              data: {
                label: doc.name || `Document ${index + 1}`,
                sources: [doc.path || ""],
              },
            });
            
            // Connect persona to document
            if (lastNodeId) {
              generatedEdges.push({
                id: `e-${lastNodeId}-${docId}`,
                source: lastNodeId,
                target: docId,
              });
            }
            
            nodeIndex++;
          });
          
          // Update lastNodeId to the last document
          lastNodeId = `documents-${nodeIndex - 1}`;
        }
        
        // Add task nodes
        if (agentData.tasks && agentData.tasks.length > 0) {
          let xPosition = 800;
          let taskCount = 0;
          
          agentData.tasks.forEach((task, index) => {
            const taskId = `task-${task.type}-${nodeIndex}`;
            const taskSubtype = formatTaskSubtype(task.type);
            
            // Every 3 tasks, move to a new column
            if (taskCount > 0 && taskCount % 3 === 0) {
              xPosition += 300;
            }
            
            // Convert task data to camelCase for the component
            const taskData: Record<string, any> = {
              label: task.type.split('_').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' '),
              subtype: taskSubtype,
            };
            
            // Add all task properties in camelCase
            Object.entries(task).forEach(([key, value]) => {
              taskData[snakeToCamel(key)] = value;
            });
            
            generatedNodes.push({
              id: taskId,
              type: "task",
              position: { x: xPosition, y: 200 + ((taskCount % 3) * 200) },
              data: taskData,
            });
            
            // Connect to previous node
            if (lastNodeId) {
              generatedEdges.push({
                id: `e-${lastNodeId}-${taskId}`,
                source: lastNodeId,
                target: taskId,
              });
            }
            
            lastNodeId = taskId;
            nodeIndex++;
            taskCount++;
          });
        }
        
        // Add update nodes
        if (agentData.updates && agentData.updates.length > 0) {
          const finalX = 800 + (Math.ceil(agentData.tasks.length / 3) * 300);
          
          agentData.updates.forEach((update, index) => {
            const updateId = `updates-${update.type}-${nodeIndex}`;
            
            generatedNodes.push({
              id: updateId,
              type: "updates",
              position: { x: finalX, y: 200 + (index * 200) },
              data: {
                label: `${update.type.charAt(0).toUpperCase() + update.type.slice(1)} Updates`,
                frequency: "daily",
                ...(update.type === "api" 
                  ? { endpoint: update.endpoint } 
                  : { recipient: update.to }),
              },
            });
            
            // Connect to last task node
            if (lastNodeId) {
              generatedEdges.push({
                id: `e-${lastNodeId}-${updateId}`,
                source: lastNodeId,
                target: updateId,
              });
            }
            
            nodeIndex++;
          });
        }
        
        setNodes(generatedNodes);
        setEdges(generatedEdges);
        setNextNodeId(nodeIndex);
      } catch (err) {
        console.error("Error fetching agent data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchAgentData();
    }
  }, [slug]);

  const runAgent = async () => {
    try {
      setIsRunning(true);
      const response = await fetch(`http://localhost:8000/agents/${slug}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to run agent: ${response.statusText}`);
      }
      
      const data = await response.json();
      toast({
        title: "Agent Execution Scheduled",
        description: data.message || "Agent execution has been scheduled successfully.",
        duration: 5000,
      });
    } catch (err) {
      console.error("Error running agent:", err);
      toast({
        title: "Error Running Agent",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Function to add a new node to the canvas
  const addNode = (type: string) => {
    const id = `${type}-${nextNodeId}`;
    const position = { x: 250, y: 200 };
    
    let newNode: Node = {
      id,
      type,
      position,
      data: { label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}` },
    };
    
    // Customize node data based on type
    switch (type) {
      case "persona":
        newNode.data = {
          label: "New Persona",
          description: "Describe the agent's persona",
          role: "Define the agent's role and qualities",
        };
        break;
      case "documents":
        newNode.data = {
          label: "New Document",
          sources: ["document-path.pdf"],
        };
        break;
      case "task":
        newNode.data = {
          label: "New Task",
          subtype: "seoOptimizer",
          frequency: "daily",
          lastRun: new Date().toISOString(),
        };
        break;
      case "updates":
        newNode.data = {
          label: "New Updates",
          frequency: "daily",
          endpoint: "https://example.com/api",
        };
        break;
    }
    
    setNodes((nds) => [...nds, newNode]);
    setNextNodeId(nextNodeId + 1);
    
    toast({
      title: "Node Added",
      description: `Added new ${type} node to the canvas.`,
      duration: 3000,
    });
  };

  // Function to save the workflow
  const saveWorkflow = async () => {
    try {
      const workflow = {
        nodes,
        edges,
        agentId: slug,
      };
      
      toast({
        title: "Workflow Saved",
        description: "Your workflow has been saved successfully.",
        duration: 3000,
      });
      
      // This is a placeholder - in a real app, you'd send this to your API
      console.log("Saved workflow:", workflow);
      
      // Uncomment this to actually save to an API
      /*
      const response = await fetch(`http://localhost:8000/agents/${slug}/workflow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workflow),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save workflow: ${response.statusText}`);
      }
      */
    } catch (err) {
      console.error("Error saving workflow:", err);
      toast({
        title: "Error Saving Workflow",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading agent workflow...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Agent</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full flex flex-col">
      {/* Header with Run Button */}
      <div className="p-4 flex justify-end space-x-4">
        <Button
          onClick={async () => {
            await navigator.clipboard.writeText(`http://localhost:8000/agents/${slug}/status`);
            toast({
              title: "Copied",
              description: "Status API URL has been copied to clipboard.",
              duration: 3000,
            });
          }}
          className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white flex items-center"
        >
          <Power className="mr-2 h-4 w-4" />
          Copy Status API
        </Button>
        <Button
          onClick={async () => {
            await navigator.clipboard.writeText(`http://localhost:8000/agents/${slug}/interrupt`);
            toast({
              title: "Copied",
              description: "Interrupt API URL has been copied to clipboard.",
              duration: 3000,
            });
          }}
          className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white flex items-center"
        >
          <ChartBar className="mr-2 h-4 w-4" />
          Copy Interrupt API
        </Button>
        <Button 
          onClick={runAgent} 
          disabled={isRunning}
          className={`${
            isRunning
              ? "bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
          } text-white flex items-center`}
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Agent
            </>
          )}
        </Button>
      </div>
      
      {/* Main content area with palette and canvas */}
      <div className="flex-1 flex overflow-hidden">
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
        <div className="flex-1 overflow-auto h-full w-[80%]">
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
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
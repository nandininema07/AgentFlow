"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  NodeTypes,
  Handle,
  Position,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Define a simple AgentNode component with visible connection handles
const AgentNode = ({ data }: { data: { personaName: string } }) => {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm w-48 text-center relative">
      {/* Add connection handles on all sides */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: '#3b82f6', width: '10px', height: '10px' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: '#3b82f6', width: '10px', height: '10px' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: '#3b82f6', width: '10px', height: '10px' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: '#3b82f6', width: '10px', height: '10px' }}
      />
      
      <div>Agent Name: {data.personaName}</div>
    </div>
  );
};

// Define custom orchestrator node with connection handles
const OrchestratorNode = ({ data }: { data: { label: string } }) => {
  return (
    <div className="p-4 bg-blue-100 border-2 border-blue-500 rounded-lg shadow-md w-48 text-center relative">
      {/* Add connection handles on all sides */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        style={{ background: '#3b82f6', width: '10px', height: '10px' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: '#3b82f6', width: '10px', height: '10px' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        style={{ background: '#3b82f6', width: '10px', height: '10px' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: '#3b82f6', width: '10px', height: '10px' }}
      />
      
      <div className="font-bold">{data.label}</div>
    </div>
  );
};

// Define custom node types
const nodeTypes: NodeTypes = {
  agent: AgentNode,
  orchestrator: OrchestratorNode,
};

// Define types for API response
interface Persona {
  name: string;
}

interface Agent {
  id: string;
  persona: Persona;
}

export default function OrchestrationCanvas() {
  // Initial demo data to guarantee we have nodes and connections
  const initialNodes: Node[] = [
    {
      id: "orchestrator",
      type: "orchestrator",
      position: { x: 500, y: 300 },
      data: { label: "Orchestrator" },
    },
    {
      id: "agent1",
      type: "agent",
      position: { x: 300, y: 150 },
      data: { personaName: "Assistant" },
    },
    {
      id: "agent2",
      type: "agent",
      position: { x: 700, y: 150 },
      data: { personaName: "Researcher" },
    },
    {
      id: "agent3",
      type: "agent",
      position: { x: 300, y: 450 },
      data: { personaName: "Planner" },
    },
    {
      id: "agent4",
      type: "agent",
      position: { x: 700, y: 450 },
      data: { personaName: "Executor" },
    },
  ];

  const initialEdges: Edge[] = [
    // Connect orchestrator to all agents
    { 
      id: 'e-orchestrator-agent1', 
      source: 'orchestrator', 
      target: 'agent1', 
      sourceHandle: 'top', 
      targetHandle: 'bottom',
      animated: true, 
      style: { stroke: "#3b82f6", strokeWidth: 2 } 
    },
    { 
      id: 'e-orchestrator-agent2', 
      source: 'orchestrator', 
      target: 'agent2', 
      sourceHandle: 'top', 
      targetHandle: 'bottom',
      animated: true, 
      style: { stroke: "#3b82f6", strokeWidth: 2 } 
    },
    { 
      id: 'e-orchestrator-agent3', 
      source: 'orchestrator', 
      target: 'agent3', 
      sourceHandle: 'bottom', 
      targetHandle: 'top',
      animated: true, 
      style: { stroke: "#3b82f6", strokeWidth: 2 } 
    },
    { 
      id: 'e-orchestrator-agent4', 
      source: 'orchestrator', 
      target: 'agent4', 
      sourceHandle: 'bottom', 
      targetHandle: 'top',
      animated: true, 
      style: { stroke: "#3b82f6", strokeWidth: 2 } 
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Add ref for visibility detection
  const flowWrapperRef = useRef<HTMLDivElement>(null);
  const [flowInstance, setFlowInstance] = useState<any>(null);
  
  // Listen for visibility changes
  useEffect(() => {
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && flowInstance) {
        // Force a redraw when the page becomes visible again
        setTimeout(() => {
          flowInstance.fitView();
        }, 200);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flowInstance]);

  // Function to recreate edges if they're missing
  const ensureConnections = useCallback(() => {
    if (nodes.length > 1) {
      const orchestratorNode = nodes.find(node => node.id === 'orchestrator');
      if (!orchestratorNode) return;
      
      // Get all agent nodes
      const agentNodes = nodes.filter(node => node.id !== 'orchestrator');
      
      // Check if all required connections exist
      const existingEdgeIds = new Set(edges.map(edge => edge.id));
      const missingEdges: Edge[] = [];
      
      agentNodes.forEach(agent => {
        const edgeId = `e-orchestrator-${agent.id}`;
        
        if (!existingEdgeIds.has(edgeId)) {
          // Determine best connection points based on relative position
          const dx = agent.position.x - orchestratorNode.position.x;
          const dy = agent.position.y - orchestratorNode.position.y;
          
          let sourceHandle = 'right';
          let targetHandle = 'left';
          
          // Choose handles based on orientation - predominantly horizontal or vertical
          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal orientation
            if (dx > 0) {
              sourceHandle = 'right';
              targetHandle = 'left';
            } else {
              sourceHandle = 'left';
              targetHandle = 'right';
            }
          } else {
            // Vertical orientation
            if (dy > 0) {
              sourceHandle = 'bottom';
              targetHandle = 'top';
            } else {
              sourceHandle = 'top';
              targetHandle = 'bottom';
            }
          }
          
          missingEdges.push({
            id: edgeId,
            source: 'orchestrator',
            target: agent.id,
            sourceHandle,
            targetHandle,
            animated: true,
            style: { stroke: "#3b82f6", strokeWidth: 2 },
          });
        }
      });
      
      // Add missing edges without removing existing ones
      if (missingEdges.length > 0) {
        setEdges(edges => [...edges, ...missingEdges]);
      }
    }
  }, [nodes, edges, setEdges]);

  // Periodically check and ensure connections
  useEffect(() => {
    const interval = setInterval(() => {
      ensureConnections();
    }, 1000); // Check every second
    
    return () => clearInterval(interval);
  }, [ensureConnections]);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8000/agents");
        
        if (response.ok) {
          const data: Agent[] = await response.json();
          
          if (data.length > 0) {
            // Create orchestrator node at the center
            const orchestratorNodeId = "orchestrator";
            const centerPosition = { x: 500, y: 300 };
            
            const generatedNodes: Node[] = [
              {
                id: orchestratorNodeId,
                type: "orchestrator",
                position: centerPosition,
                data: { label: "Orchestrator" },
              },
            ];
            
            const generatedEdges: Edge[] = [];
            
            // Calculate positions for agents in a circle
            const numAgents = data.length;
            const radius = 200;
            
            data.forEach((agent, index) => {
              const angle = (2 * Math.PI * index) / numAgents;
              const x = centerPosition.x + radius * Math.cos(angle);
              const y = centerPosition.y + radius * Math.sin(angle);
              
              // Add agent node
              generatedNodes.push({
                id: agent.id,
                type: "agent",
                position: { x, y },
                data: { personaName: agent.persona.name },
              });
              
              // Choose handles based on position relative to center
              let sourceHandle, targetHandle;
              
              // Determine which quadrant the node is in and choose appropriate handles
              if (x >= centerPosition.x && y <= centerPosition.y) {
                // Top right quadrant
                sourceHandle = 'right';
                targetHandle = 'left';
              } else if (x < centerPosition.x && y <= centerPosition.y) {
                // Top left quadrant
                sourceHandle = 'left';
                targetHandle = 'right';
              } else if (x < centerPosition.x && y > centerPosition.y) {
                // Bottom left quadrant
                sourceHandle = 'bottom';
                targetHandle = 'top';
              } else {
                // Bottom right quadrant
                sourceHandle = 'bottom';
                targetHandle = 'top';
              }
              
              // Add edge from orchestrator to agent
              generatedEdges.push({
                id: `e-${orchestratorNodeId}-${agent.id}`,
                source: orchestratorNodeId,
                target: agent.id,
                sourceHandle,
                targetHandle,
                animated: true,
                style: { stroke: "#3b82f6", strokeWidth: 2 },
              });
            });
            
            // Set the nodes and edges from API data
            setNodes(generatedNodes);
            setEdges(generatedEdges);
          }
        }
      } catch (err) {
        console.error("API fetch error - using default nodes and edges");
        // We're already using initial data, so no need to set error state
      } finally {
        setLoading(false);
      }
    };
    
    fetchAgents();
  }, [setNodes, setEdges]);

  return (
    <div className="h-[calc(100vh-4rem)] w-full" ref={flowWrapperRef}>
      <ReactFlowProvider>
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading agents...</span>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
            }}
            onInit={setFlowInstance}
            fitView
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        )}
      </ReactFlowProvider>
    </div>
  );
}
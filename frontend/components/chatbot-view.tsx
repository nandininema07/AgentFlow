"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bot,
  Download,
  Network,
  PhoneCall,
  RefreshCw,
  Send,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Message {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: string
}

interface Workflow {
  id: string
  persona: {
    name: string
    qualities: string
  }
}

export function ChatbotView() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content:
        "Welcome to the AI Workflow Chatbot. I'm here to help you interact with your workflows.",
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState("")
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [agentStatus, setAgentStatus] = useState<{
    agent_id: string;
    is_running: boolean;
    current_task: string | null;
    upcoming_tasks: { task_type: string; due_in: string }[];
  } | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const response = await fetch("http://localhost:8000/agents/")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Workflow[] = await response.json()
        setWorkflows(data)
      } catch (error) {
        console.error("Could not fetch workflows:", error)
      }
    }

    fetchWorkflows()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (selectedWorkflow) {
      const fetchAgentStatus = async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/agents/${selectedWorkflow}/status`
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          setAgentStatus(data);
        } catch (error) {
          console.error("Could not fetch agent status:", error);
        }
      };

      fetchAgentStatus();
    } else {
      setAgentStatus(null);
    }
  }, [selectedWorkflow]);

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedWorkflow) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch(
        `http://localhost:8000/agents/${selectedWorkflow}/interrupt?prompt=${encodeURIComponent(
          input
        )}`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
          },
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      const errorAssistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error processing your request.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorAssistantMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">AI Chatbot Playground</h1>
          <p className="text-muted-foreground">
            Interact with your AI workflows through natural language
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader className="border-b p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>
                      <Network />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle>Workflow Assistant</CardTitle>
                    <CardDescription>
                      {selectedWorkflow
                        ? `Using: ${workflows.find((w) => w.id === selectedWorkflow)
                          ?.persona.name || "Unknown Workflow"
                        }`
                        : "Select a workflow to begin"}
                    </CardDescription>
                  </div>
                </div>
                <Select
                  value={selectedWorkflow || ""}
                  onValueChange={setSelectedWorkflow}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Workflow" />
                  </SelectTrigger>
                  <SelectContent>
                    {workflows.map((workflow) => (
                      <SelectItem key={workflow.id} value={workflow.id}>
                        {workflow.persona.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[calc(100vh-16rem)] overflow-y-auto p-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                  >
                    {message.role !== "user" && (
                      <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        {message.role === "system" ? (
                          <Network size={16} />
                        ) : (
                          <Bot size={16} />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.role === "system"
                          ? "bg-muted text-muted-foreground"
                          : "bg-secondary text-secondary-foreground"
                        }`}
                    >
                      <div className="mb-1">{message.content}</div>
                      <div className="text-xs opacity-70 text-right">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                    {message.role === "user" && (
                      <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <User size={16} />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Bot size={16} />
                    </div>
                    <div className="max-w-[80%] rounded-lg bg-secondary text-secondary-foreground px-4 py-2">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="border-t p-4">
              <div className="flex w-full items-center gap-2">
                <Input
                  placeholder="Ask about your workflow..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={!selectedWorkflow}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!input.trim() || !selectedWorkflow}
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
                <Button
                  onClick={async () => {
                    try {
                      setIsLoading(true);
                      const response = await fetch(
                        `http://localhost:8000/call/?agent_id=${agentStatus?.agent_id}&phone_number=%2B918408873439&name=Sujal%20Vivek%20Choudhari`,
                        {
                          method: "GET",
                          headers: {
                            accept: "application/json",
                          },
                        }
                      );
                      if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                      }
                      const data = await response.json();
                      console.log("Call initiated successfully:", data);
                    } catch (error) {
                      console.error("Error initiating call:", error);
                    } finally {
                      setIsLoading(false);
                      const button = document.activeElement as HTMLButtonElement;
                      button.disabled = true;
                      setTimeout(() => {
                        button.disabled = false;
                      }, 3000);
                    }
                  }}
                  disabled={isLoading}
                >
                  <PhoneCall className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card className="h-[calc(100vh-12rem)]">
            <CardHeader>
              <CardTitle>Workflow Details</CardTitle>
              <CardDescription>
                {selectedWorkflow
                  ? `Information about ${workflows.find((w) => w.id === selectedWorkflow)
                    ?.persona.name || "Selected Workflow"
                  }`
                  : "Select a workflow to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedWorkflow ? (
                agentStatus ? (
                  <>
                    <div>
                      <h3 className="font-medium mb-2">Agent Status</h3>
                      <div className="rounded-md bg-muted p-4 text-sm">
                        <p className="mb-2">
                          <strong>Agent ID:</strong> {agentStatus.agent_id}
                        </p>
                        <p className="mb-2">
                          <strong>Status:</strong>{" "}
                          {agentStatus.is_running ? "Running" : "Stopped"}
                        </p>
                        <p className="mb-2">
                          <strong>Current Task:</strong>{" "}
                          {agentStatus.current_task || "None"}
                        </p>
                        <p>
                          <strong>Upcoming Tasks:</strong>
                        </p>
                        <ul className="list-disc list-inside">
                          {agentStatus.upcoming_tasks.map((task, index) => (
                            <li key={index}>
                              {task.task_type} - Due in: {task.due_in || "N/A"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center text-center text-muted-foreground">
                    <div>
                      <RefreshCw className="mx-auto h-6 w-6 mb-2 animate-spin" />
                      <p>Loading agent status...</p>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex h-[calc(100vh-20rem)] items-center justify-center text-center text-muted-foreground">
                  <div>
                    <Network className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>
                      Select a workflow from the dropdown to view its details and interact
                      with it
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t p-4">
              <div className="flex w-full justify-between">
                <Button variant="outline" size="sm" disabled={!selectedWorkflow}>
                  <Download className="mr-2 h-4 w-4" />
                  Export JSON
                </Button>
                <Button size="sm" disabled={!selectedWorkflow} asChild>
                  <a href="/canvas">
                    <Network className="mr-2 h-4 w-4" />
                    Edit Workflow
                  </a>
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

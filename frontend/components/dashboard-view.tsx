"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChevronDown,
  Plus,
  Save,
  Zap,
  Edit,
  Trash,
  Copy,
  Network,
} from "lucide-react"
import Link from "next/link"
import { WorkflowTemplateDialog } from "@/components/workflow-template-dialog"

// Define the Agent type based on your API response
type Agent = {
  id: string
  persona: {
    name: string
    qualities: string
    description: string
  }
  documents: any[] // replace `any` with the correct type if known
  tasks: any[] // replace `any` with the correct type if known
  updates: any[] // replace `any` with the correct type if known
}

export function DashboardView() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [agents, setAgents] = useState<Agent[]>([]) // Rename workflows to agents
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true) // Add loading state
  const [error, setError] = useState<string | null>(null) // Add error state

  useEffect(() => {
    const fetchAgents = async () => {
      setLoading(true)
      try {
        const response = await fetch("http://localhost:8000/agents/")
        if (!response.ok) {
          throw new Error(
            `Failed to fetch agents: ${response.status} ${response.statusText}`
          )
        }
        const data: Agent[] = await response.json()
        setAgents(data)
      } catch (e: any) {
        setError(e.message)
        console.error("Failed to fetch agents", e)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusColor = (agent: Agent) => {
    // Example logic: active if there are tasks, draft if no tasks, inactive if error
    if (error) return "bg-red-500"
    return agent.tasks.length > 0 ? "bg-green-500" : "bg-yellow-500"
  }

  const getStatus = (agent: Agent) => {
    if (error) return "Error"
    return agent.tasks.length > 0 ? "Active" : "Draft"
  }

  if (loading) {
    return <div>Loading agents...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor your AI agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setTemplateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Agent
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Agents</CardTitle>
            <CardDescription>All created agents</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Agents</CardTitle>
            <CardDescription>Currently running</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {agents.filter((agent) => agent.tasks.length > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Draft Agents</CardTitle>
            <CardDescription>In development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {agents.filter((agent) => agent.tasks.length === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Agent Management</CardTitle>
              
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tasks</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="font-medium">
                      {agent.persona.name}
                    </TableCell>
                    <TableCell>
                      {agent.tasks.length > 0
                        ? formatDate(
                            agent.tasks[0].last_run //displaying the latest task, you can pick and choose
                          )
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
                            agent
                          )} mr-2`}
                        ></div>
                        {getStatus(agent)}
                      </div>
                    </TableCell>
                    <TableCell>{agent.tasks.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" asChild>
                          <Link href={`/canvas/${agent.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" asChild>
                          <Link href="/chatbot">
                            <Network className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="icon" disabled>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled
                          className="text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {agents.length} agents
            </div>
          </CardFooter>
        </Card>
      </div>

      <WorkflowTemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
      />
    </div>
  )
}

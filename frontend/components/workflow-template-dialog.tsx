"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Network,
  Megaphone,
  Building2,
  Scale,
  Plus,
  ArrowRight,
  Search,
  Eye,
  ThumbsUp,
  MessageSquare,
  Mail,
  FileText,
  BookOpen,
  Shield,
  Briefcase,
} from "lucide-react"

// Template definitions
const templates = [
  {
    id: "marketing-agency",
    title: "Marketing Agency",
    description: "Optimize SEO, monitor competitors, and create content",
    icon: Megaphone,
    color: "bg-pink-100 text-pink-500 dark:bg-pink-900 dark:text-pink-300",
    nodes: [
      { name: "SEO Optimizer", icon: Search },
      { name: "Competitor Watchdog", icon: Eye },
      { name: "Product Recommendation AI", icon: ThumbsUp },
      { name: "Post Creator", icon: MessageSquare },
      { name: "Smart Email Manager", icon: Mail },
    ],
  },
  {
    id: "corporate-productivity",
    title: "Corporate Productivity",
    description: "Summarize meetings, manage emails, and analyze feedback",
    icon: Building2,
    color: "bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300",
    nodes: [
      { name: "Meeting Summarizer", icon: FileText },
      { name: "Smart Email Manager", icon: Mail },
      { name: "Competitor Watchdog", icon: Eye },
      { name: "Customer Feedback Analyzer", icon: MessageSquare },
    ],
  },
  {
    id: "legal-compliance",
    title: "Legal & Compliance",
    description: "Summarize contracts, research, and monitor compliance",
    icon: Scale,
    color: "bg-purple-100 text-purple-500 dark:bg-purple-900 dark:text-purple-300",
    nodes: [
      { name: "Contract Summarizer", icon: FileText },
      { name: "AI Research Assistant", icon: BookOpen },
      { name: "Regulatory Compliance Watchdog", icon: Shield },
      { name: "Smart Email Manager", icon: Mail },
    ],
  },
]

// Mock community workflows
const communityWorkflows = [
  {
    id: "customer-support",
    title: "Customer Support Automation",
    description: "Automate customer support with AI-powered responses",
    author: "Sarah Johnson",
    downloads: 1245,
    rating: 4.8,
    icon: MessageSquare,
    color: "bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300",
  },
  {
    id: "hr-onboarding",
    title: "HR Onboarding Process",
    description: "Streamline employee onboarding with AI assistance",
    author: "Michael Chen",
    downloads: 876,
    rating: 4.6,
    icon: Briefcase,
    color: "bg-yellow-100 text-yellow-500 dark:bg-yellow-900 dark:text-yellow-300",
  },
  {
    id: "content-calendar",
    title: "Content Calendar Manager",
    description: "Plan and schedule content with AI suggestions",
    author: "Alex Rivera",
    downloads: 1032,
    rating: 4.7,
    icon: FileText,
    color: "bg-orange-100 text-orange-500 dark:bg-orange-900 dark:text-orange-300",
  },
  {
    id: "sales-pipeline",
    title: "Sales Pipeline Optimizer",
    description: "Optimize your sales process with AI insights",
    author: "Emma Wilson",
    downloads: 689,
    rating: 4.5,
    icon: ThumbsUp,
    color: "bg-red-100 text-red-500 dark:bg-red-900 dark:text-red-300",
  },
]

interface WorkflowTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkflowTemplateDialog({ open, onOpenChange }: WorkflowTemplateDialogProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("templates")

  // Updated handleSelectTemplate function
  const handleSelectTemplate = (templateId: string) => {
    console.log(`Selected template: ${templateId}`)
    onOpenChange(false)


    router.push("/canvas/00facf1b-ba8f-4e5a-837c-9b9cc2776df2")

  }

  const handleBlankCanvas = () => {
    console.log("Selected blank canvas")
    onOpenChange(false)
    router.push("/canvas") // Blank canvas redirects to /canvas
  }

  const handleCommunityWorkflow = (workflowId: string) => {
    console.log(`Selected community workflow: ${workflowId}`)
    onOpenChange(false)
    router.push("/canvas")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create New Workflow</DialogTitle>
          <DialogDescription>Choose a template or start from scratch to create your AI workflow</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="templates" value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="community">Community Marketplace</TabsTrigger>
          </TabsList>
          <TabsContent value="templates" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-md ${template.color}`}>
                        <template.icon className="h-5 w-5" />
                      </div>
                      <CardTitle>{template.title}</CardTitle>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex flex-wrap gap-1">
                      {template.nodes.map((node, index) => (
                        <div key={index} className="flex items-center text-xs bg-muted rounded-full px-2 py-1">
                          <node.icon className="h-3 w-3 mr-1" />
                          <span>{node.name}</span>
                          {index < template.nodes.length - 1 && (
                            <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={() => handleSelectTemplate(template.id)}>
                      Use Template
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              <Card className="cursor-pointer hover:border-primary transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-md bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-300">
                      <Plus className="h-5 w-5" />
                    </div>
                    <CardTitle>Blank Canvas</CardTitle>
                  </div>
                  <CardDescription>Start from scratch with an empty workflow</CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex items-center justify-center h-16 border-2 border-dashed rounded-md">
                    <Network className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" onClick={handleBlankCanvas}>
                    Start Empty
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="community" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communityWorkflows.map((workflow) => (
                <Card key={workflow.id} className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-md ${workflow.color}`}>
                        <workflow.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle>{workflow.title}</CardTitle>
                        <CardDescription>By {workflow.author}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">{workflow.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <ThumbsUp className="h-3 w-3 mr-1" />
                        <span>{workflow.rating}/5</span>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        <span>{workflow.downloads} downloads</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" variant="secondary" onClick={() => handleCommunityWorkflow(workflow.id)}>
                      Use Workflow
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" asChild>
                <a href="/marketplace">View All Community Workflows</a>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
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
import { Input } from "@/components/ui/input"
import {
  MessageSquare,
  Briefcase,
  FileText,
  ThumbsUp,
  Search,
  Filter,
  Download,
  Star,
  Clock,
  TrendingUp,
  Network,
  Workflow,
} from "lucide-react"
import Link from "next/link"

// Mock community workflows based on the provided structure
const staticCommunityWorkflows = [
  {
    id: "marketing-agent-001",
    persona: {
      name: "Digital Marketing Specialist",
      qualities: "Analytical, creative, data-driven, strategic",
      description:
        "An AI agent specializing in digital marketing, SEO, content strategy, and social media management. Focused on maximizing ROI and brand visibility.",
    },
    documents: [
      {
        name: "Brand Guidelines",
        path: "/marketing/brand_guidelines.pdf",
      },
      {
        name: "Keyword Research Report",
        path: "/marketing/keyword_research_2024.xlsx",
      },
    ],
    tasks: [
      {
        type: "seo_optimizer",
        keywords: [
          "organic seo",
          "digital marketing trends",
          "content marketing strategy",
        ],
        content: "Optimizing blog content for target keywords...",
        frequency: "daily",
        last_run: "2024-01-29T09:00:00",
      },
      {
        type: "competitor_watchdog",
        websites: ["competitor1.com", "competitor2.com"],
        frequency: "weekly",
        last_run: "2024-01-28T18:00:00",
      },
    ],
    updates: [
      {
        type: "api",
        endpoint: "https://api.example.com/marketing_alerts",
      },
      {
        type: "mail",
        to: "marketing_team@example.com",
      },
    ],
    downloads: 322,
    rating: 4.9,
    category: "Marketing",
    tags: ["marketing", "seo", "content"],
    createdAt: "2024-04-04T18:15:36.177Z",
    updatedAt: "2024-04-04T18:15:36.177Z",
    nodes: 3,
    icon: MessageSquare,
    color: "bg-purple-100 text-purple-500 dark:bg-purple-900 dark:text-purple-300",
  },
  {
    id: "legal-consultant-001",
    persona: {
      name: "Legal Compliance Advisor",
      qualities: "Precise, detail-oriented, analytical, knowledgeable",
      description:
        "An AI agent focused on legal research, contract review, regulatory compliance, and risk assessment. Provides expert guidance on legal matters.",
    },
    documents: [
      {
        name: "Standard Contract Template",
        path: "/legal/standard_contract.docx",
      },
      {
        name: "Privacy Policy",
        path: "/legal/privacy_policy.pdf",
      },
    ],
    tasks: [
      {
        type: "contract_summarizer",
        contract_source: "File Upload",
        source_url: "/legal/new_agreement.pdf",
        frequency: "on-demand",
        last_run: "2024-01-29T10:00:00",
      },
      {
        type: "ai_research_assistant",
        research_topics: ["GDPR Compliance", "Intellectual Property Law"],
        data_sources: ["Legal Databases"],
        frequency: "monthly",
        last_run: "2024-01-25T12:00:00",
      },
      {
        type: "regulatory_compliance_watchdog",
        regulatory_bodies: ["FTC", "SEC"],
        keywords: ["antitrust", "securities law"],
        frequency: "monthly",
        last_run: "2024-01-20T15:00:00",
      },
      {
        type: "smart_email_manager",
        action: "Filter",
        to: [],
        cc: [],
        bcc: [],
        subject: null,
        body: null,
        inbox: "legal@example.com",
        keywords: ["urgent", "legal review"],
        tone: null,
        role: null,
        company_name: null,
        custom_inclusions: null,
        word_limit: 300,
        template_reuse: false,
        frequency: "daily",
        last_run: "2024-01-29T08:30:00",
      },
    ],
    updates: [
      {
        type: "mail",
        to: "legal_team@example.com",
      },
    ],
    downloads: 111,
    rating: 4.2,
    category: "Legal",
    tags: ["legal", "compliance", "contracts"],
    createdAt: "2024-04-04T18:15:36.177Z",
    updatedAt: "2024-04-04T18:15:36.177Z",
    nodes: 4,
    icon: Briefcase,
    color: "bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300",
  },
  {
    id: "corporate-productivity-001",
    persona: {
      name: "Productivity Optimization Manager",
      qualities: "Efficient, organized, strategic, communicative",
      description:
        "An AI agent designed to enhance corporate productivity through task automation, meeting summaries, and workflow optimization.",
    },
    documents: [
      {
        name: "Project Management Guide",
        path: "/productivity/project_management.pdf",
      },
      {
        name: "Team Communication Protocols",
        path: "/productivity/communication_protocols.docx",
      },
    ],
    tasks: [
      {
        type: "meeting_summarizer",
        recording_source: "URL",
        source_url: "https://example.com/team_meeting.mp4",
        frequency: "daily",
        last_run: "2024-01-29T11:00:00",
      },
      {
        type: "smart_email_manager",
        action: "Summarize",
        to: [],
        cc: [],
        bcc: [],
        subject: null,
        body: null,
        inbox: "project_updates@example.com",
        keywords: [],
        tone: null,
        role: null,
        company_name: null,
        custom_inclusions: null,
        word_limit: 300,
        template_reuse: false,
        frequency: "hourly",
        last_run: "2024-01-29T09:00:00",
      },
      {
        type: "post_creator",
        topic: "Effective Time Management Techniques",
        platform: "Blog",
        frequency: "monthly",
        last_run: "2024-01-15T10:00:00",
      },
      {
        type: "ai_research_assistant",
        research_topics: [
          "Workflow Automation Tools",
          "Remote Collaboration Strategies",
        ],
        data_sources: ["Google Scholar"],
        frequency: "monthly",
        last_run: "2024-01-10T14:00:00",
      },
    ],
    updates: [
      {
        type: "api",
        endpoint: "https://api.example.com/productivity_reports",
      },
      {
        type: "mail",
        to: "management_team@example.com",
      },
    ],
    downloads: 555,
    rating: 4.7,
    category: "Productivity",
    tags: ["automation", "summarization", "workflows"],
    createdAt: "2024-04-04T18:15:36.177Z",
    updatedAt: "2024-04-04T18:15:36.177Z",
    nodes: 4,
    icon: FileText,
    color: "bg-yellow-100 text-yellow-500 dark:bg-yellow-900 dark:text-yellow-300",
  },
]

// Categories for filtering
const categories = [
  "All",
  "Marketing",
  "Legal",
  "Productivity",
  "Sales",
  "Support",
  "HR",
  "Research",
  "Finance",
]

export function MarketplaceView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("popular")
  const [apiWorkflows, setApiWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoading(true)
      try {
        const response = await fetch("http://localhost:8000/agents/")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setApiWorkflows(data)
      } catch (e:any) {
        setError(e)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflows()
  }, [])

  // Combine API workflows with static workflows
  const combinedWorkflows = [...apiWorkflows, ...staticCommunityWorkflows]

  // Filter workflows based on search query and category
  const filteredWorkflows = combinedWorkflows.filter((workflow) => {
    const matchesSearch =
      workflow.persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workflow.persona.description.toLowerCase().includes(
        searchQuery.toLowerCase()
      ) ||
      workflow.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      selectedCategory === "All" || workflow.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  // Sort workflows based on selected sort option
  const sortedWorkflows = [...filteredWorkflows].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.downloads - a.downloads
      case "rating":
        return b.rating - a.rating
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading workflows...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <p>Error loading workflows: {error.message}</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Community Marketplace</h1>
          <p className="text-muted-foreground">
            Discover and share AI workflows created by the community
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/canvas">
              <Network className="mr-2 h-4 w-4" />
              Create Workflow
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="w-full md:w-64 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sort By</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={sortBy === "popular" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSortBy("popular")}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Most Popular
              </Button>
              <Button
                variant={sortBy === "rating" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSortBy("rating")}
              >
                <Star className="mr-2 h-4 w-4" />
                Highest Rated
              </Button>
              <Button
                variant={sortBy === "newest" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSortBy("newest")}
              >
                <Clock className="mr-2 h-4 w-4" />
                Newest
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedWorkflows.map((workflow) => (
              <Card
                key={workflow.id}
                className="cursor-pointer hover:border-primary transition-colors"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-md ${workflow.color}`}>
                      <Workflow className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle>{workflow.persona.name}</CardTitle>
                      <CardDescription>
                        {workflow.persona.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Tasks: {workflow.tasks.length} | Documents:{" "}
                    {workflow.documents.length}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {workflow.tags?.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs bg-muted rounded-full px-2 py-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        <span>{workflow.rating}/5</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="h-3 w-3 mr-1" />
                        <span>{workflow.downloads}</span>
                      </div>
                    </div>
                    {/* <div>Updated {formatDate(workflow.updatedAt)}</div> */}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">
                    Preview
                  </Button>
                  <Button size="sm" asChild>
                    <Link href={`/canvas/${workflow.id}`}>Use Workflow</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {sortedWorkflows.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No workflows found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

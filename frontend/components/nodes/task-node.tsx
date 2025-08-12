import { Handle, Position, type NodeProps } from "reactflow";
import { Workflow } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface TaskFormProps {
  data: any;
  updateData: (key: string, value: any) => void;
}

const taskInputs = {
  seoOptimizer: ({ data, updateData }: TaskFormProps) => (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>Keywords</Label>
        <Textarea
          value={data.keywords?.join("\n") || ""}
          onChange={(e) =>
            updateData("keywords", e.target.value.split("\n"))
          }
          placeholder="One keyword per line"
        />
      </div>
      <div className="space-y-1">
        <Label>Content</Label>
        <Textarea
          value={data.content || ""}
          onChange={(e) => updateData("content", e.target.value)}
          placeholder="Content to optimize"
        />
      </div>
      <div className="space-y-1">
        <Label>Frequency</Label>
        <Select
          value={data.frequency}
          onValueChange={(v) => updateData("frequency", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="on-demand">On Demand</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  competitorWatchdog: ({ data, updateData }: TaskFormProps) => (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>Websites</Label>
        <Textarea
          value={data.websites?.join("\n") || ""}
          onChange={(e) => updateData("websites", e.target.value.split("\n"))}
          placeholder="One website per line"
        />
      </div>
      <div className="space-y-1">
        <Label>Frequency</Label>
        <Select
          value={data.frequency}
          onValueChange={(v) => updateData("frequency", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="on-demand">On Demand</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  productRecommendation: ({ data, updateData }: TaskFormProps) => (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>Products</Label>
        <Textarea
          value={data.products?.join("\n") || ""}
          onChange={(e) => updateData("products", e.target.value.split("\n"))}
          placeholder="One product per line"
        />
      </div>
      <div className="space-y-1">
        <Label>User Data Source</Label>
        <Input
          type="text"
          value={data.userDataSource || ""}
          onChange={(e) => updateData("userDataSource", e.target.value)}
          placeholder="e.g., Purchase History"
        />
      </div>
      <div className="space-y-1">
        <Label>Source URL</Label>
        <Input
          type="url"
          value={data.sourceUrl || ""}
          onChange={(e) => updateData("sourceUrl", e.target.value)}
          placeholder="URL"
        />
      </div>
      <div className="space-y-1">
        <Label>Frequency</Label>
        <Select
          value={data.frequency}
          onValueChange={(v) => updateData("frequency", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="on-demand">On Demand</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  postCreator: ({ data, updateData }: TaskFormProps) => (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>Topic</Label>
        <Input
          type="text"
          value={data.topic || ""}
          onChange={(e) => updateData("topic", e.target.value)}
          placeholder="Topic"
        />
      </div>
      <div className="space-y-1">
        <Label>Platform</Label>
        <Select
          value={data.platform}
          onValueChange={(v) => updateData("platform", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Facebook">Facebook</SelectItem>
            <SelectItem value="Twitter">Twitter</SelectItem>
            <SelectItem value="LinkedIn">LinkedIn</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Frequency</Label>
        <Select
          value={data.frequency}
          onValueChange={(v) => updateData("frequency", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="on-demand">On Demand</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  smartEmailManager: ({ data, updateData }: TaskFormProps) => (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>Action</Label>
        <Select value={data.action} onValueChange={(v) => updateData("action", v)}>
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Send">Send</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>To</Label>
        <Textarea
          value={data.to?.join("\n") || ""}
          onChange={(e) => updateData("to", e.target.value.split("\n"))}
          placeholder="One email per line"
        />
      </div>
      <div className="space-y-1">
        <Label>CC</Label>
        <Textarea
          value={data.cc?.join("\n") || ""}
          onChange={(e) => updateData("cc", e.target.value.split("\n"))}
          placeholder="One email per line"
        />
      </div>
      <div className="space-y-1">
        <Label>BCC</Label>
        <Textarea
          value={data.bcc?.join("\n") || ""}
          onChange={(e) => updateData("bcc", e.target.value.split("\n"))}
          placeholder="One email per line"
        />
      </div>
      <div className="space-y-1">
        <Label>Subject</Label>
        <Input
          type="text"
          value={data.subject || ""}
          onChange={(e) => updateData("subject", e.target.value)}
          placeholder="Subject"
        />
      </div>
      <div className="space-y-1">
        <Label>Body</Label>
        <Textarea
          value={data.body || ""}
          onChange={(e) => updateData("body", e.target.value)}
          placeholder="Email body"
        />
      </div>
      <div className="space-y-1">
        <Label>Tone</Label>
        <Input
          type="text"
          value={data.tone || ""}
          onChange={(e) => updateData("tone", e.target.value)}
          placeholder="Tone"
        />
      </div>
      <div className="space-y-1">
        <Label>Role</Label>
        <Input
          type="text"
          value={data.role || ""}
          onChange={(e) => updateData("role", e.target.value)}
          placeholder="Role"
        />
      </div>
      <div className="space-y-1">
        <Label>Company Name</Label>
        <Input
          type="text"
          value={data.companyName || ""}
          onChange={(e) => updateData("companyName", e.target.value)}
          placeholder="Company Name"
        />
      </div>
      <div className="space-y-1">
        <Label>Custom Inclusions</Label>
        <Input
          type="text"
          value={data.customInclusions || ""}
          onChange={(e) => updateData("customInclusions", e.target.value)}
          placeholder="Custom Inclusions"
        />
      </div>
      <div className="space-y-1">
        <Label>Word Limit</Label>
        <Input
          type="number"
          value={data.wordLimit || 300}
          onChange={(e) => updateData("wordLimit", Number(e.target.value))}
          placeholder="Word Limit"
        />
      </div>
      <div className="space-y-1">
        <Label>Template Reuse</Label>
        <Checkbox
          checked={data.templateReuse || false}
          onCheckedChange={(checked) => updateData("templateReuse", checked)}
        />
      </div>
      <div className="space-y-1">
        <Label>Frequency</Label>
        <Select
          value={data.frequency}
          onValueChange={(v) => updateData("frequency", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="on-demand">On Demand</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  meetingSummarizer: ({ data, updateData }: TaskFormProps) => (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>Recording Source</Label>
        <Select
          value={data.recordingSource}
          onValueChange={(v) => updateData("recordingSource", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="File Upload">File Upload</SelectItem>
            <SelectItem value="URL">URL</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Source URL</Label>
        <Input
          type="url"
          value={data.sourceUrl || ""}
          onChange={(e) => updateData("sourceUrl", e.target.value)}
          placeholder="URL"
        />
      </div>
      <div className="space-y-1">
        <Label>Frequency</Label>
        <Select
          value={data.frequency}
          onValueChange={(v) => updateData("frequency", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="on-demand">On Demand</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  customerFeedbackAnalyzer: ({ data, updateData }: TaskFormProps) => (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>Feedback Source</Label>
        <Select
          value={data.feedbackSource}
          onValueChange={(v) => updateData("feedbackSource", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="CSV File">CSV File</SelectItem>
            <SelectItem value="API Endpoint">API Endpoint</SelectItem>
            <SelectItem value="Text Input">Text Input</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {data.feedbackSource === "CSV File" && (
        <div className="space-y-1">
          <Label>File Path</Label>
          <Input
            type="text"
            value={data.filePath || ""}
            onChange={(e) => updateData("filePath", e.target.value)}
            placeholder="File path"
          />
        </div>
      )}
      {data.feedbackSource === "API Endpoint" && (
        <div className="space-y-1">
          <Label>API Endpoint</Label>
          <Input
            type="url"
            value={data.apiEndpoint || ""}
            onChange={(e) => updateData("apiEndpoint", e.target.value)}
            placeholder="API endpoint URL"
          />
        </div>
      )}
      {data.feedbackSource === "Text Input" && (
        <div className="space-y-1">
          <Label>Feedback Text</Label>
          <Textarea
            value={data.feedbackText || ""}
            onChange={(e) => updateData("feedbackText", e.target.value)}
            placeholder="Enter feedback text"
          />
        </div>
      )}
      <div className="space-y-1">
        <Label>Frequency</Label>
        <Select
          value={data.frequency}
          onValueChange={(v) => updateData("frequency", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="on-demand">On Demand</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  contractSummarizer: ({ data, updateData }: TaskFormProps) => (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>Contract Source</Label>
        <Select
          value={data.contractSource}
          onValueChange={(v) => updateData("contractSource", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="File Upload">File Upload</SelectItem>
            <SelectItem value="URL">URL</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {data.contractSource === "URL" && (
        <div className="space-y-1">
          <Label>Source URL</Label>
          <Input
            type="url"
            value={data.sourceUrl || ""}
            onChange={(e) => updateData("sourceUrl", e.target.value)}
            placeholder="URL"
          />
        </div>
      )}
      <div className="space-y-1">
        <Label>Frequency</Label>
        <Select
          value={data.frequency}
          onValueChange={(v) => updateData("frequency", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="on-demand">On Demand</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  aiResearchAssistant: ({ data, updateData }: TaskFormProps) => (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>Research Topics</Label>
        <Textarea
          value={data.researchTopics?.join("\n") || ""}
          onChange={(e) => updateData("researchTopics", e.target.value.split("\n"))}
          placeholder="One topic per line"
        />
      </div>
      <div className="space-y-1">
        <Label>Data Sources</Label>
        <Textarea
          value={data.dataSources?.join("\n") || ""}
          onChange={(e) => updateData("dataSources", e.target.value.split("\n"))}
          placeholder="One source per line"
        />
      </div>
      <div className="space-y-1">
        <Label>Frequency</Label>
        <Select
          value={data.frequency}
          onValueChange={(v) => updateData("frequency", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="on-demand">On Demand</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  regulatoryComplianceWatchdog: ({ data, updateData }: TaskFormProps) => (
    <div className="space-y-2">
      <div className="space-y-1">
        <Label>Regulatory Bodies</Label>
        <Textarea
          value={data.regulatoryBodies?.join("\n") || ""}
          onChange={(e) =>
            updateData("regulatoryBodies", e.target.value.split("\n"))
          }
          placeholder="One body per line"
        />
      </div>
      <div className="space-y-1">
        <Label>Keywords</Label>
        <Textarea
          value={data.keywords?.join("\n") || ""}
          onChange={(e) => updateData("keywords", e.target.value.split("\n"))}
          placeholder="One keyword per line"
        />
      </div>
      <div className="space-y-1">
        <Label>Frequency</Label>
        <Select
          value={data.frequency}
          onValueChange={(v) => updateData("frequency", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="on-demand">On Demand</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
};

interface TaskNodeProps extends NodeProps {
  data: any;
  updateNodeData?: (id: string, data: any) => void; // Added this prop
}

export function TaskNode({ data, isConnectable, id, updateNodeData }: TaskNodeProps) {
  const TaskForm = taskInputs[data.subtype] || (() => null);

  const updateData = (key: string, value: any) => {
    console.log(`Updating node ${id} with { ${key}: ${value} }`);
    if (updateNodeData) {
      updateNodeData(id, { [key]: value });
    } else {
      console.error("updateNodeData function is not provided as a prop");
    }
  };

  return (
    <div className="rounded-md border bg-card p-4 shadow-sm w-[300px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-500 dark:bg-purple-900 dark:text-purple-300">
          <Workflow className="h-4 w-4" />
        </div>
        <div className="font-semibold truncate">{data.label}</div>
      </div>

      {TaskForm ? (
        <TaskForm data={data} updateData={updateData} />
      ) : (
        <div>No form available for this task type.</div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-purple-500"
      />
    </div>
  );
}
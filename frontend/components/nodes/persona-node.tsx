import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { User } from "lucide-react";
import { Handle, Position, type NodeProps } from "reactflow";

interface PersonaNodeProps extends NodeProps {
  data: {
    label: string;
    description: string;
    role: string;
    onUpdate: (nodeId: string, data: any) => void;
  };
}

export function PersonaNode({ data, isConnectable, id }: PersonaNodeProps) {
  const updateData = (key: string, value: any) => {
    console.log(`Updating node ${id} with { ${key}: ${value} }`);
    data.onUpdate(id, { [key]: value });
  };

  return (
    <div className="rounded-md border bg-card p-4 shadow-sm w-[300px]">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500 dark:bg-blue-900 dark:text-blue-300">
          <User className="h-4 w-4" />
        </div>
        <div className="font-semibold truncate">{data.label}</div>
      </div>

      <div className="space-y-2">
        <div className="space-y-1">
          <Label>Name</Label>
          <Input
            type="text"
            value={data.label || ""}
            onChange={(e) => updateData("label", e.target.value)}
            placeholder="Persona Name"
          />
        </div>
        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea
            value={data.description || ""}
            onChange={(e) => updateData("description", e.target.value)}
            placeholder="Persona Description"
          />
        </div>
        <div className="space-y-1">
          <Label>Qualities/Role</Label>
          <Textarea
            value={data.role || ""}
            onChange={(e) => updateData("role", e.target.value)}
            placeholder="Qualities or Role"
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!bg-blue-500"
      />
    </div>
  );
}

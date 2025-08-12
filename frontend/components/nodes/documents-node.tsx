import { Handle, Position, type NodeProps } from "reactflow";
import { FileText, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";

interface DocumentsNodeProps extends NodeProps {
  data: {
    label: string;
    description: string;
    sources: { name: string; path: string }[];
    onUpdate: (nodeId: string, data: any) => void;
  };
}

export function DocumentsNode({ data, isConnectable, id }: DocumentsNodeProps) {
  const [newFile, setNewFile] = useState<File | null>(null);

  const updateData = (key: string, value: any) => {
    console.log(`Updating node ${id} with { ${key}: ${value} }`);
    data.onUpdate(id, { [key]: value });
  };

  const handleFileUpload = async () => {
    if (!newFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", newFile);

    try {
      const response = await fetch("http://localhost:8000/files/upload", {
        method: "POST",
        headers: {
          accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update the sources with the new file information
      const newSource = {
        name: newFile.name,
        path: result.path,
      };

      updateData("sources", [...(data.sources || []), newSource]);
      setNewFile(null); // Reset the file input
    } catch (error: any) {
      console.error("Error uploading file:", error);
      alert(`File upload failed: ${error.message}`);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setNewFile(event.target.files[0]);
    }
  };

  return (
    <div className="rounded-md border bg-card p-4 shadow-sm w-[350px]">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-500 dark:bg-green-900 dark:text-green-300">
          <FileText className="h-4 w-4" />
        </div>
        <Input
          type="text"
          placeholder="Node Label"
          value={data.label || ""}
          onChange={(e) => updateData("label", e.target.value)}
        />
      </div>

      <div className="mb-2">
        <Label>Description</Label>
        <Input
          type="text"
          placeholder="Node Description"
          value={data.description || ""}
          onChange={(e) => updateData("description", e.target.value)}
        />
      </div>

      <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
        {data.description}
      </div>

      {data.sources && data.sources.length > 0 && (
        <div className="text-xs">
          <div className="font-semibold mb-1">Documents:</div>
          <ul className="list-disc list-inside">
            {data.sources.slice(0, 3).map((source: { name: string; path: string }, index: number) => (
              <li key={index} className="truncate">
                {source.name} - {source.path}
              </li>
            ))}
            {data.sources.length > 3 && <li>+{data.sources.length - 3} more</li>}
          </ul>
        </div>
      )}

      <div className="mb-2">
        <Label className="block text-sm font-medium text-gray-700">
          Add New File
        </Label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <Input
            type="file"
            accept=".pdf,.txt,.docx,.xlsx" // Adjust accepted file types as needed
            onChange={handleFileSelect}
            className="mr-2"
          />
          <Button onClick={handleFileUpload} disabled={!newFile}>
            <Plus className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-green-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-500"
        isConnectable={isConnectable}
      />
    </div>
  );
}

import { Handle, Position, type NodeProps } from "reactflow";
import { Zap } from "lucide-react";

export function UpdatesNode({ data, isConnectable }: NodeProps) {
  return (
    <div className="rounded-md border bg-card p-4 shadow-sm w-60">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-500 dark:bg-purple-900 dark:text-purple-300">
          <Zap className="h-4 w-4" />
        </div>
        <div className="font-semibold truncate">{data.label}</div>
      </div>
      <div className="text-sm text-muted-foreground mb-2 line-clamp-2">
        {data.description}
      </div>
      {data.frequency && (
        <div className="text-xs inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold">
          Frequency: {data.frequency}
        </div>
      )}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!bg-purple-500"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-orange-500"
        isConnectable={isConnectable}
      />
    </div>
  );
}
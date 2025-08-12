import { Handle, Position, type NodeProps } from "reactflow";

export function AgentNode({ isConnectable }: NodeProps) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm w-48">
      {/* Agent Node Label */}
      <div className="text-lg font-bold text-center mb-4">Agent Node</div>

      {/* Persona */}
      <div className="flex items-center mb-2 relative">
        <Handle
          type="target"
          id="persona-left"
          position={Position.Left}
          className="!bg-teal-500 !w-2 !h-2 !-left-1"
          isConnectable={isConnectable}
        />
        <span className="text-sm ml-4">Persona</span>
        <Handle
          type="target"
          id="persona-right"
          position={Position.Right}
          className="!bg-teal-500 !w-2 !h-2 !-right-1"
          isConnectable={isConnectable}
        />
      </div>

      {/* Documents */}
      <div className="flex items-center mb-2 relative">
        <Handle
          type="target"
          id="documents-left"
          position={Position.Left}
          className="!bg-blue-500 !w-2 !h-2 !-left-1"
          isConnectable={isConnectable}
        />
        <span className="text-sm ml-4">Documents</span>
        <Handle
          type="target"
          id="documents-right"
          position={Position.Right}
          className="!bg-blue-500 !w-2 !h-2 !-right-1"
          isConnectable={isConnectable}
        />
      </div>

      {/* Task Workflow */}
      <div className="flex items-center mb-2 relative">
        <Handle
          type="target"
          id="task-left"
          position={Position.Left}
          className="!bg-purple-500 !w-2 !h-2 !-left-1"
          isConnectable={isConnectable}
        />
        <span className="text-sm ml-4">Task Workflow</span>
        <Handle
          type="target"
          id="task-right"
          position={Position.Right}
          className="!bg-purple-500 !w-2 !h-2 !-right-1"
          isConnectable={isConnectable}
        />
      </div>

      {/* Updates */}
      <div className="flex items-center relative">
        <Handle
          type="target"
          id="updates-left"
          position={Position.Left}
          className="!bg-orange-500 !w-2 !h-2 !-left-1"
          isConnectable={isConnectable}
        />
        <span className="text-sm ml-4">Updates</span>
        <Handle
          type="target"
          id="updates-right"
          position={Position.Right}
          className="!bg-orange-500 !w-2 !h-2 !-right-1"
          isConnectable={isConnectable}
        />
      </div>
    </div>
  );
}
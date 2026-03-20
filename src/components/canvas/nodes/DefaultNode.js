import { Handle, Position } from "@xyflow/react";

export default function DefaultNode({ data }) {
  return (
    <div
      className={`node-card ${data.active ? "node-highlight" : ""}`}
      data-node="default"
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--fg)]">{data.label}</p>
          {data.description && (
            <p className="mt-1 text-xs text-[var(--fg-muted)]">
              {data.description}
            </p>
          )}
        </div>
        <span
          className="h-3 w-3 rounded-full"
          style={{ background: data.color ?? "var(--accent)" }}
        />
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

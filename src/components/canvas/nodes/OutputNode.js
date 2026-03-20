import { Handle, Position } from "@xyflow/react";

export default function OutputNode({ data }) {
  return (
    <div
      className={`node-card ${data.active ? "node-highlight" : ""}`}
      data-node="output"
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--fg-muted)]">
            End
          </p>
          <p className="text-sm font-semibold text-[var(--fg)]">{data.label}</p>
        </div>
        <span
          className="h-3 w-3 rounded-full"
          style={{ background: data.color ?? "var(--accent)" }}
        />
      </div>
    </div>
  );
}

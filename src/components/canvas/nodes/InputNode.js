import { Handle, Position } from "@xyflow/react";

export default function InputNode({ data }) {
  return (
    <div
      className={`node-card ${data.active ? "node-highlight" : ""}`}
      data-node="input"
    >
      <Handle type="source" position={Position.Right} />
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--fg-muted)]">
            Start
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

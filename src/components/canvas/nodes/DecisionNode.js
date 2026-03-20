import { Handle, Position } from "@xyflow/react";

export default function DecisionNode({ data }) {
  return (
    <div
      className={`node-card ${data.active ? "node-highlight" : ""}`}
      data-node="decision"
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Left} id="left" />
      <Handle type="source" position={Position.Right} id="right" />
      <div className="node-inner">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--fg-muted)]">
          Decision
        </p>
        <p className="text-sm font-semibold text-[var(--fg)]">{data.label}</p>
      </div>
    </div>
  );
}

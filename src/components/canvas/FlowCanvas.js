"use client";

import {
  ReactFlow,
  Background,
  Controls,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import { useEffect, useMemo, useState } from "react";
import DefaultNode from "@/components/canvas/nodes/DefaultNode";
import InputNode from "@/components/canvas/nodes/InputNode";
import OutputNode from "@/components/canvas/nodes/OutputNode";
import DecisionNode from "@/components/canvas/nodes/DecisionNode";

export default function FlowCanvas({
  diagram,
  diagramVersion = 0,
  playState,
  playSpeed = 1,
  playSeed = 0,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(diagram.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(diagram.edges);
  const [playIndex, setPlayIndex] = useState(-1);
  const playOrder = diagram.playSequence ?? [];

  const nodeTypes = useMemo(
    () => ({
      defaultNode: DefaultNode,
      inputNode: InputNode,
      outputNode: OutputNode,
      decisionNode: DecisionNode,
    }),
    []
  );

  useEffect(() => {
    setNodes(diagram.nodes);
    setEdges(diagram.edges);
    setPlayIndex(-1);
  }, [diagramVersion, diagram, setNodes, setEdges]);

  useEffect(() => {
    if (playState !== "playing" || playOrder.length === 0) {
      setPlayIndex(-1);
      setNodes((nds) =>
        nds.map((node) => ({
          ...node,
          data: { ...node.data, active: false },
        }))
      );
      setEdges((eds) => eds.map((edge) => ({ ...edge, animated: false })));
      return;
    }

    setPlayIndex(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current >= playOrder.length) {
        clearInterval(interval);
        return;
      }
      setPlayIndex(current);
    }, 800 / Math.max(0.5, playSpeed));

    return () => clearInterval(interval);
  }, [playState, playSpeed, playOrder.length, playSeed, setNodes, setEdges]);

  useEffect(() => {
    if (playIndex < 0) return;
    const activeId = playOrder[playIndex];
    const nextId = playOrder[playIndex + 1];

    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: { ...node.data, active: node.id === activeId },
      }))
    );
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: Boolean(
          activeId &&
            nextId &&
            edge.source === activeId &&
            edge.target === nextId
        ),
      }))
    );
  }, [playIndex, playOrder, setNodes, setEdges]);

  return (
    <div className="flex flex-1">
      <div id="flow-export" className="relative flex flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          className="bg-[var(--bg)]"
        >
          <Background gap={24} color="var(--grid)" />
          <Controls />
        </ReactFlow>
        {playState === "playing" && (
          <div className="pointer-events-none absolute inset-0 border-2 border-[var(--accent)]/30" />
        )}
      </div>
    </div>
  );
}

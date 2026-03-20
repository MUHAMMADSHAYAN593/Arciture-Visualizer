export function normalizeDiagram(diagram) {
  const nodes = Array.isArray(diagram?.nodes) ? diagram.nodes : [];
  const edges = Array.isArray(diagram?.edges) ? diagram.edges : [];
  const playSequence = Array.isArray(diagram?.playSequence)
    ? diagram.playSequence
    : [];

  const nodeTypeById = new Map(nodes.map((node) => [node.id, node.type]));
  const decisionCount = new Map();

  const cleanedEdges = edges.map((edge) => {
    const cleaned = { ...edge };
    if (cleaned.sourceHandle === null || cleaned.sourceHandle === "null" || cleaned.sourceHandle === "") {
      delete cleaned.sourceHandle;
    }
    if (cleaned.targetHandle === null || cleaned.targetHandle === "null" || cleaned.targetHandle === "") {
      delete cleaned.targetHandle;
    }

    const sourceType = nodeTypeById.get(cleaned.source);
    if (sourceType === "decisionNode" && !cleaned.sourceHandle) {
      const label = String(cleaned.label ?? "").toLowerCase();
      if (label.includes("yes") || label.includes("true")) {
        cleaned.sourceHandle = "right";
      } else if (label.includes("no") || label.includes("false")) {
        cleaned.sourceHandle = "left";
      } else {
        const count = decisionCount.get(cleaned.source) ?? 0;
        cleaned.sourceHandle = count % 2 === 0 ? "left" : "right";
        decisionCount.set(cleaned.source, count + 1);
      }
    }

    return cleaned;
  });

  return {
    ...diagram,
    nodes,
    edges: cleanedEdges,
    playSequence,
  };
}

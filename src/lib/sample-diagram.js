export const sampleDiagram = {
  title: "SaaS Billing Cycle",
  nodes: [
    {
      id: "n1",
      type: "inputNode",
      position: { x: 40, y: 120 },
      data: {
        label: "Customer signs up",
        description: "Start the subscription journey",
        color: "#1d9e75",
      },
    },
    {
      id: "n2",
      type: "defaultNode",
      position: { x: 320, y: 120 },
      data: {
        label: "Create billing profile",
        description: "Assign plan, seat count, and terms",
        color: "#1d9e75",
      },
    },
    {
      id: "n3",
      type: "decisionNode",
      position: { x: 600, y: 80 },
      data: {
        label: "Payment succeeds?",
        description: "Card validation response",
        color: "#f59f0b",
      },
    },
    {
      id: "n4",
      type: "defaultNode",
      position: { x: 880, y: 0 },
      data: {
        label: "Activate subscription",
        description: "Provision product access",
        color: "#1d9e75",
      },
    },
    {
      id: "n5",
      type: "defaultNode",
      position: { x: 880, y: 190 },
      data: {
        label: "Retry payment",
        description: "Notify user + schedule retry",
        color: "#f59f0b",
      },
    },
    {
      id: "n6",
      type: "outputNode",
      position: { x: 1160, y: 120 },
      data: {
        label: "Billing live",
        description: "Cycle begins",
        color: "#1d9e75",
      },
    },
  ],
  edges: [
    { id: "e1", source: "n1", target: "n2", animated: false },
    { id: "e2", source: "n2", target: "n3", animated: false },
    { id: "e3", source: "n3", target: "n4", label: "Yes", animated: false },
    { id: "e4", source: "n3", target: "n5", label: "No", animated: false },
    { id: "e5", source: "n4", target: "n6", animated: false },
    { id: "e6", source: "n5", target: "n6", animated: false },
  ],
  playSequence: ["n1", "n2", "n3", "n4", "n6"],
};

import { z } from "zod";

export const diagramSchema = z.object({
  title: z.string().min(1).max(80),
  nodes: z
    .array(
      z.object({
        id: z.string().min(1),
        type: z.enum(["inputNode", "defaultNode", "decisionNode", "outputNode"]),
        position: z.object({
          x: z.number(),
          y: z.number(),
        }),
        data: z.object({
          label: z.string().min(1),
          description: z.string().optional(),
          category: z.string().optional(),
          color: z.string().optional(),
        }),
      })
    )
    .min(1),
  edges: z
    .array(
      z.object({
        id: z.string().min(1),
        source: z.string().min(1),
        target: z.string().min(1),
        label: z.string().optional(),
        animated: z.boolean().optional(),
      })
    )
    .default([]),
  playSequence: z.array(z.string()).default([]),
});

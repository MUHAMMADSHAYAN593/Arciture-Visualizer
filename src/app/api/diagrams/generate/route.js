import { NextResponse } from "next/server";
import { diagramSchema } from "@/lib/diagram-schema";
import { normalizeDiagram } from "@/lib/normalize-diagram";
import { connectToDatabase } from "@/lib/db";
import Diagram from "@/models/Diagram";

const SYSTEM_PROMPT = `
You are a diagram generation engine. Given a user's description of a process,
system, idea, or workflow, you MUST respond with ONLY valid JSON — no markdown,
no prose, no code fences. The JSON must match this schema exactly:
{
  "title": "Short diagram title (< 40 chars)",
  "nodes": [
    {
      "id": "unique-string-id",
      "type": "inputNode | defaultNode | decisionNode | outputNode",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Node title (< 30 chars)",
        "description": "One sentence description",
        "category": "trigger | process | decision | output | integration",
        "color": "#hex colour matching node category"
      }
    }
  ],
  "edges": [
    {
      "id": "unique-edge-id",
      "source": "source-node-id",
      "target": "target-node-id",
      "label": "Edge label (optional, < 20 chars)",
      "animated": false
    }
  ],
  "playSequence": ["node-id-1", "node-id-2", ...]
}
Rules:
- Layout nodes in a logical left-to-right OR top-to-bottom flow.
- Start x at 50, increment x by 220px between columns.
- Start y at 50, increment y by 120px between rows.
- The first node must be type inputNode, last must be outputNode.
- Decision nodes branch to 2 targets; label edges 'Yes' and 'No'.
- Minimum 4 nodes, maximum 16 nodes.
- playSequence must include all node ids in execution order.
`.trim();

function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  const candidate = text.slice(start, end + 1);
  try {
    return JSON.parse(candidate);
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const prompt = String(body?.prompt ?? "").trim();
    const clientId = String(body?.id ?? body?.clientId ?? "").trim();
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
    const model = process.env.OLLAMA_MODEL ?? "minimax-m2.5:cloud";

    const res = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        system: SYSTEM_PROMPT,
        prompt: `User prompt: ${prompt}\nReturn JSON only.`,
        stream: false,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Ollama request failed.", detail: text },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data?.response ?? data?.message?.content ?? "";
    const parsed = extractJson(raw);
    if (!parsed) {
      return NextResponse.json(
        { error: "Model did not return valid JSON." },
        { status: 500 }
      );
    }

    const result = diagramSchema.safeParse(parsed);
    if (!result.success) {
      return NextResponse.json(
        { error: "Diagram schema validation failed." },
        { status: 422 }
      );
    }

    const normalized = normalizeDiagram(result.data);

    if (!clientId) {
      console.warn("Auto-save skipped: missing clientId");
      return NextResponse.json({
        diagram: normalized,
        saved: false,
        saveError: "Missing diagram id.",
      });
    }

    try {
      await connectToDatabase();
      await Diagram.findOneAndUpdate(
        { clientId },
        {
          clientId,
          title: normalized.title ?? "Diagram",
          prompt,
          nodes: normalized.nodes ?? [],
          edges: normalized.edges ?? [],
          playSequence: normalized.playSequence ?? [],
        },
        { upsert: true, returnDocument: "after" }
      ).lean();
      console.log("Auto-saved diagram", clientId);
      return NextResponse.json({
        diagram: normalized,
        saved: true,
        clientId,
      });
    } catch (error) {
      console.error("Auto-save failed:", error);
      return NextResponse.json({
        diagram: normalized,
        saved: false,
        clientId,
        saveError: "MongoDB write failed.",
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected server error.", detail: String(error) },
      { status: 500 }
    );
  }
}

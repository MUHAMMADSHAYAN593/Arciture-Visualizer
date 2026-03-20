import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Diagram from "@/models/Diagram";
import { normalizeDiagram } from "@/lib/normalize-diagram";

export async function GET(request, { params }) {
  await connectToDatabase();
  const resolvedParams = await params;
  const clientId = String(resolvedParams?.id ?? "").trim();
  if (!clientId) {
    return NextResponse.json({ error: "id is required." }, { status: 400 });
  }
  const diagram = await Diagram.findOne({ clientId }).lean();
  if (!diagram) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const normalized = normalizeDiagram({
    title: diagram.title,
    nodes: diagram.nodes ?? [],
    edges: diagram.edges ?? [],
    playSequence: diagram.playSequence ?? [],
    prompt: diagram.prompt ?? "",
  });
  return NextResponse.json({ diagram: normalized });
}

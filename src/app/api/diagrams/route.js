import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Diagram from "@/models/Diagram";
import { normalizeDiagram } from "@/lib/normalize-diagram";

export async function GET() {
  await connectToDatabase();
  const diagrams = await Diagram.find({})
    .sort({ updatedAt: -1 })
    .limit(20)
    .lean();
  return NextResponse.json({ diagrams });
}

export async function POST(request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const clientId = String(body?.id ?? body?.clientId ?? "").trim();
    const title = String(body?.title ?? "").trim();
    const prompt = String(body?.prompt ?? "").trim();
    const diagram = normalizeDiagram(body?.diagram ?? {});

    if (!clientId || !title || !prompt) {
      return NextResponse.json(
        { error: "id, title, and prompt are required." },
        { status: 400 }
      );
    }

    const doc = await Diagram.findOneAndUpdate(
      { clientId },
      {
        clientId,
        title,
        prompt,
        nodes: diagram.nodes ?? [],
        edges: diagram.edges ?? [],
        playSequence: diagram.playSequence ?? [],
      },
      { upsert: true, returnDocument: "after" }
    ).lean();

    return NextResponse.json({ diagram: doc });
  } catch (error) {
    console.error("Save diagram failed:", error);
    return NextResponse.json(
      { error: "MongoDB write failed." },
      { status: 500 }
    );
  }
}

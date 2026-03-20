import mongoose from "mongoose";

const DiagramSchema = new mongoose.Schema(
  {
    clientId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    prompt: { type: String, required: true },
    nodes: { type: Array, default: [] },
    edges: { type: Array, default: [] },
    playSequence: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Diagram ||
  mongoose.model("Diagram", DiagramSchema);

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, Pause, RotateCcw, Save, Share2 } from "lucide-react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import FlowCanvas from "@/components/canvas/FlowCanvas";
import ThinkingState from "@/components/canvas/ThinkingState";
import html2canvas from "html2canvas";
import { normalizeDiagram } from "@/lib/normalize-diagram";

export default function CanvasShell({ diagramId, initialPrompt }) {
  const router = useRouter();
  const [activeId, setActiveId] = useState(diagramId ?? "");
  const [prompt, setPrompt] = useState(initialPrompt);
  const [thinking, setThinking] = useState(true);
  const [diagram, setDiagram] = useState(null);
  const [diagramVersion, setDiagramVersion] = useState(0);
  const [error, setError] = useState("");
  const [playState, setPlayState] = useState("paused");
  const [speed, setSpeed] = useState(1);
  const [playSeed, setPlaySeed] = useState(0);
  const [title, setTitle] = useState("Untitled Diagram");
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveNotice, setSaveNotice] = useState("");
  const [history, setHistory] = useState([]);

  const filenameBase =
    title?.trim()?.toLowerCase()?.replace(/[^a-z0-9]+/g, "-") || "diagram";

  const handleNewDiagram = useCallback(() => {
    const id = globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}`;
    setActiveId(id);
    router.push(`/canvas/${id}`);
  }, [router]);

  const exportDiagram = useCallback(
    async (format) => {
      const target = document.getElementById("flow-export");
      if (!target) {
        setSaveNotice("Nothing to export");
        return;
      }

      const root = document.documentElement;
      const bg = getComputedStyle(root).getPropertyValue("--bg").trim() || "#fff";
      root.classList.add("exporting");

      try {
        const canvas = await html2canvas(target, {
          backgroundColor: bg,
          scale: 2,
          useCORS: true,
        });
        const dataUrl = canvas.toDataURL("image/png");

        if (format === "pdf") {
          const printWindow = window.open("", "_blank");
          if (!printWindow) {
            setSaveNotice("Popup blocked");
            return;
          }
          printWindow.document.write(`
            <html>
              <head>
                <title>${filenameBase}.pdf</title>
                <style>
                  html, body { margin: 0; padding: 0; }
                  img { width: 100%; height: auto; display: block; }
                </style>
              </head>
              <body>
                <img src="${dataUrl}" />
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.focus();
            printWindow.print();
          };
          setSaveNotice("Open print dialog for PDF");
          return;
        }

        const link = document.createElement("a");
        link.download = `${filenameBase}.png`;
        link.href = dataUrl;
        link.click();
        setSaveNotice("PNG downloaded");
      } catch (err) {
        setSaveNotice("Export failed");
      } finally {
        root.classList.remove("exporting");
      }
    },
    [filenameBase]
  );

  useEffect(() => {
    if (!saveNotice) return;
    const timer = setTimeout(() => setSaveNotice(""), 2000);
    return () => clearTimeout(timer);
  }, [saveNotice]);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/diagrams", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setHistory(Array.isArray(data?.diagrams) ? data.diagrams : []);
    } catch {
      setHistory([]);
    }
  }, []);

  const loadFromDatabase = useCallback(async () => {
    if (!activeId) return false;
    try {
      const res = await fetch(`/api/diagrams/${activeId}`, {
        cache: "no-store",
      });
      if (!res.ok) return false;
      const data = await res.json();
      if (data?.diagram) {
        const normalized = normalizeDiagram({
          title: data.diagram.title,
          nodes: data.diagram.nodes ?? [],
          edges: data.diagram.edges ?? [],
          playSequence: data.diagram.playSequence ?? [],
        });
        setDiagram(normalized);
        setTitle(data.diagram.title ?? "Diagram");
        setPrompt(data.diagram.prompt ?? "");
        setDiagramVersion((v) => v + 1);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [activeId]);

  const generateDiagram = useCallback(async (nextPrompt) => {
    const trimmed = String(nextPrompt ?? "").trim();
    if (!trimmed) {
      setError("Add a prompt to generate a diagram.");
      return;
    }
    let idToUse = activeId;
    if (!idToUse) {
      idToUse =
        globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}`;
      setActiveId(idToUse);
      router.replace(`/canvas/${idToUse}?prompt=${encodeURIComponent(trimmed)}`);
    }
    setIsGenerating(true);
    setError("");
    setThinking(true);
    setDiagram(null);
    try {
      const res = await fetch("/api/diagrams/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, id: idToUse }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Failed to generate diagram.");
      }
      const data = await res.json();
      if (data?.diagram) {
        const normalized = normalizeDiagram(data.diagram);
        setDiagram(normalized);
        setDiagramVersion((v) => v + 1);
        setTitle(normalized.title ?? "Diagram");
        if (data?.saved) {
          setSaveNotice("Saved to MongoDB");
        } else if (data?.saveError) {
          setSaveNotice(data.saveError);
        } else {
          setSaveNotice("MongoDB save skipped");
        }
        loadHistory();
      }
    } catch (err) {
      setError(err?.message ?? "Generation failed.");
    } finally {
      setIsGenerating(false);
      setThinking(false);
    }
  }, [activeId, router, loadHistory]);

  useEffect(() => {
    if (diagramId && diagramId !== activeId) {
      setActiveId(diagramId);
    }
  }, [diagramId, activeId]);

  useEffect(() => {
    const run = async () => {
      setError("");
      setThinking(true);
      const loaded = await loadFromDatabase();
      if (loaded) {
        setThinking(false);
        return;
      }
      if (initialPrompt) {
        setPrompt(initialPrompt);
        await generateDiagram(initialPrompt);
      } else {
        setThinking(false);
      }
    };
    run();
  }, [diagramId, initialPrompt, generateDiagram, loadFromDatabase]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const speedLabel = useMemo(() => `${speed.toFixed(1)}x`, [speed]);

  return (
    <div className="flex min-h-[calc(100vh-84px)] w-full flex-col bg-[var(--bg)]">
      <div className="flex flex-1">
        <aside className="hidden w-[300px] flex-col border-r border-[var(--panel-border)] bg-[var(--bg-soft)]/80 px-6 py-6 backdrop-blur md:flex">
          <div className="flex items-center justify-between">
            <h2 className="text-display text-sm font-semibold uppercase tracking-[0.3em] text-[var(--fg-muted)]">
              Prompt
            </h2>
            <button
              onClick={handleNewDiagram}
              className="rounded-full border border-[var(--panel-border)] px-3 py-1 text-xs text-[var(--fg-muted)]"
            >
              New
            </button>
          </div>
          <textarea
            value={prompt}
            onChange={(event) => {
              setPrompt(event.target.value);
              if (error) setError("");
            }}
            rows={6}
            placeholder="Refine your prompt..."
            className="mt-4 w-full resize-none rounded-2xl border border-transparent bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] shadow-inner outline-none focus:border-[var(--accent)]"
          />
          <button
            onClick={() => generateDiagram(prompt)}
            disabled={!prompt.trim()}
            className="mt-4 w-full rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? "Generating..." : "Regenerate Diagram"}
          </button>
          <div className="mt-6 flex flex-col gap-3">
            <span className="text-xs uppercase tracking-[0.3em] text-[var(--fg-muted)]">
              Saved Diagrams
            </span>
            {history.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--panel-border)] px-4 py-3 text-xs text-[var(--fg-muted)]">
                No saved diagrams yet.
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.clientId}
                  onClick={() => router.push(`/canvas/${item.clientId}`)}
                  className="rounded-2xl border border-[var(--panel-border)] px-4 py-3 text-left text-sm text-[var(--fg)] transition hover:border-[var(--accent)]"
                >
                  {item.title ?? "Untitled"}
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="flex flex-1 flex-col">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--panel-border)] bg-[var(--bg)]/70 px-6 py-4 backdrop-blur">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-[var(--fg-muted)] transition hover:text-[var(--fg)]"
              >
                <ArrowLeft size={16} />
                Back
              </Link>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--fg-muted)]">
                  Diagram
                </p>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="bg-transparent text-lg font-semibold text-[var(--fg)] outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setPlayState((prev) => {
                    const next = prev === "playing" ? "paused" : "playing";
                    if (next === "playing") {
                      setPlaySeed((seed) => seed + 1);
                    }
                    return next;
                  })
                }
                className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] px-4 py-2 text-sm text-[var(--fg)]"
              >
                {playState === "playing" ? <Pause size={16} /> : <Play size={16} />}
                {playState === "playing" ? "Pause" : "Play"}
              </button>
              <button
                onClick={() => {
                  setPlaySeed((seed) => seed + 1);
                  setPlayState("playing");
                }}
                className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] px-4 py-2 text-sm text-[var(--fg)]"
              >
                <RotateCcw size={16} />
                Replay
              </button>
              <div className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] px-4 py-2 text-xs text-[var(--fg-muted)]">
                <span>Speed</span>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={speed}
                  onChange={(event) => setSpeed(Number(event.target.value))}
                  className="accent-[var(--accent)]"
                />
                <span>{speedLabel}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportDiagram("png")}
                className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] px-4 py-2 text-sm text-[var(--fg)]"
              >
                <Save size={16} />
                Save PNG
              </button>
              <button
                onClick={() => exportDiagram("pdf")}
                className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] px-4 py-2 text-sm text-[var(--fg)]"
              >
                Export PDF
              </button>
              {saveNotice ? (
                <span className="text-xs text-[var(--fg-muted)]">
                  {saveNotice}
                </span>
              ) : null}
              <button className="flex items-center gap-2 rounded-full border border-[var(--panel-border)] px-4 py-2 text-sm text-[var(--fg)]">
                <Share2 size={16} />
                Share
              </button>
              <ThemeToggle />
            </div>
          </div>

          <div className="relative flex flex-1">
            {thinking ? (
              <ThinkingState prompt={prompt} />
            ) : (
              <>
                {diagram ? (
                  <FlowCanvas
                    diagram={diagram}
                    diagramVersion={diagramVersion}
                    playState={playState}
                    playSpeed={speed}
                    playSeed={playSeed}
                  />
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="surface-card max-w-md rounded-3xl px-6 py-5 text-center">
                      <p className="text-display text-xl font-semibold">
                        No diagram yet
                      </p>
                      <p className="mt-2 text-sm text-[var(--fg-muted)]">
                        Add a prompt and generate a new diagram.
                      </p>
                      <textarea
                        value={prompt}
                        onChange={(event) => {
                          setPrompt(event.target.value);
                          if (error) setError("");
                        }}
                        rows={4}
                        placeholder="Describe any process, system, or idea..."
                        className="mt-4 w-full resize-none rounded-2xl border border-transparent bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)] shadow-inner outline-none focus:border-[var(--accent)]"
                      />
                      <button
                        onClick={() => generateDiagram(prompt)}
                        disabled={!prompt.trim()}
                        className="mt-4 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                )}
                {error ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg)]/80 backdrop-blur">
                    <div className="surface-card max-w-md rounded-3xl px-6 py-5 text-center">
                      <p className="text-display text-xl font-semibold">
                        {error?.toLowerCase().includes("prompt")
                          ? "Prompt required"
                          : "Generation failed"}
                      </p>
                      <p className="mt-2 text-sm text-[var(--fg-muted)]">
                        {error}
                      </p>
                      <button
                        onClick={() => generateDiagram(prompt)}
                        className="mt-4 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

const examples = [
  "Map a SaaS subscription billing cycle",
  "Visualize an e-commerce order lifecycle",
  "Outline a CI/CD deployment pipeline",
];

export default function PromptHero() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const submitPrompt = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const id = globalThis.crypto?.randomUUID?.() ?? `draft-${Date.now()}`;
    const encoded = encodeURIComponent(trimmed);
    router.push(`/canvas/${id}?prompt=${encoded}`);
  };

  return (
    <section className="relative flex min-h-[calc(100vh-84px)] w-full items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 hero-glow" />
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="absolute inset-0 noise-bg" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative mx-auto flex w-full max-w-3xl flex-col gap-8"
      >
        <div className="flex flex-col gap-4 text-center">
          <span className="mx-auto flex items-center gap-2 rounded-full border border-[var(--panel-border)] px-4 py-2 text-xs uppercase tracking-[0.3em] text-[var(--fg-muted)]">
            <Sparkles size={14} />
            AI Diagram Studio
          </span>
          <h1 className="text-display text-4xl font-semibold leading-tight text-[var(--fg)] md:text-5xl">
            Type a system. See the architecture unfold.
          </h1>
          <p className="text-lg text-[var(--fg-muted)]">
            Architecture Visualizer turns plain-language ideas into a living,
            interactive flow canvas in seconds.
          </p>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitPrompt(prompt);
          }}
          className="surface-card relative flex flex-col gap-4 rounded-3xl p-6 md:p-8"
        >
          <label className="text-xs uppercase tracking-[0.3em] text-[var(--fg-muted)]">
            Describe the flow
          </label>
          <textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe any process, system, or idea..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-transparent bg-[var(--bg-soft)] px-4 py-4 text-base text-[var(--fg)] shadow-inner outline-none transition focus:border-[var(--accent)]"
          />
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    setPrompt(example);
                    submitPrompt(example);
                  }}
                  className="rounded-full border border-[var(--panel-border)] px-4 py-2 text-xs text-[var(--fg-muted)] transition hover:border-[var(--accent)] hover:text-[var(--fg)]"
                >
                  {example}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="group flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-[var(--accent-strong)]"
            >
              Generate Diagram
              <ArrowUpRight size={16} className="transition group-hover:translate-x-1" />
            </button>
          </div>
        </form>
      </motion.div>
    </section>
  );
}

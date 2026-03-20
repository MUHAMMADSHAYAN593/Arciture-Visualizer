"use client";

import { useEffect, useState } from "react";

const steps = [
  "→ Analysing prompt...",
  "→ Identifying key actors...",
  "→ Mapping dependencies...",
  "→ Drafting diagram topology...",
  "→ Preparing flow nodes...",
];

export default function ThinkingState({ prompt }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % steps.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[var(--bg)]">
      <div className="absolute inset-0 hero-glow" />
      <div className="absolute inset-0 grid-bg opacity-70" />
      <div className="absolute inset-0 noise-bg" />

      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-6 rounded-3xl border border-[var(--panel-border)] bg-[var(--panel)] px-8 py-10 text-center shadow-xl">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[var(--panel-border)] bg-[var(--bg-soft)]">
          <div className="h-10 w-10 animate-pulse rounded-full bg-[var(--accent)]" />
        </div>
        <div className="space-y-2">
          <p className="text-display text-2xl font-semibold">
            Thinking through your system
          </p>
          <p className="text-sm text-[var(--fg-muted)]">
            {prompt ? `"${prompt}"` : "We are shaping the flow..."}
          </p>
        </div>
        <div className="w-full rounded-2xl border border-[var(--panel-border)] bg-[var(--bg-soft)] px-4 py-3 text-left text-sm text-[var(--fg)]">
          <span className="font-mono text-xs text-[var(--fg-muted)]">
            {steps[index]}
          </span>
        </div>
      </div>
    </div>
  );
}

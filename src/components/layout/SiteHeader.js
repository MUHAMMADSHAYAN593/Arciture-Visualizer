import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--panel-border)] bg-[var(--bg)]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-display text-lg font-semibold tracking-tight text-[var(--fg)]"
        >
          Architecture Visualizer
        </Link>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[var(--panel-border)] px-3 py-1 text-xs uppercase tracking-[0.25em] text-[var(--fg-muted)]">
            Draft
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

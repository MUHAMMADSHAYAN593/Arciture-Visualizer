import CanvasShell from "@/components/canvas/CanvasShell";

export default async function CanvasPage({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  return (
    <CanvasShell
      diagramId={resolvedParams?.id ?? ""}
      initialPrompt={resolvedSearchParams?.prompt ?? ""}
    />
  );
}

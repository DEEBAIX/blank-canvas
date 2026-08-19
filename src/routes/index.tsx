import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { repoFiles, repoStats } from "@/lib/repo-files";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const REPO = "DEEBAIX/blank-canvas";
const BRANCH = "main";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "blank-canvas — Read-only Source Preview" },
      {
        name: "description",
        content:
          "Read-only preview of the DEEBAIX/blank-canvas repository source files synced to this project.",
      },
      { property: "og:title", content: "blank-canvas — Read-only Source Preview" },
      {
        property: "og:description",
        content: "Browse the repository source files synced to this project, read-only.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RepoPreview,
});

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function RepoPreview() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(repoFiles[0]?.path ?? "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? repoFiles.filter((f) => f.path.toLowerCase().includes(q)) : repoFiles;
  }, [query]);

  const file = repoFiles.find((f) => f.path === selected) ?? filtered[0];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight">{REPO}</h1>
          <Badge variant="secondary">{BRANCH}</Badge>
          <Badge variant="outline">read-only</Badge>
          <span className="ml-auto text-xs text-muted-foreground">
            {repoStats.files} files · {repoStats.lines.toLocaleString()} lines ·{" "}
            {formatBytes(repoStats.bytes)}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-lg border border-border">
          <div className="border-b border-border p-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter files…"
              aria-label="Filter files"
            />
          </div>
          <ScrollArea className="h-[70vh]">
            <ul className="p-2">
              {filtered.map((f) => (
                <li key={f.path}>
                  <button
                    type="button"
                    onClick={() => setSelected(f.path)}
                    className={`w-full truncate rounded px-2 py-1.5 text-left font-mono text-xs transition-colors ${
                      file?.path === f.path
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                    title={f.path}
                  >
                    {f.path}
                  </button>
                </li>
              ))}
              {filtered.length === 0 && (
                <li className="px-2 py-4 text-xs text-muted-foreground">No files match.</li>
              )}
            </ul>
          </ScrollArea>
        </aside>

        <section className="min-w-0 rounded-lg border border-border">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
            <span className="truncate font-mono text-xs text-muted-foreground">
              {file?.path ?? "—"}
            </span>
            {file && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {file.lines} lines · {formatBytes(file.bytes)}
              </span>
            )}
          </div>
          <ScrollArea className="h-[70vh]">
            <pre className="min-w-0 overflow-x-auto p-4 font-mono text-xs leading-relaxed">
              <code>{file?.content ?? "Select a file"}</code>
            </pre>
          </ScrollArea>
        </section>
      </main>
    </div>
  );
}

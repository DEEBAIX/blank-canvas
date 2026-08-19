// Repository source snapshot, embedded at build time (read-only).
const modules = {
  ...import.meta.glob("/src/**/*.{ts,tsx,css,json,md}", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
  ...import.meta.glob("/*.{ts,tsx,json,md,js}", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
} as Record<string, string>;

export type RepoFile = {
  path: string;
  content: string;
  lines: number;
  bytes: number;
};

export const repoFiles: RepoFile[] = Object.entries(modules)
  .map(([path, content]) => ({
    path: path.replace(/^\//, ""),
    content,
    lines: content.split("\n").length,
    bytes: new TextEncoder().encode(content).length,
  }))
  .sort((a, b) => a.path.localeCompare(b.path));

export const repoStats = {
  files: repoFiles.length,
  lines: repoFiles.reduce((n, f) => n + f.lines, 0),
  bytes: repoFiles.reduce((n, f) => n + f.bytes, 0),
};

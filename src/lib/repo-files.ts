// Repository source snapshot, embedded at build time (read-only).
const modules = {
  ...import.meta.glob("/src/**/*.{ts,tsx,css,json,md}", {
    query: "?raw",
    import: "default",
    eager: true,
    exhaustive: false,
  }),
  ...import.meta.glob("/*.{ts,tsx,json,md,js}", {
    query: "?raw",
    import: "default",
    eager: true,
  }),
} as Record<string, string>;

// The generated route tree is transformed by the router plugin and cannot be
// imported as raw text.
delete (modules as Record<string, unknown>)["/src/routeTree.gen.ts"];


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

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Blank Project" },
      { name: "description", content: "A blank project ready for development." },
      { property: "og:title", content: "Blank Project" },
      { property: "og:description", content: "A blank project ready for development." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground">Blank Project</h1>
        <p className="mt-3 text-muted-foreground">Ready to build.</p>
      </div>
    </div>
  );
}

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/projects/$projectId/")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/projects/$projectId/$tab",
      params: { projectId: params.projectId, tab: "overview" },
    });
  },
});

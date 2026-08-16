import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ThumbsUp } from "lucide-react";
import { toast } from "sonner";

import { EmptyState, SectionCard } from "@/components/app/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useIdeas, useInsert, useMessages } from "@/lib/queries";

export function IdeasPanel({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const { data: ideas = [] } = useIdeas(projectId);
  const { data: messages = [] } = useMessages(projectId);
  const addIdea = useInsert("ideas", ["ideas"]);
  const addMessage = useInsert("messages", ["messages"]);
  const [idea, setIdea] = useState({ title: "", body: "" });
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`project-${projectId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `project_id=eq.${projectId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages", projectId] });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, queryClient]);

  async function toggleVote(ideaId: string, voted: boolean) {
    if (!userId) return;
    const query = voted
      ? supabase.from("idea_votes").delete().eq("idea_id", ideaId).eq("user_id", userId)
      : supabase.from("idea_votes").insert({ idea_id: ideaId, user_id: userId });
    const { error } = await query;
    if (error) {
      toast.error(error.message);
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["ideas", projectId] });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <SectionCard title="Idea board" description="Collect and prioritise partner suggestions before drafting.">
        <div className="grid gap-3">
          <Input placeholder="Idea title" value={idea.title} onChange={(e) => setIdea({ ...idea, title: e.target.value })} />
          <Textarea
            rows={3}
            placeholder="Describe the idea, the target group and the expected impact"
            value={idea.body}
            onChange={(e) => setIdea({ ...idea, body: e.target.value })}
          />
          <div>
            <Button
              disabled={!idea.title || addIdea.isPending}
              onClick={() =>
                addIdea.mutate(
                  { project_id: projectId, title: idea.title, body: idea.body || null, author_id: userId, status: "proposed" },
                  {
                    onSuccess: () => {
                      toast.success("Idea shared");
                      setIdea({ title: "", body: "" });
                    },
                    onError: (e: Error) => toast.error(e.message),
                  },
                )
              }
            >
              Share idea
            </Button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {ideas.length === 0 && <EmptyState title="No ideas yet" description="Be the first to propose a direction." />}
          {ideas.map((i) => {
            const votes = (i.idea_votes ?? []) as { user_id: string }[];
            const voted = votes.some((v) => v.user_id === userId);
            return (
              <article key={i.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-medium">{i.title}</h3>
                    <p className="text-xs text-muted-foreground">
                      {i.profiles?.full_name || i.profiles?.email || "Partner"} ·{" "}
                      {new Date(i.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                  <Badge variant="secondary" className="capitalize">{i.status}</Badge>
                </div>
                {i.body && <p className="mt-2 text-sm text-muted-foreground">{i.body}</p>}
                <Button
                  size="sm"
                  variant={voted ? "default" : "outline"}
                  className="mt-3"
                  onClick={() => toggleVote(i.id, voted)}
                >
                  <ThumbsUp className="h-4 w-4" /> {votes.length}
                </Button>
              </article>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Consortium chat" description="Live discussion between all partners of this project.">
        <div className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div key={m.id} className="rounded-lg bg-secondary/60 p-3">
              <p className="text-xs text-muted-foreground">
                {m.profiles?.full_name || m.profiles?.email || "Partner"} ·{" "}
                {new Date(m.created_at).toLocaleString("en-GB")}
              </p>
              <p className="mt-1 text-sm whitespace-pre-line">{m.body}</p>
            </div>
          ))}
          {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
        </div>
        <div className="mt-4 flex gap-2">
          <Input
            value={message}
            placeholder="Write a message…"
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && message.trim()) {
                addMessage.mutate({ project_id: projectId, body: message.trim(), author_id: userId });
                setMessage("");
              }
            }}
          />
          <Button
            disabled={!message.trim()}
            onClick={() => {
              addMessage.mutate({ project_id: projectId, body: message.trim(), author_id: userId });
              setMessage("");
            }}
          >
            Send
          </Button>
        </div>
      </SectionCard>
    </div>
  );
}

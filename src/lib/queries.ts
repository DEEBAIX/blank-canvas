import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await p;
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

// Loose row type: Supabase joins produce dynamic shapes across the workspace.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = any;

export function useMyRoles() {
  return useQuery({
    queryKey: ["my-roles"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return [] as string[];
      const rows = await unwrap<Row[]>(
        supabase.from("user_roles").select("role").eq("user_id", auth.user.id),
      );
      return rows.map((r) => r.role as string);
    },
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*, organizations(*)")
        .eq("id", auth.user.id)
        .maybeSingle();
      return (data as Row) ?? null;
    },
  });
}

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () =>
      unwrap<Row[]>(
        supabase
          .from("projects")
          .select("*, organizations:coordinator_org_id(name, country, country_code)")
          .order("deadline", { ascending: true }),
      ),
  });
}

export function useProject(projectId: string) {
  return useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, organizations:coordinator_org_id(*)")
        .eq("id", projectId)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data as Row | null;
    },
  });
}

export function useMembers(projectId: string) {
  return useQuery({
    queryKey: ["members", projectId],
    queryFn: () =>
      unwrap<Row[]>(
        supabase
          .from("project_members")
          .select("*, organizations:org_id(*), profiles:user_id(full_name, email, position, phone)")
          .eq("project_id", projectId)
          .order("role", { ascending: true }),
      ),
  });
}

export function useMyMembership(projectId: string) {
  return useQuery({
    queryKey: ["my-membership", projectId],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const { data } = await supabase
        .from("project_members")
        .select("*")
        .eq("project_id", projectId)
        .eq("user_id", auth.user.id)
        .maybeSingle();
      return (data as Row) ?? null;
    },
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => unwrap<Row[]>(supabase.from("organizations").select("*").order("name")),
  });
}

function listHook(table: string, order: { column: string; ascending?: boolean }, select = "*") {
  return (projectId: string) =>
    useQuery({
      queryKey: [table, projectId],
      queryFn: () =>
        unwrap<Row[]>(
          supabase
            .from(table)
            .select(select)
            .eq("project_id", projectId)
            .order(order.column, { ascending: order.ascending ?? true }),
        ),
    });
}

export const useWorkPackages = listHook("work_packages", { column: "number" }, "*, organizations:lead_org_id(name, country_code)");
export const useTasks = listHook("tasks", { column: "position" }, "*, organizations:assignee_org_id(name, country_code)");
export const useIdeas = listHook("ideas", { column: "created_at", ascending: false }, "*, idea_votes(user_id), profiles:author_id(full_name, email)");
export const useMessages = listHook("messages", { column: "created_at" }, "*, profiles:author_id(full_name, email)");
export const useDocuments = listHook("documents", { column: "created_at", ascending: false });
export const useSections = listHook("proposal_sections", { column: "position" }, "*, organizations:contributed_org_id(name)");
export const useBudgetLines = listHook("budget_lines", { column: "created_at" }, "*, organizations:org_id(name, country_code)");
export const useRequirements = listHook("call_requirements", { column: "created_at" }, "*, organizations:best_org_id(name, country_code)");
export const useEvaluations = listHook("evaluations", { column: "created_at", ascending: false });

export function useUpsert(table: string, invalidate: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Row) => {
      const { data, error } = await supabase.from(table).upsert(values).select().maybeSingle();
      if (error) throw new Error(error.message);
      return data as Row;
    },
    onSuccess: () => invalidate.forEach((key) => qc.invalidateQueries({ queryKey: [key] })),
  });
}

export function useInsert(table: string, invalidate: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Row) => {
      const { data, error } = await supabase.from(table).insert(values).select().maybeSingle();
      if (error) throw new Error(error.message);
      return data as Row;
    },
    onSuccess: () => invalidate.forEach((key) => qc.invalidateQueries({ queryKey: [key] })),
  });
}

export function useUpdate(table: string, invalidate: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Row }) => {
      const { error } = await supabase.from(table).update(values).eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => invalidate.forEach((key) => qc.invalidateQueries({ queryKey: [key] })),
  });
}

export function useRemove(table: string, invalidate: string[]) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => invalidate.forEach((key) => qc.invalidateQueries({ queryKey: [key] })),
  });
}

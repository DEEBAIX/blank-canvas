import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

import {
  analyzeCallText,
  draftProposalSection,
  evaluateProposalDraft,
} from "@/lib/ai.server";

export const analyzeCall = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ projectId: z.string().uuid(), callText: z.string().min(50).max(30000) }).parse(input),
  )
  .handler(async ({ data, context }) => analyzeCallText(context.supabase, data.projectId, data.callText));

export const draftSection = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        projectId: z.string().uuid(),
        sectionTitle: z.string().min(2).max(200),
        instructions: z.string().max(4000).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) =>
    draftProposalSection(context.supabase, data.projectId, data.sectionTitle, data.instructions ?? ""),
  );

export const evaluateProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ projectId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => evaluateProposalDraft(context.supabase, data.projectId, context.userId));

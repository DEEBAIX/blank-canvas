import { generateText, Output } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const MODEL = "google/gemini-3.5-flash";

function gateway() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured for this workspace");
  return createLovableAiGatewayProvider(key);
}

type Client = { from: (table: string) => any };

async function projectContext(supabase: Client, projectId: string) {
  const [{ data: project }, { data: members }, { data: wps }, { data: sections }, { data: requirements }] =
    await Promise.all([
      supabase.from("projects").select("*").eq("id", projectId).maybeSingle(),
      supabase.from("project_members").select("role, organizations:org_id(name, country, expertise, capabilities)").eq("project_id", projectId),
      supabase.from("work_packages").select("number, title, objective, kpis, deliverables").eq("project_id", projectId),
      supabase.from("proposal_sections").select("part, title, content").eq("project_id", projectId),
      supabase.from("call_requirements").select("requirement, status, needed_expertise").eq("project_id", projectId),
    ]);

  return JSON.stringify({ project, members, workPackages: wps, sections, requirements }).slice(0, 40000);
}

export async function analyzeCallText(supabase: Client, projectId: string, callText: string) {
  const { output } = await generateText({
    model: gateway()(MODEL),
    output: Output.object({
      schema: z.object({
        summary: z.string(),
        requirements: z
          .array(
            z.object({
              requirement: z.string(),
              needed_expertise: z.string(),
            }),
          )
          .max(15),
      }),
    }),
    system:
      "You are an experienced EU funding expert (Horizon Europe, Digital Europe, Erasmus+). Extract concrete, checkable eligibility and award requirements from call texts.",
    prompt: `Analyse this EU call text and extract the key requirements a consortium must satisfy, plus the expertise needed for each.\n\n${callText}`,
  });

  if (output.requirements.length) {
    await supabase.from("call_requirements").insert(
      output.requirements.map((r) => ({
        project_id: projectId,
        requirement: r.requirement,
        needed_expertise: r.needed_expertise,
        status: "gap",
      })),
    );
  }

  return output;
}

export async function draftProposalSection(
  supabase: Client,
  projectId: string,
  sectionTitle: string,
  instructions: string,
) {
  const context = await projectContext(supabase, projectId);
  const result = await generateText({
    model: gateway()(MODEL),
    system:
      "You write EU grant proposals. Produce evaluator-ready prose in formal European English, structured with short paragraphs, concrete indicators and references to the consortium partners provided. Never invent partner names or figures that are not in the context.",
    prompt: `Draft the proposal section "${sectionTitle}".\n\nExtra instructions: ${instructions || "none"}\n\nProject context (JSON):\n${context}`,
  });
  return { text: result.text };
}

export async function evaluateProposalDraft(supabase: Client, projectId: string, userId: string) {
  const context = await projectContext(supabase, projectId);
  const { output } = await generateText({
    model: gateway()(MODEL),
    output: Output.object({
      schema: z.object({
        excellence: z.number().min(0).max(5),
        impact: z.number().min(0).max(5),
        implementation: z.number().min(0).max(5),
        summary: z.string(),
        strengths: z.array(z.string()).max(6),
        weaknesses: z.array(z.string()).max(6),
        recommendations: z.array(z.string()).max(6),
      }),
    }),
    system:
      "You are a strict EU proposal evaluator. Score Excellence, Impact and Implementation from 0 to 5 following the standard evaluation criteria, and justify the scores.",
    prompt: `Evaluate this application as if it were submitted today.\n\nProject context (JSON):\n${context}`,
  });

  await supabase.from("evaluations").insert({
    project_id: projectId,
    kind: "ai_review",
    scores: output,
    summary: output.summary,
    created_by: userId,
  });

  return output;
}

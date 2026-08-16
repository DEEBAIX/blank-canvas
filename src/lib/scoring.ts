import type { Row } from "@/lib/queries";

export function sectionProgress(section: Row): number {
  if (section.status === "final") return 100;
  const words = String(section.content ?? "").trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return 0;
  return Math.min(95, Math.round((words / 400) * 100));
}

export function partProgress(sections: Row[], part: string): number {
  const rows = sections.filter((s) => s.part === part);
  if (!rows.length) return 0;
  return Math.round(rows.reduce((sum, s) => sum + sectionProgress(s), 0) / rows.length);
}

export function proposalProgress(sections: Row[]): number {
  if (!sections.length) return 0;
  return Math.round(sections.reduce((sum, s) => sum + sectionProgress(s), 0) / sections.length);
}

export type ReadinessInput = {
  sections: Row[];
  members: Row[];
  workPackages: Row[];
  requirements: Row[];
  budgetTotal: number;
  projectBudget: number;
};

export type ReadinessFactor = { label: string; score: number; note: string };

export function readiness(input: ReadinessInput): { score: number; factors: ReadinessFactor[] } {
  const orgs = new Set(input.members.map((m) => m.org_id).filter(Boolean));
  const countries = new Set(
    input.members.map((m) => m.organizations?.country_code).filter(Boolean),
  );
  const wpWithLead = input.workPackages.filter((w) => w.lead_org_id).length;
  const coveredReqs = input.requirements.filter((r) => r.status === "covered").length;

  const factors: ReadinessFactor[] = [
    {
      label: "Call alignment",
      score: input.requirements.length ? Math.round((coveredReqs / input.requirements.length) * 100) : 0,
      note: `${coveredReqs}/${input.requirements.length} call requirements covered by a partner`,
    },
    {
      label: "Partner complementarity",
      score: Math.min(100, orgs.size * 20),
      note: `${orgs.size} organisations in the consortium (5+ recommended)`,
    },
    {
      label: "Geographic coverage",
      score: Math.min(100, countries.size * 25),
      note: `${countries.size} countries represented (4+ recommended)`,
    },
    {
      label: "Work package leadership",
      score: input.workPackages.length
        ? Math.round((wpWithLead / input.workPackages.length) * 100)
        : 0,
      note: `${wpWithLead}/${input.workPackages.length} work packages have a confirmed leader`,
    },
    {
      label: "Proposal completeness",
      score: proposalProgress(input.sections),
      note: "Average completion across Excellence, Impact and Implementation",
    },
    {
      label: "Budget allocation",
      score:
        input.projectBudget > 0
          ? Math.min(100, Math.round((input.budgetTotal / input.projectBudget) * 100))
          : input.budgetTotal > 0
            ? 60
            : 0,
      note: "Share of the indicative budget distributed across partners",
    },
  ];

  const score = Math.round(factors.reduce((sum, f) => sum + f.score, 0) / factors.length);
  return { score, factors };
}

export function alertsFrom(input: ReadinessInput): string[] {
  const alerts: string[] = [];
  input.requirements
    .filter((r) => r.status !== "covered")
    .slice(0, 4)
    .forEach((r) => alerts.push(`Call requirement not yet covered: ${r.requirement}`));
  input.workPackages
    .filter((w) => !w.lead_org_id)
    .forEach((w) => alerts.push(`WP${w.number} ${w.title} has no responsible partner`));
  input.workPackages
    .filter((w) => !w.kpis)
    .slice(0, 3)
    .forEach((w) => alerts.push(`WP${w.number} has no KPIs defined`));
  input.sections
    .filter((s) => sectionProgress(s) < 25)
    .slice(0, 4)
    .forEach((s) => alerts.push(`Proposal section "${s.title}" is still weak or empty`));
  if (input.members.length < 4) alerts.push("Consortium is smaller than typical for this call type");
  return alerts;
}

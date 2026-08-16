import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { CountryTag } from "@/components/app/brand";
import { EmptyState, PageHeader, SectionCard } from "@/components/app/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInsert, useMyRoles, useOrganizations, useProjects } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin panel — SSD Consortium OS" },
      { name: "description", content: "Create projects, register partner organisations and invite consortium members." },
      { property: "og:title", content: "Admin panel — SSD Consortium OS" },
      { property: "og:description", content: "Create projects, register partner organisations and invite consortium members." },
    ],
  }),
  component: AdminPage,
});

const ROLES = [
  { value: "coordinator", label: "Coordinator" },
  { value: "partner_admin", label: "Partner admin" },
  { value: "partner_member", label: "Partner member" },
  { value: "reviewer", label: "Reviewer" },
];

function AdminPage() {
  const { data: roles } = useMyRoles();
  const { data: orgs = [] } = useOrganizations();
  const { data: projects = [] } = useProjects();

  const createOrg = useInsert("organizations", ["organizations"]);
  const createProject = useInsert("projects", ["projects"]);
  const invite = useInsert("project_members", ["members"]);

  const [org, setOrg] = useState({ name: "", country: "", country_code: "", pic_number: "", contact_email: "", expertise: "" });
  const [project, setProject] = useState({ code: "", title: "", programme: "", deadline: "", total_budget: "", abstract: "" });
  const [member, setMember] = useState({ project_id: "", email: "", org_id: "", role: "partner_member" });

  if (!(roles ?? []).includes("super_admin")) {
    return (
      <EmptyState
        title="Admin access required"
        description="Only the SSD platform administrators can manage projects and invitations."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        eyebrow="SSD internal"
        title="Admin panel"
        description="Register partner organisations, open new calls and invite people to a consortium."
      />

      <SectionCard title="Invite a partner" description="The person receives access as soon as they sign in with this email.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Project</Label>
            <Select value={member.project_id} onValueChange={(v) => setMember({ ...member, project_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Organisation</Label>
            <Select value={member.org_id} onValueChange={(v) => setMember({ ...member, org_id: v })}>
              <SelectTrigger><SelectValue placeholder="Select organisation" /></SelectTrigger>
              <SelectContent>
                {orgs.map((o) => (
                  <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              value={member.email}
              onChange={(e) => setMember({ ...member, email: e.target.value })}
              placeholder="partner@organisation.eu"
            />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={member.role} onValueChange={(v) => setMember({ ...member, role: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          className="mt-4"
          disabled={!member.project_id || !member.email || invite.isPending}
          onClick={() =>
            invite.mutate(
              { ...member, email: member.email.trim().toLowerCase(), org_id: member.org_id || null },
              {
                onSuccess: () => {
                  toast.success("Partner invited");
                  setMember({ ...member, email: "" });
                },
                onError: (e: Error) => toast.error(e.message),
              },
            )
          }
        >
          Send invitation
        </Button>
      </SectionCard>

      <SectionCard title="New project / call">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="p-code">Call code</Label>
            <Input id="p-code" value={project.code} onChange={(e) => setProject({ ...project, code: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-prog">Programme</Label>
            <Input id="p-prog" value={project.programme} onChange={(e) => setProject({ ...project, programme: e.target.value })} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="p-title">Title</Label>
            <Input id="p-title" value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-deadline">Deadline</Label>
            <Input id="p-deadline" type="datetime-local" value={project.deadline} onChange={(e) => setProject({ ...project, deadline: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="p-budget">Indicative budget (EUR)</Label>
            <Input id="p-budget" type="number" value={project.total_budget} onChange={(e) => setProject({ ...project, total_budget: e.target.value })} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="p-abstract">Abstract</Label>
            <Textarea id="p-abstract" rows={3} value={project.abstract} onChange={(e) => setProject({ ...project, abstract: e.target.value })} />
          </div>
        </div>
        <Button
          className="mt-4"
          disabled={!project.code || !project.title || createProject.isPending}
          onClick={() =>
            createProject.mutate(
              {
                ...project,
                deadline: project.deadline ? new Date(project.deadline).toISOString() : null,
                total_budget: project.total_budget ? Number(project.total_budget) : null,
              },
              {
                onSuccess: () => {
                  toast.success("Project created");
                  setProject({ code: "", title: "", programme: "", deadline: "", total_budget: "", abstract: "" });
                },
                onError: (e: Error) => toast.error(e.message),
              },
            )
          }
        >
          Create project
        </Button>
      </SectionCard>

      <SectionCard title="Register organisation">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="o-name">Name</Label>
            <Input id="o-name" value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="o-pic">PIC number</Label>
            <Input id="o-pic" value={org.pic_number} onChange={(e) => setOrg({ ...org, pic_number: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="o-country">Country</Label>
            <Input id="o-country" value={org.country} onChange={(e) => setOrg({ ...org, country: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="o-cc">Country code (ISO-2)</Label>
            <Input id="o-cc" maxLength={2} value={org.country_code} onChange={(e) => setOrg({ ...org, country_code: e.target.value.toUpperCase() })} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="o-mail">Contact email</Label>
            <Input id="o-mail" type="email" value={org.contact_email} onChange={(e) => setOrg({ ...org, contact_email: e.target.value })} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="o-exp">Expertise</Label>
            <Textarea id="o-exp" rows={3} value={org.expertise} onChange={(e) => setOrg({ ...org, expertise: e.target.value })} />
          </div>
        </div>
        <Button
          className="mt-4"
          disabled={!org.name || !org.country || org.country_code.length !== 2 || createOrg.isPending}
          onClick={() =>
            createOrg.mutate(org, {
              onSuccess: () => {
                toast.success("Organisation registered");
                setOrg({ name: "", country: "", country_code: "", pic_number: "", contact_email: "", expertise: "" });
              },
              onError: (e: Error) => toast.error(e.message),
            })
          }
        >
          Register organisation
        </Button>
      </SectionCard>

      <SectionCard title="Registered organisations">
        <ul className="divide-y divide-border">
          {orgs.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
              <span className="truncate">{o.name}</span>
              <CountryTag code={o.country_code} country={o.country} />
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

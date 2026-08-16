# Consortium OS — Smart Society Development NGO

A secure, English-only, EU-grade collaboration workspace where SSD builds funding consortia and writes proposals with partners. Fresh, isolated app (own database, own auth, own storage), SSD logo and brand throughout, desktop + mobile.

First real workspace: **DIGITAL-2026-BESTUSE-10-NETWORKSICs — Safer Internet Centres**, with SSD as prospective Coordinator.

## Roles

| Role | Sees | Can do |
|---|---|---|
| Super Admin (SSD) | Everything | Create projects, invite anyone, manage all data, audit log |
| Coordinator | One project fully | Edit proposal, WPs, budget, invite partners, full AI tools |
| Partner Admin | Own org + assigned project | Manage org profile, invite own members, contribute sections |
| Partner Member | Assigned tasks/sections | Fill profile, submit ideas, comment, upload docs |
| Reviewer | Read-only project | Comment only |

Access is enforced in the database, not just the UI: a partner sees only the projects they are invited to.

## Sign-in

Passwordless magic link. The visitor enters their email on a clean login page; if the email belongs to an invited partner, a link is emailed and the session opens on their dashboard. Unknown emails get a neutral "if you are invited, a link has been sent" message (never reveals who is in the consortium). Sessions expire; links are single-use.

## Structure

```text
Login  ->  Dashboard (my projects, tasks, alerts)
             |
             +-- Project Workspace: DIGITAL-2026-BESTUSE-10-NETWORKSICs
                   1. Call Analysis      requirements checklist, deadline countdown, official link
                   2. Consortium         coordinator vs partners, country flags, org chart
                   3. Partner Profiles   org data, PIC, expertise, "what we can contribute"
                   4. Roles              responsibility matrix per WP
                   5. Work Packages      WP1..WP6, leader, objectives, deliverables, KPIs, timeline
                   6. Tasks              Kanban per WP
                   7. Ideas              partner ideas + votes + comments
                   8. Chat               project / WP threads with attachments
                   9. Documents          EU templates, partner legal docs, versioning
                  10. Budget             per-partner, per-WP allocation table
                  11. Proposal Builder   Excellence / Impact / Implementation
                  12. AI Assistant       project-aware, Coordinator+ tools
                  13. Evaluation         AI evaluator scores + readiness score
             |
             +-- Admin Panel (SSD only): organisations, users, invitations, audit log
```

## Data model (first migration)

organizations (name, country, PIC, website, contact person, phone, expertise, capabilities, past projects, target groups, staff, proposed contribution) · profiles (user, name, position, phone, org) · user_roles (separate table, never on profile) · projects (call id, title, abstract, official URL, deadline, coordinator org) · project_members (user, project, role, permissions) · work_packages · tasks · ideas + idea_votes · comments · chat_channels + messages · documents (Storage, private bucket, signed access) · proposal_sections (content, contributing partner, status) · budget_lines · evaluations · audit_log.

Every table gets row-level security scoped to project membership, plus grants. Confidential data cannot leak between projects or organisations.

## AI (Coordinator and Super Admin)

- Call ↔ partner matching matrix: requirement → needed expertise → best partner → evidence → status
- Consortium gap analysis (technical, geographic, management, duplicate capacity)
- Idea analysis: relevance, innovation, feasibility, impact, risks, suggested WP and KPIs
- Proposal drafting per section — always editable by hand
- EU Evaluator mode: strengths, weaknesses, missing requirements, indicative scores for Excellence / Impact / Implementation
- Chat summaries and per-partner action lists

Runs server-side through Lovable AI; no keys in the browser.

## Design

Institutional European tone built from the SSD logo: deep navy, circuit green accent, white surfaces, generous whitespace, precise typography, subtle motion, light/dark mode. Real dashboards with progress rings (Excellence 85%, Impact 62%, Implementation 48%, Budget 75%) and a Consortium Readiness score out of 100 that explains what is missing. Fully responsive down to phones.

## Build order

1. **Foundation** — backend enabled, full schema + RLS, SSD design system, logo, login page with magic link, role-aware shell and navigation.
2. **Core workspace** — dashboard, projects, partner profiles, consortium org chart, roles matrix, work packages, tasks Kanban, documents, admin panel.
3. **Collaboration + AI** — chat, Idea Lab, Call Analysis, AI Assistant, Proposal Builder, AI Evaluation, readiness score, budget planner, compile/export proposal preview.
4. **Seed** — the DIGITAL-2026 call, WP1–WP6 skeleton and SSD as coordinator, ready for real partner invitations.

## Technical notes

- Backend runs on Lovable Cloud (managed Postgres + auth + storage) so it is live immediately and fully isolated from the main NGO site; the schema and migrations are portable if you later move to your own Supabase project.
- Magic-link emails require a verified sender domain (e.g. consortium.smartsocietydev.org) — I will guide that setup at step 1; until then invitations use the default sender.
- Custom subdomain is connected at publish time.
- Sensitive keys stay server-side; document downloads use time-limited signed URLs; admin actions are recorded in the audit log.

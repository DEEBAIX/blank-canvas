
CREATE TYPE public.app_role AS ENUM ('super_admin','coordinator','partner_admin','partner_member','reviewer');

-- ORGANIZATIONS
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  short_name text,
  country text NOT NULL DEFAULT '',
  country_code text NOT NULL DEFAULT '',
  pic_number text,
  org_type text,
  website text,
  contact_person text,
  contact_email text,
  phone text,
  expertise text,
  capabilities text,
  previous_projects text,
  target_groups text,
  infrastructure text,
  staff text,
  proposed_contribution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  position text,
  phone text,
  bio text,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES (global)
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

-- PROJECTS
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  programme text,
  abstract text,
  call_url text,
  deadline timestamptz,
  total_budget numeric(14,2),
  status text NOT NULL DEFAULT 'in_preparation',
  coordinator_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.projects TO authenticated;
GRANT ALL ON public.projects TO service_role;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- PROJECT MEMBERS / INVITATIONS
CREATE TABLE public.project_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  email text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  role public.app_role NOT NULL DEFAULT 'partner_member',
  invited_at timestamptz NOT NULL DEFAULT now(),
  joined_at timestamptz,
  UNIQUE (project_id, email)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_members TO authenticated;
GRANT ALL ON public.project_members TO service_role;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Access helpers
CREATE OR REPLACE FUNCTION public.is_project_member(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
      OR EXISTS (SELECT 1 FROM public.project_members m
                 WHERE m.project_id = _project_id AND m.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.can_manage_project(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
      OR EXISTS (SELECT 1 FROM public.project_members m
                 WHERE m.project_id = _project_id AND m.user_id = auth.uid()
                   AND m.role IN ('coordinator','partner_admin'));
$$;

CREATE OR REPLACE FUNCTION public.can_contribute(_project_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
      OR EXISTS (SELECT 1 FROM public.project_members m
                 WHERE m.project_id = _project_id AND m.user_id = auth.uid()
                   AND m.role <> 'reviewer');
$$;

CREATE OR REPLACE FUNCTION public.shares_project_with_org(_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
      OR EXISTS (
        SELECT 1 FROM public.project_members mine
        JOIN public.project_members theirs ON theirs.project_id = mine.project_id
        WHERE mine.user_id = auth.uid() AND theirs.org_id = _org_id);
$$;

-- WORK PACKAGES
CREATE TABLE public.work_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  number int NOT NULL,
  title text NOT NULL,
  objective text,
  lead_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  deliverables text,
  milestones text,
  kpis text,
  start_month int,
  end_month int,
  budget numeric(14,2),
  progress int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.work_packages TO authenticated;
GRANT ALL ON public.work_packages TO service_role;
ALTER TABLE public.work_packages ENABLE ROW LEVEL SECURITY;

-- TASKS
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  wp_id uuid REFERENCES public.work_packages(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  assignee_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  assignee_user_id uuid,
  due_date date,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- IDEAS
CREATE TABLE public.ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id uuid,
  title text NOT NULL,
  body text,
  ai_analysis jsonb,
  status text NOT NULL DEFAULT 'proposed',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ideas TO authenticated;
GRANT ALL ON public.ideas TO service_role;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.idea_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id uuid NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (idea_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.idea_votes TO authenticated;
GRANT ALL ON public.idea_votes TO service_role;
ALTER TABLE public.idea_votes ENABLE ROW LEVEL SECURITY;

-- MESSAGES
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  wp_id uuid REFERENCES public.work_packages(id) ON DELETE CASCADE,
  author_id uuid,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- DOCUMENTS
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  storage_path text NOT NULL,
  size_bytes bigint,
  mime_type text,
  uploaded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- PROPOSAL SECTIONS
CREATE TABLE public.proposal_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  part text NOT NULL,
  section_key text NOT NULL,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'draft',
  position int NOT NULL DEFAULT 0,
  contributed_by uuid,
  contributed_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, section_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.proposal_sections TO authenticated;
GRANT ALL ON public.proposal_sections TO service_role;
ALTER TABLE public.proposal_sections ENABLE ROW LEVEL SECURITY;

-- BUDGET
CREATE TABLE public.budget_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  org_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  wp_id uuid REFERENCES public.work_packages(id) ON DELETE SET NULL,
  category text NOT NULL DEFAULT 'personnel',
  description text,
  amount numeric(14,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.budget_lines TO authenticated;
GRANT ALL ON public.budget_lines TO service_role;
ALTER TABLE public.budget_lines ENABLE ROW LEVEL SECURITY;

-- CALL REQUIREMENTS
CREATE TABLE public.call_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requirement text NOT NULL,
  needed_expertise text,
  best_org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  evidence text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.call_requirements TO authenticated;
GRANT ALL ON public.call_requirements TO service_role;
ALTER TABLE public.call_requirements ENABLE ROW LEVEL SECURITY;

-- EVALUATIONS
CREATE TABLE public.evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'proposal',
  scores jsonb,
  summary text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evaluations TO authenticated;
GRANT ALL ON public.evaluations TO service_role;
ALTER TABLE public.evaluations ENABLE ROW LEVEL SECURITY;

-- AUDIT LOG
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity text,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- POLICIES
CREATE POLICY "profiles_select_self_or_shared" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin')
         OR EXISTS (SELECT 1 FROM public.project_members mine
                    JOIN public.project_members theirs ON theirs.project_id = mine.project_id
                    WHERE mine.user_id = auth.uid() AND theirs.user_id = public.profiles.id));
CREATE POLICY "profiles_insert_self" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "roles_select_self" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "orgs_select_shared" ON public.organizations FOR SELECT TO authenticated
  USING (public.shares_project_with_org(id) OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.org_id = public.organizations.id));
CREATE POLICY "orgs_insert" ON public.organizations FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "orgs_update" ON public.organizations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')
         OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.org_id = public.organizations.id)
         OR EXISTS (SELECT 1 FROM public.project_members m WHERE m.user_id = auth.uid() AND m.role = 'coordinator'));
CREATE POLICY "orgs_delete_admin" ON public.organizations FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "projects_select_member" ON public.projects FOR SELECT TO authenticated USING (public.is_project_member(id));
CREATE POLICY "projects_insert_admin" ON public.projects FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "projects_update_manager" ON public.projects FOR UPDATE TO authenticated USING (public.can_manage_project(id));
CREATE POLICY "projects_delete_admin" ON public.projects FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

CREATE POLICY "members_select" ON public.project_members FOR SELECT TO authenticated USING (public.is_project_member(project_id) OR user_id = auth.uid());
CREATE POLICY "members_insert" ON public.project_members FOR INSERT TO authenticated WITH CHECK (public.can_manage_project(project_id));
CREATE POLICY "members_update" ON public.project_members FOR UPDATE TO authenticated USING (public.can_manage_project(project_id));
CREATE POLICY "members_delete" ON public.project_members FOR DELETE TO authenticated USING (public.can_manage_project(project_id));

CREATE POLICY "wp_select" ON public.work_packages FOR SELECT TO authenticated USING (public.is_project_member(project_id));
CREATE POLICY "wp_write" ON public.work_packages FOR INSERT TO authenticated WITH CHECK (public.can_manage_project(project_id));
CREATE POLICY "wp_update" ON public.work_packages FOR UPDATE TO authenticated USING (public.can_manage_project(project_id));
CREATE POLICY "wp_delete" ON public.work_packages FOR DELETE TO authenticated USING (public.can_manage_project(project_id));

CREATE POLICY "tasks_select" ON public.tasks FOR SELECT TO authenticated USING (public.is_project_member(project_id));
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT TO authenticated WITH CHECK (public.can_contribute(project_id));
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE TO authenticated USING (public.can_contribute(project_id));
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE TO authenticated USING (public.can_manage_project(project_id));

CREATE POLICY "ideas_select" ON public.ideas FOR SELECT TO authenticated USING (public.is_project_member(project_id));
CREATE POLICY "ideas_insert" ON public.ideas FOR INSERT TO authenticated WITH CHECK (public.can_contribute(project_id) AND author_id = auth.uid());
CREATE POLICY "ideas_update" ON public.ideas FOR UPDATE TO authenticated USING (author_id = auth.uid() OR public.can_manage_project(project_id));
CREATE POLICY "ideas_delete" ON public.ideas FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.can_manage_project(project_id));

CREATE POLICY "votes_select" ON public.idea_votes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.ideas i WHERE i.id = idea_id AND public.is_project_member(i.project_id)));
CREATE POLICY "votes_insert" ON public.idea_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.ideas i WHERE i.id = idea_id AND public.can_contribute(i.project_id)));
CREATE POLICY "votes_delete" ON public.idea_votes FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "messages_select" ON public.messages FOR SELECT TO authenticated USING (public.is_project_member(project_id));
CREATE POLICY "messages_insert" ON public.messages FOR INSERT TO authenticated WITH CHECK (public.can_contribute(project_id) AND author_id = auth.uid());
CREATE POLICY "messages_delete" ON public.messages FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.can_manage_project(project_id));

CREATE POLICY "docs_select" ON public.documents FOR SELECT TO authenticated USING (public.is_project_member(project_id));
CREATE POLICY "docs_insert" ON public.documents FOR INSERT TO authenticated WITH CHECK (public.can_contribute(project_id));
CREATE POLICY "docs_update" ON public.documents FOR UPDATE TO authenticated USING (public.can_contribute(project_id));
CREATE POLICY "docs_delete" ON public.documents FOR DELETE TO authenticated USING (uploaded_by = auth.uid() OR public.can_manage_project(project_id));

CREATE POLICY "sections_select" ON public.proposal_sections FOR SELECT TO authenticated USING (public.is_project_member(project_id));
CREATE POLICY "sections_insert" ON public.proposal_sections FOR INSERT TO authenticated WITH CHECK (public.can_contribute(project_id));
CREATE POLICY "sections_update" ON public.proposal_sections FOR UPDATE TO authenticated USING (public.can_contribute(project_id));
CREATE POLICY "sections_delete" ON public.proposal_sections FOR DELETE TO authenticated USING (public.can_manage_project(project_id));

CREATE POLICY "budget_select" ON public.budget_lines FOR SELECT TO authenticated USING (public.is_project_member(project_id));
CREATE POLICY "budget_insert" ON public.budget_lines FOR INSERT TO authenticated WITH CHECK (public.can_manage_project(project_id));
CREATE POLICY "budget_update" ON public.budget_lines FOR UPDATE TO authenticated USING (public.can_manage_project(project_id));
CREATE POLICY "budget_delete" ON public.budget_lines FOR DELETE TO authenticated USING (public.can_manage_project(project_id));

CREATE POLICY "req_select" ON public.call_requirements FOR SELECT TO authenticated USING (public.is_project_member(project_id));
CREATE POLICY "req_insert" ON public.call_requirements FOR INSERT TO authenticated WITH CHECK (public.can_manage_project(project_id));
CREATE POLICY "req_update" ON public.call_requirements FOR UPDATE TO authenticated USING (public.can_manage_project(project_id));
CREATE POLICY "req_delete" ON public.call_requirements FOR DELETE TO authenticated USING (public.can_manage_project(project_id));

CREATE POLICY "eval_select" ON public.evaluations FOR SELECT TO authenticated USING (public.is_project_member(project_id));
CREATE POLICY "eval_insert" ON public.evaluations FOR INSERT TO authenticated WITH CHECK (public.can_manage_project(project_id));
CREATE POLICY "eval_delete" ON public.evaluations FOR DELETE TO authenticated USING (public.can_manage_project(project_id));

CREATE POLICY "audit_select_admin" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'super_admin'));

-- SEED: SSD + first call
INSERT INTO public.organizations (id, name, short_name, country, country_code, org_type, website, contact_person, expertise, proposed_contribution)
VALUES ('11111111-1111-1111-1111-111111111111', 'Smart Society Development MTÜ', 'SSD', 'Estonia', 'EE', 'NGO', 'https://smartsocietydev.org', 'SSD Coordination Team',
        'Digital inclusion, safer internet, digital skills, project coordination, European project management',
        'Coordination, dissemination, awareness activities and stakeholder engagement');

INSERT INTO public.projects (id, code, title, programme, abstract, call_url, deadline, total_budget, coordinator_org_id)
VALUES ('22222222-2222-2222-2222-222222222222',
        'DIGITAL-2026-BESTUSE-10-NETWORKSICs',
        'European Network of Safer Internet Centres',
        'Digital Europe Programme (DIGITAL)',
        'Building and coordinating a strong European consortium for a Safer Internet Centre proposal, combining awareness raising, helplines, hotlines, research and digital infrastructure across member states.',
        'https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home',
        '2026-11-12 17:00:00+00', 4500000, '11111111-1111-1111-1111-111111111111');

INSERT INTO public.work_packages (project_id, number, title, objective, lead_org_id, start_month, end_month)
VALUES
 ('22222222-2222-2222-2222-222222222222',1,'Project Management & Coordination','Ensure sound administrative, financial and quality management of the consortium.','11111111-1111-1111-1111-111111111111',1,36),
 ('22222222-2222-2222-2222-222222222222',2,'Technical Infrastructure & Cybersecurity','Deliver secure, reliable infrastructure for helpline, hotline and platform services.',NULL,1,24),
 ('22222222-2222-2222-2222-222222222222',3,'AI & Digital Platform','Develop the digital platform and AI-supported services for the Safer Internet Centre network.',NULL,3,30),
 ('22222222-2222-2222-2222-222222222222',4,'Awareness & Safer Internet Activities','Deliver awareness campaigns, school programmes and youth participation activities.','11111111-1111-1111-1111-111111111111',4,36),
 ('22222222-2222-2222-2222-222222222222',5,'Research & Evaluation','Evidence base, indicators and independent evaluation of project outcomes.',NULL,2,36),
 ('22222222-2222-2222-2222-222222222222',6,'Communication & Dissemination','Maximise visibility, exploitation and sustainability of project results.','11111111-1111-1111-1111-111111111111',1,36);

INSERT INTO public.proposal_sections (project_id, part, section_key, title, position) VALUES
 ('22222222-2222-2222-2222-222222222222','Excellence','excellence.objectives','Objectives',1),
 ('22222222-2222-2222-2222-222222222222','Excellence','excellence.concept','Concept',2),
 ('22222222-2222-2222-2222-222222222222','Excellence','excellence.methodology','Methodology',3),
 ('22222222-2222-2222-2222-222222222222','Excellence','excellence.innovation','Innovation',4),
 ('22222222-2222-2222-2222-222222222222','Excellence','excellence.sota','State of the Art',5),
 ('22222222-2222-2222-2222-222222222222','Impact','impact.outcomes','Expected Outcomes',6),
 ('22222222-2222-2222-2222-222222222222','Impact','impact.pathways','Impact Pathways',7),
 ('22222222-2222-2222-2222-222222222222','Impact','impact.dissemination','Dissemination & Communication',8),
 ('22222222-2222-2222-2222-222222222222','Impact','impact.exploitation','Exploitation & Sustainability',9),
 ('22222222-2222-2222-2222-222222222222','Implementation','impl.workplan','Work Plan & Work Packages',10),
 ('22222222-2222-2222-2222-222222222222','Implementation','impl.deliverables','Deliverables & Milestones',11),
 ('22222222-2222-2222-2222-222222222222','Implementation','impl.risks','Risks & Mitigation',12),
 ('22222222-2222-2222-2222-222222222222','Implementation','impl.consortium','Consortium & Management Structure',13),
 ('22222222-2222-2222-2222-222222222222','Implementation','impl.resources','Resources & Budget Justification',14);

INSERT INTO public.call_requirements (project_id, requirement, needed_expertise, status) VALUES
 ('22222222-2222-2222-2222-222222222222','National Safer Internet Centre coverage (awareness, helpline, hotline)','SIC operations, child protection','open'),
 ('22222222-2222-2222-2222-222222222222','Secure hotline reporting infrastructure','Cybersecurity, secure systems','open'),
 ('22222222-2222-2222-2222-222222222222','AI-supported content classification','AI / machine learning','open'),
 ('22222222-2222-2222-2222-222222222222','Youth participation and school outreach','Education, youth work','open'),
 ('22222222-2222-2222-2222-222222222222','Independent research and impact evaluation','Academic research, evaluation','open'),
 ('22222222-2222-2222-2222-222222222222','Pan-European dissemination capacity','Communication, EU networks','open');

# Consortium Hub

بناءً على طلبك، قمت بتصميم مخطط هيكلي (Plan) وتدفق عمل (Flow) لمنصة التعاون الخاصة بمشاريع الاتحاد الأوروبي لمنظمتك (Smart Society Development NGO).

 

لقد صممت هذا التصميم ليكون مرئياً، حيث يوضح كيفية انتقال المستخدمين داخل المنصة والبيانات التي سيشاهدونها.

الجزء الأول: الهيكل البصري للمنصة (Visual Platform Plan)

هذا الرسم يوضح الخريطة الذهنية لأقسام المنصة والـ Sub-domain المقترح.

graph TD
    %% The Main Entry Point
    EntryPoint[("Sub-domain: projects.smartsociety.ee")] --> LandingPage

    %% The Landing / Login Page
    subgraph Public_Area [المنطقة العامة / واجهة الدخول]
        LandingPage("صفحة تسجيل الدخول (Login / Magic Link)")
    end

    %% The Main Platform Interface (After Login)
    LandingPage -->|دخول آمن| Dashboard

    subgraph Platform_Core [واجهة المنصة الداخلية - لكل مشروع]
        direction TB
        
        %% Navigation Bar
        Nav[القائمة الرئيسية الجانبية]
        
        %% Core Sections
        Nav --> Overview[1. نظرة عامة على المشروع]
        Nav --> Consortium[2. الشركاء والهيكل]
        Nav --> Workflow[3. سير العمل والمهام]
        Nav --> Workspace[4. مساحة كتابة المقترح]
        Nav --> Budget[5. إدارة الميزانية المقترحة]
        Nav --> Library[6. مكتبة الوثائق]

        %% Details within sections
        Overview --> Over_Details(الاسم, الكود, الملخص, الـ Deadline)
        Consortium --> Cons_Details(رسم شجري للـ Consortium, بيانات الاتصال بالشركاء)
        Workflow --> Work_Details(تقسيم Work Packages, لوحة مهام Kanban)
        Workspace --> Space_Details(مستندات Google Docs مدمجة لكتابة الأجزاء)
        Budget --> Budg_Details(جداول توزيع الميزانية لكل شريك)
        Library --> Lib_Details(قوالب الـ EU الرسمية, وثائق الشركاء PIC)
    end

    %% Styling
    style EntryPoint fill:#f9f,stroke:#333,stroke-width:2px
    style LandingPage fill:#e1f5fe,stroke:#0277bd,stroke-width:2px,rx:10,ry:10
    style Platform_Core fill:#f5f5f5,stroke:#424242,stroke-dasharray: 5 5
    style Nav fill:#fff9c4,stroke:#fbc02d,stroke-width:2px


الجزء الثاني: تدفق عمل المستخدم (User Flow & Logic)

هذا المخطط يوضح السيناريو التقني والعملي لكيفية استخدام المنصة من قبل الشركاء، مع التركيز على فكرتك بعدم استخدام كلمات مرور ثابتة.

sequenceDiagram
    autonumber
    actor Partner as الشريك (Partner)
    participant System as نظام المنصة (Platform)
    participant Admin as فريق Smart Society (Admin)

    Note over Admin, System: مرحلة ما قبل دعوة الشريك

    Admin->>System: إنشاء مشروع جديد (Create New Project)
    Admin->>System: إضافة بيانات الشريك (اسم المؤسسة + الإيميل الرسمي)
    Admin->>System: تحديد صلاحيات الشريك (مثلاً: يمكنه التعديل في WP3)

    Note over Partner, System: محاولة الدخول للمنصة

    Partner->>System: زيارة الرابط: projects.smartsociety.ee
    Partner->>System: إدخال البريد الإلكتروني الرسمي الخاص به
    System-->>Partner: التحقق من وجود الإيميل في المشروع المحدد

    opt إذا كان الإيميل غير مسجل
        System-->>Partner: رسالة خطأ: "غير مصرح لك بالدخول"
    end

    System->>System: توليد "رابط سحري" (Magic Link) صالح لفترة محدودة
    System->>Partner: إرسال الرابط السحري عبر الإيميل (Email Notification)

    Partner->>Partner: فتح الإيميل والضغط على الرابط
    Partner->>System: الدخول المباشر للمنصة (Login Successful)

    Note over Partner, System: العمل داخل المنصة

    activate System
    Partner->>System: استعراض المشروع وملء البيانات المطلوبة منه
    Partner->>System: رفع الوثائق القانونية الخاصة بمؤسسته
    Partner->>System: التعليق أو التعديل في مستندات الـ Proposal المشتركة
    deactivate System

    Note over System, Admin: المتابعة

    System-->>Admin: إشعارات بنشاط الشريك (تحديث وثيقة، إكمال مهمة)

    Note over Partner: انتهاء الجلسة (Session End)

    Partner->>System: تسجيل الخروج أو إغلاق المتصفح
    Note over System: انتهاء صلاحية الرابط السحري تلقائياً (Security)


شرح تفصيلي للـ Plan والـ Flow المقترحين:

نقطة الدخول (EntryPoint): سيكون الرابط هو projects.smartsociety.ee (أو أي اسم sub-domain تختاره).

صفحة الهبوط (Landing Page): هي بوابة الدخول فقط. لا يوجد بها روابط خارجية سوى حقل إدخال البريد الإلكتروني.

التحقق الذكي (Smart Validation): عند إدخال البريد الإلكتروني، يتحقق النظام (Backend) من قاعدة البيانات:

هل هذا الإيميل موجود ضمن قائمة الشركاء لأي مشروع نشط؟

إذا كان الجواب نعم، يتم توليد رابط سحري (Token) ويرسل فوراً لإيميل الشريك. هذا يلغي الحاجة لإدارة كلمات المرور ويضمن أماناً عالياً.

الواجهة الداخلية (Platform Core): بمجرد دخول الشريك عبر الرابط السحري، تفتح له "الداشبورد" الخاصة بمشروعه فقط، بناءً على الصلاحيات التي حددها الـ Admin مسبقاً.

أقسام العمل (Sections): تم تصميم الأقسام لتغطي كافة احتياجات الـ EU Tenders، بدءاً من فهم المشروع (Overview) ومروراً بكيفية العمل (Workflow) ووصولاً للميزانية والوثائق (Budget & Library).

إدارة الدولة (State Management): يفضل استخدام تقنيات الويب الحديثة (مثل React أو Vue) لتكون الصفحة عبارة عن Single Page Application (SPA) لضمان سلاسة التنقل بين الأقسام دون إعادة تحميل الصفحة، مما يعطي انطباعاً احترافياً عالياً للشركاء الأوروبيين.

هذا التصميم يضعكم في مصاف المنظمات الاحترافية التي تدير مشاريع الـ EU بشكل رقمي منظم. هل أنت جاهز للبدء في تطوير هذا الهيكل؟



Role & Context:

You are an expert full-stack developer and UI/UX architect. I want you to build a modern, high-end, and secure B2B collaboration platform for EU Funding Tenders and Grant proposals. 

The platform will be hosted on a subdomain (e.g., projects.smartsociety.ee) for my NGO "Smart Society Development". 

Core Requirements & Features to Build:

1. Authentication & Security (Passwordless Magic Links):

- The landing page should be clean and professional (Minimalist SaaS look), featuring only a secure login input field for email.

- The system must check if the entered email belongs to an active partner in our database. If valid, it sends a temporary "Magic Link" to their email (no static passwords required).

- Session expiration and project-based access control (partners can ONLY see and access the specific projects and sections they are assigned to).

2. Multi-Project & Partner Country Database Integration:

- Support multiple EU funding projects dynamically.

- Each partner profile linked to a project must include their organization name, PIC number, and a distinct country flag/code indicator next to their name in the database and UI to easily track international consortium members (e.g., Estonia, France, Germany, etc.).

3. Core Internal Platform Sections (Dashboard & Navigation):

- Project Overview: Project title, EU Call ID, official link, abstract, and a live deadline countdown timer.

- Consortium & Hierarchy: Interactive structural view of the consortium, showing the Coordinator vs. Partners, with contact details and country tags.

- Workflow & Kanban Board: Task allocation system split into Work Packages (WPs) to track progress transparently among partners.

- AI-Assisted Proposal Workspace: A collaborative workspace where partners can contribute text, data, and notes for each proposal section (Excellence, Impact, Implementation).

- Budget & Financial Planner: Clean financial tables to distribute the budget allocation transparently across consortium partners.

- Document Library: Centralized repository for official EU templates, guidelines, and partner legal documents.

4. Publishing & Final Proposal Generation Feature:

- Include a "Publish / Compile Proposal" feature. Once all partners upload their respective documents, data, and inputs, the system should aggregate everything into a structured format/preview so the team can read, review, and export the final cohesive EU proposal before submission.

5. UI/UX Design Guidelines:

- Modern, clean, and corporate SaaS aesthetic (Tailwind CSS, professional fonts, responsive layout, dark/light mode friendly).

- Smooth transitions and a Single Page Application (SPA) feel for effortless navigation between project tabs.

Please design and generate the full frontend and database architecture logic for this platform starting with the database schema and the landing/login workflow.





أرسلت لك ما أريد منك بالضبط أن تقوم به الآن. إن شئت، أنا سأأصل Subbase خاصة بي لاحقًا حينما تقوم الآن بجمع كل الـ data والتصميم وكذا، وسنرفعه لاحقًا على الـ Subbase. آآآ، مبدئيًا أريد منك تصميم كل هذا الـ plan كاملًا. آآآ، أريد منك أيضًا، يعني، آآآ، أعطائي أفكار معينة. أنت تعرف مثلًا بالـ EU funding كيف تكون هي الشراكة، اسم الموضوع، الـ description، الـ balance sheet، الأمور بها. أريد أن تكون لي أنا admin panel خاصة، ولكل شخص معي أرسل له وكـ customer. يعني هناك dashboard للـ customers، ولكن هناك أيضًا للـ coordinator. الفاقت أن الـ coordinator يمكنه أن يكتب الـ proposal أو يعني يكون له إضافات، يعني، آآآ، أزيد بشوي بهذا الموضوع. يعني عندنا ثلاثة user admin panel الخاصة لي وجميع الـ user الآخرين الـ-الذين يدخلون معي. وأيضًا هنالك، آآآ، users مثلهم ولكن يكون coordinator، آآآ، عنده بعض الـ tools الـ AI ممكن أن يستخدمها بشكل عام. هذا ما أريده بهذه المنصة. آآآ، أريد منك أن تكون احترافية شكل EU funding، آآآ، شكل يدل على، على المهارة، على الـ-على الأسلوب الحديث، على طريقة الـ، آآآ، الجدية بالموضوع، على أعطاهم طابع بأن هذه الجمعية هي احترافية. أيضًا سأرسل لك أنا، آآآ، شعار Smart Social Developments، آآآ، أن تستخدمه أيضًا، آآآ، بهذا الأسلوب، وتكون هذه المنصة يعني هي، آآآ، منصة الـ، آآآ، يعني الـ concentrum الـ ما بيننا، آآآ، وبين الجميع. حتى الرسم الشكلي، الـ diagram يكون احترافي. آآآ، الأمور تعمل على الـ Android، على الـ desktop، آآآ، حتى يعني أمور جيدة بهذا الموضوع.



Example 

Project Workspace

وفيه:

DIGITAL-2026-BESTUSE-10-NETWORKSICs



├── Call Analysis

├── Consortium

├── Partner Profiles

├── Roles & Responsibilities

├── Work Packages

├── Ideas

├── Chat

├── Documents

├── AI Assistant

├── Proposal





└── Evaluation



Consortium Platform — Smart Society Development NGO



Build a secure, professional web platform under:



consortium.smartsocietydev.org



The platform will be an independent Consortium Collaboration & EU Proposal Development Workspace operated by Smart Society Development NGO (SSD), Estonia.



It must be technically separated from the main NGO website and database.



1. Architecture



Create this as an independent application:



- Separate GitHub repository

- Separate Supabase project/database

- Separate Supabase Authentication

- Separate Storage

- Separate environment variables and API keys

- Independent deployment

- Subdomain: "consortium.smartsocietydev.org"



The platform should not share the main NGO database or authentication system.



Security and data isolation are critical because the platform will contain confidential consortium discussions, proposal drafts, partner information, budgets and documents.



Use Supabase Row Level Security (RLS) so that users can only access organizations, projects, documents, chats and data they are authorized to access.



2. Main Concept



The platform is a Consortium Operating System for European Funding Proposals.



It should support the complete process:



EU Call → Consortium → Partner Mapping → Roles → Ideas → Work Packages → Proposal → AI Review → Final Submission



The first real use case will be:



DIGITAL-2026-BESTUSE-10-NETWORKSICs — Safer Internet Centres



SSD is currently forming a consortium for this call and already has several interested partners.



3. Main Dashboard



Create a modern professional dashboard showing:



- Active Projects

- Consortium Members

- Proposal Progress

- Work Packages

- Open Tasks

- Documents

- Recent Discussions

- AI Recommendations

- Proposal Readiness Score



Example:



Proposal Progress: 64%



Excellence — 85%

Impact — 62%

Implementation — 48%

Budget — 75%



Also display AI alerts such as:



- Missing call requirement

- Missing responsible partner

- Missing KPI

- Weak impact section

- Missing technical expertise

- Incomplete Work Package



4. Project Workspace



Each EU Call becomes an independent Project Workspace.



Example:



DIGITAL-2026-BESTUSE-10-NETWORKSICs



Inside each project:



- Call Analysis

- Consortium

- Partner Profiles

- Roles & Responsibilities

- Work Packages

- Tasks

- Ideas

- Chat

- Documents

- Proposal Builder

- AI Assistant

- Evaluation

- Budget

- Timeline



Users must only see projects to which they have been invited.



5. Partner Management



Each partner should have a profile containing:



- Organization name

- Country

- Contact person

- Email

- Website

- Expertise

- Technical capabilities

- Previous projects

- Relevant experience

- Target groups

- Infrastructure

- Available staff

- Proposed contribution

- Assigned Work Packages

- Assigned Tasks



The system should allow the Coordinator to invite partners by email.



6. Partner-to-Call Matching



AI should analyze the Call requirements and compare them with partner profiles.



Create a matrix:



Call Requirement → Required Expertise → Best Partner → Evidence → Status



The AI should identify:



- Strengths

- Missing expertise

- Consortium gaps

- Duplicate capabilities

- Geographic gaps

- Technical gaps

- Management gaps



7. Consortium Structure



Create a visual organization/role chart.



Example:



Coordinator

↓

WP1 Project Management

WP2 Technical Infrastructure & Cybersecurity

WP3 AI / Digital Platform

WP4 Awareness & Safer Internet Activities

WP5 Research & Evaluation

WP6 Communication & Dissemination



Each Work Package must have:



- Leader

- Partners

- Tasks

- Objectives

- Deliverables

- Milestones

- KPIs

- Timeline

- Budget



Allow drag-and-drop assignment of partners to WPs and Tasks.



8. Consortium Chat



Create project-level communication.



Include:



- General Project Chat

- Work Package Chat

- Task Chat

- Direct messages

- File attachments

- Mentions

- Notifications

- Search

- AI-generated meeting/discussion summaries



The AI should understand the project context and previous discussions.



9. Idea Lab



Partners can submit ideas.



For each idea, AI should analyze:



- Relevance to the Call

- Innovation

- Feasibility

- Expected Impact

- Strengths

- Weaknesses

- Risks

- Suggested improvements

- Appropriate Work Package

- Possible KPIs



Partners can vote/comment on ideas.



10. AI Consortium Assistant



The AI should act as an AI Project Officer, not just a generic chatbot.



It should have access only to the authorized project context:



- Call documents

- Partner profiles

- Consortium structure

- Work Packages

- Tasks

- Discussions

- Ideas

- Documents

- Proposal drafts



It should answer questions such as:



"Who is responsible for cybersecurity?"



"What are the current consortium gaps?"



"Which partner should lead WP3?"



"What requirements of the Call are not yet addressed?"



"Which sections of the proposal are incomplete?"



"Summarize our last consortium meeting."



"Create a list of actions for each partner."



11. Proposal Builder



Create a structured EU proposal editor.



Sections should include:



Excellence



- Objectives

- Concept

- Methodology

- Innovation

- State of the Art



Impact



- Expected Outcomes

- Impact Pathways

- Dissemination

- Communication

- Exploitation

- Sustainability



Implementation



- Work Packages

- Tasks

- Deliverables

- Milestones

- KPIs

- Risks

- Resources

- Consortium Management



The AI can generate drafts, but users must be able to edit everything manually.



Every section should show which partner contributed to it.



12. AI Proposal Evaluation



After creating a draft, provide:



AI Evaluator Mode



The AI should simulate an EU proposal evaluator and identify:



- Strengths

- Weaknesses

- Missing requirements

- Contradictions

- Weak methodology

- Weak impact

- Weak KPIs

- Weak consortium justification

- Missing evidence



Provide estimated scores for:



- Excellence

- Impact

- Quality and efficiency of implementation



And provide concrete recommendations for improvement.



13. Consortium Health Score



Create a dynamic score from 0–100:



- Call Alignment

- Partner Complementarity

- Technical Capacity

- Geographic Coverage

- Coordinator Capacity

- Impact Capacity

- Proposal Completeness

- Implementation Readiness



Example:



Consortium Readiness: 74/100



Show exactly why the score is not higher and what actions are required.



14. Roles



At minimum support:



Super Admin



SSD platform administrator.



Coordinator



Manages the project and consortium.



Partner Admin



Manages the organization's participation.



Partner Member



Works on assigned tasks and proposal sections.



Reviewer



Can review and comment without full editing rights.



Use strict permission controls and database-level RLS.



15. Security



Security is a major requirement.



Implement:



- Supabase RLS

- Project-level access control

- Organization-level isolation

- Secure authentication

- Protected file storage

- Server-side API keys

- No sensitive API keys in frontend code

- Audit logs

- Secure document access

- Role-based permissions

- Input validation

- Rate limiting where appropriate



A compromise of this platform must not expose the main NGO website/database.



16. MVP Priority



Do NOT attempt to build every feature immediately.



First build a working MVP with:



1. Authentication

2. Dashboard

3. Projects

4. Partner Profiles

5. Consortium Management

6. Roles & Responsibilities

7. Work Packages

8. Project Chat

9. Documents

10. Call Analysis

11. AI Assistant

12. Proposal Builder

13. AI Evaluation



The architecture must be designed so that additional features can be added later.



17. First Real Project



Use this project as the initial test:



DIGITAL-2026-BESTUSE-10-NETWORKSICs



Project objective:



Build and coordinate a strong European consortium for a Safer Internet Centre proposal.



SSD Smart Society Development MTÜ will initially act as the potential Coordinator, subject to consortium agreement and eligibility verification.



The platform should help transform interested partners into a structured, proposal-ready consortium.



18. Product Vision



This is not simply a document editor.



The long-term vision is:



"A Consortium Operating System for European Funding."



The workflow should eventually become:



Discover Call → Analyze Call → Find Partners → Build Consortium → Match Expertise → Assign Roles → Develop Ideas → Build Work Packages → Write Proposal → AI Evaluation → Final Submission



Design the UI and database architecture with this long-term vision in mind while keeping the first version focused and practical.



The interface should be modern, professional, trustworthy and suitable for NGOs, universities, research organizations, SMEs and European project partners.

أرسلت لك اثنين prompt، واحدة من Gemini أولًا، والثانية من ChatGPT. عليك قراءتهما أيضًا والأفكار التي أعطيتك أنا إياها، وأن تخرج بـ plan موحد لهذه الـ platform كيف ستكون.

لك Logo تبع Smart Source Development نستخدمه أيضًا. آآآ، أريد الـ-الكتابة بطريقة professional، أآآ، أسلوب، كل هذه الأمور أنت أخذها بعين الاعتبار كـ European. آآآ، اللغة المستخدمة هي اللغة الإنجليزية فقط. آآآ، ممكن نضيف لاحقًا لغات، مثلًا الآن هي اللغة الإنجليزية فقط. آآآ، دـ-- يعني كل partner اللي يكون له أصلًا صفحة لنعرف عنه، يعبئها، هي مثلًا اسمه، الـ email، المنصب المسؤول، رقم الهاتف، يعني كل هاي الأمور أيضًا الـ-الـ-الذين يدخلون في هذا consortium نعرف عنهم، وأيضًا لديهم أيضًا صفحة لـ، آآآ، يقولوا ما الذي يمكن أن أفعله حتى تظهر في الـ proposal يعني كـ idea لهم. كل هذه الأمور. دعنا نبني هذا الـ plan الموسع لأقول لك إذا سنبدأ أم لا. شكرًا.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f80c7ec6-64af-4dc4-bb7f-69c09c053002).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

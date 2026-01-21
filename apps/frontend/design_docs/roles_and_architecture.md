# Everleap: Roles, Architecture & Screen Definitions

## 1. Role Definitions

The system is divided into two distinct planes: **Platform Management** (Everleap) and **Organization Operations** (Client).

### A. Everleap Superadmin (Platform Owner)
*   **Persona:** Internal Everleap staff / Founder.
*   **Responsibility:** "God mode" for the platform.
*   **Key Capabilities:**
    *   **Tenant Management:** Onboard new companies (Clients), suspend access.
    *   **Billing & Plans:** rigorous control over subscription tiers and usage limits (e.g., "5 Active Jobs limit").
    *   **Global Configuration:** Manage AI model providers, global API keys, and maintenance mode.
    *   **Support:** Login-as-user to debug client issues.

### B. Organization Admin (IT / Owner)
*   **Persona:** CTO, IT Manager, or Founder.
*   **Responsibility:** Infrastructure, Billing, and Access Control.
*   **Key Capabilities:**
    *   **Billing & Plans:** Manage credit cards, invoices, and subscription tiers.
    *   **User Management:** Invite users, assign roles (e.g., promote someone to HR Admin).
    *   **Global Integrations:** Connect SSO (Okta), Slack, Email providers.
    *   **Restrictions:** *Cannot* see private candidate data (salary, feedback) by default unless verified.

### C. Head of Recruiting (HR Admin)
*   **Persona:** Head of Talent, Chief People Officer.
*   **Responsibility:** Strategy and Execution of Hiring.
*   **Key Capabilities:**
    *   **Hiring Execution:** Full control over Jobs, Candidates, and Interviews.
    *   **Approvals:** Final sign-off on JDs and Offers.
    *   **Team Ops:** Invite Recruiters and Hiring Managers to specific jobs.
    *   **Restrictions:** Cannot delete the organization or change the billing plan.

---

## 2. High-Level Architecture (Multi-Tenant)

### Tenant Isolation Strategy
*   **Organization ID (`org_id`):** The primary key for isolation. Every `Role`, `Candidate`, and `Interview` is strict-scoped to an `org_id`.
*   **User Mapping:** Users belong to an `Organization`.
    *   `Superadmin` belongs to `Everleap System Org` (special ID).

### Data Model (Simplified)
*   **Organizations Table:** `id, name, plan_tier, billing_status`
*   **Users Table:** `id, org_id, role (SUPER_ADMIN | ORG_ADMIN), email`
*   **Jobs Table:** `id, org_id, status, ...`

---

## 3. Detailed Screen Hierarchy

### I. Superadmin Console (The "Control Tower")
*Access: Superadmin Only*

1.  **Global Dashboard**
    *   Total Active Clients
    *   Total Jobs Running (Platform-wide load)
    *   Recent Signups / MRR
2.  **Client Management**
    *   **List View:** All registered companies (Status: Active/Trial/Suspended).
    *   **Create Client:** Form to provision a new tenant (Name, Admin Email, Plan).
    *   **Client Detail:** View usage, force-set plan, "Login as this Org Admin".
3.  **Platform Settings**
    *   LLM Configuration (OpenAI/Anthropic keys).
    *   Feature Flags (Enable "Beta" agents for specific clients).

### II. Organization App (The "Product")
*Access: Org Admin*

1.  **Hiring Dashboard (Home)**
    *   Overview of *My Company's* hiring funnel.
    *   "Action Items" (Approvals needed).
2.  **Hiring (Job Management)**
    *   **Create Role Flow:** The Agentic conversational UI.
    *   **Role Detail:**
        *   *Tab 1: Setup:* JD, Screening Questions (Editable).
        *   *Tab 2: Candidates:* Kanban/List of applicants.
        *   *Tab 3: Smart Search:* Agent activity log ("Sourced 50 profiles from LinkedIn").
3.  **Candidate Database**
    *   All candidates across all jobs (Talent Pool).
4.  **Settings**
    *   **Company Profile:** Upload Logo, Career Page URL.
    *   **Team:** Invite other users (if enabled).
    *   **Integrations:** Connect Google Calendar (for interviews), Slack.
    *   **Billing:** View invoices, update credit card.

---

## 4. User Flow Design

### Onboarding a New Client (Superadmin Flow)
1.  Superadmin logs in → Goes to "Clients".
2.  Clicks "Add Client" → Enters "Acme Corp" & "jane@acme.com".
3.  System creates `org_id: acme_01` and sends invite email to Jane.
4.  Jane clicks link → Sets Password → Lands on **Org App > Hiring Dashboard**.

### Daily Workflow (Org Admin Flow)
1.  Org Admin logs in.
2.  **Dashboard:** Sees "3 Candidates waiting for review for Senior React Role".
3.  **Review:** Clicks item → Opens Candidate Review screen.
4.  **Decision:** Clicks "Approve for Interview".
5.  **Agent Action:** System takes over, emailing candidate to schedule.

---

---

## 5. Information Architecture & Navigation (Sitemap)

The application navigation changes dynamically based on the user's role.

### A. Superadmin (Platform Console)
*   **Overview**: High-level system health (MRR, Active Orgs).
*   **Clients**: List of Tenants, Onboarding, Plan Management.
*   **Platform Jobs**: debugging view of all active agents/jobs.
*   **Users**: Global user lookup for support.
*   **Settings**: LLM Keys, Feature Flags.

### B. Org Admin (The "IT & Ops" View)
*This role is focused on management, not hiring.*
*   **Organization**:
    *   **Employees**: Manage system access, invite HR Admins.
    *   **Billing & Plans**: Invoices, Credit Card, Subscription Tier.
    *   **Settings**: SSO, Slack Integration, Company Details.
*   **Reports**: Usage reports (Credits used, Storage).

### C. HR Admin (The "Recruiting" View)
*This role is focused on the hiring workflow.*
*   **Dashboard**: Funnel overview, Action items.
*   **Hiring**:
    *   **Jobs**: Create/Manage Roles.
    *   **Candidates**: Talent pool, Search.
*   **Pipeline**:
    *   **Interviews**: Calendar, Feedback collection.
    *   **Offers**: Generation & Approvals.
    *   **Onboarding**: Pre-boarding workflows.
*   **Management**:
    *   **Reports**: Time-to-hire, Source quality, Pipeline health.
    *   **Settings**: Hiring Templates, Email config, Career Page.
    *   **Employees**: (Limited view) Invite hiring managers.

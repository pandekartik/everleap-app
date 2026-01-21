# Implementation Plan - Everleap Hiring Dashboard & Agentic Flows

# Goal Description
Implement the **Hiring Dashboard** and the initial **"Create Role" Agentic Flow** based on the approved UX Research and provided Visual Design.
The implementation must strictly adhere to the existing **Everleap Design System** (`@everleap/design-system`), utilizing existing design tokens and Shadcn-compatible components to ensure visual consistency.

## User Review Required
> [!IMPORTANT]
> **Design System Usage**: All UI components will be imported from `@everleap/design-system/components/ui`. No local component forks will be created unless absolutely necessary for unique agentic behaviors.

> [!NOTE]
> **Mock Data**: Since we are focusing on Frontend flows, we will create robust mock data generators & TypeScript interfaces to simulate the "Agent" responses (e.g., generating JDs instantly).

## Proposed Changes

### 1. Project Structure & Layout
Establish the core shell for the secure app area.

#### [NEW] `apps/frontend/components/layout/Sidebar.tsx`
*   Implement the Sidebar navigation as per the UX Research.
*   Items: Dashboard, Hiring (Active), Candidates, Interviews, Offers, Onboarding, Employees, Reports, Settings.
*   Component: Use `ui/button` (ghost variant) + `lucide-react` icons.

#### [NEW] `apps/frontend/components/layout/Shell.tsx`
*   A wrapper layout component that includes the Sidebar and the Main Content Area.
*   Background: `bg-background` (white/slate-950).

### 2. Hiring Dashboard (The "Manager view")

#### [NEW] `apps/frontend/app/hiring/page.tsx`
*   The main entry point for the "Hiring" tab.
*   Layout: Header (Title "Hiring" + Tabs + Search + Create Button), Stats Row, Main Table.

#### [NEW] `apps/frontend/components/hiring/StatsRow.tsx`
*   Displays the high-level metrics as seen in the reference design.
*   Uses `ui/card` for the container.
*   Metrics: `Total Roles`, `Open Roles`, `Closed Roles`, `Action Items`.

#### [NEW] `apps/frontend/components/hiring/RolesTable.tsx`
*   The central piece of this view.
*   Uses `ui/table` components (`TableHeader`, `TableRow`, `TableCell`).
*   **Columns**:
    *   Role ID (e.g., TR-817)
    *   Role Name (Bold text)
    *   Department
    *   Location
    *   Created (Date + Creator Avatar) -> Uses `ui/avatar`
    *   Candidates (Count)
    *   Status (Badge)
    *   Actions (Edit/View Icons)

#### [NEW] `apps/frontend/components/hiring/StatusBadge.tsx`
*   A reusable badge component mapping internal statuses to Design System colors.
*   `OPEN` -> `ui/badge` (variant: success/green)
*   `CLOSED` -> `ui/badge` (variant: outline/neutral)
*   `IN_PROGRESS` -> `ui/badge` (variant: warning/amber)
*   `DRAFT` -> `ui/badge` (variant: secondary)

### 3. The "Create Role" Agentic Flow
This is the "Magical Moment" described in the research.

#### [NEW] `apps/frontend/components/hiring/CreateRoleDialog.tsx`
*   Triggered by the top-right "Create Role" button.
*   Uses `ui/dialog` (or `ui/sheet` for complex flows - UX Research suggests a conversational start).
*   **Step 1: Intent**: Simple `ui/textarea` where user types "Hire a Senior React Engineer in London".
*   **Step 2: Agent Working**: A custom "Thinking" animation (utilizing `lucide-react` loader or simple CSS pulse).
*   **Step 3: Draft Review**: A card showing the Agent's proposed Job Description.

### 4. Data Layer (Mocks)

#### [NEW] `apps/frontend/lib/mock-data.ts`
*   `Role` interface: `id, title, department, location, createdAt, createdBy, status, candidateCount`.
*   `generateMockRoles(count: number)`: Helper to populate the table.

## Verification Plan

### Automated Tests
*   Verify that `Hiring` page renders without runtime errors.
*   Verify that all `ui/*` imports are resolved correctly from the design system package.

### Manual Verification
1.  **Navigation**: Click through Sidebar items (should update URL/highlight).
2.  **Visual Match**: Compare `RolesTable` against the provided reference image (spacing, typography, badges).
3.  **Interaction**: Click "Create Role" -> Type intent -> Verify that the "Thinking" state appears.

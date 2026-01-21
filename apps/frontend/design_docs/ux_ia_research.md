# Everleap: Information Architecture & UX Patterns

## 1. Core Philosophy: "The Invisible Hand"
The core UX principle of Everleap is that **the user manages the Manager, not the task**.
The user is the "Director" and the AI is the "Execution Team".

*   **Current Paradigm (ATS):** User clicks "Post Job" -> User fills form -> User clicks "Add Candidate" -> User writes email.
*   **Everleap Paradigm:** User says "Hire a React Dev" -> AI drafts JD -> AI posts job -> AI screens resumes -> User approves top 3.

## 2. Information Architecture (Site Map)

### Global Navigation (Sidebar)
The navigation is flattened to prioritize *active execution* over static records.

*   **Dashboard** (Command Center)
    *   High-level metrics (Time to hire, Active pipelines)
    *   "Action Items" (The most important section: Approvals waiting for you)
    *   Live Agent Activity Feed (Scrolling ticker of what AI is doing right now)
*   **Hiring (Roles)**
    *   Active Roles List (Kanban or List view of open positions)
    *   *Drafts / Paused*
*   **Candidates** (Talent Pool)
    *   Unified inbox of all active candidates across all roles.
    *   Filter by: "Needs Review", "Interviewing", "Offer Stage".
*   **Interviews**
    *   Calendar view of scheduled interviews.
    *   "To Schedule" list (Exceptions where AI couldn't auto-schedule).
*   **Offers & Onboarding**
    *   Offers currently out.
    *   Onboarding checklist progress.
*   **Settings / Organization**
    *   Team members & Permissions.
    *   Integration settings (Gmail, Slack, etc).

## 3. Key UX Flows

### Flow A: Creating a Role ("The Agent Hand-off")
**Goal:** Create a reliable job description and meaningful screening criteria with minimal effort.

1.  **Trigger:** User clicks "New Hire".
2.  **Input (Conversational & Form):**
    *   User inputs basic data: "Senior Product Manager, Remote, $140k-160k".
    *   **Magical Moment:** AI immediately generates a *Draft Strategy* card.
        *   "I'll search for candidates with B2B SaaS experience."
        *   "I've drafted a JD emphasizing 'Product-Led Growth'."
3.  **Refinement:** User tweaks the generated JD and Screening Questions.
4.  **Activation:** User clicks "Start Hiring".
    *   UI State changes to "Actively Sourcing".
    *   Status indicator: "AI is posting to LinkedIn..." -> "AI is searching GitHub..."

### Flow B: Candidate Evaluation ("The Human Checkpoint")
**Goal:** High-velocity review. The AI filters noise; user makes the final call.

1.  **Notification:** "5 new high-match candidates for Senior PM."
2.  **Review Interface (Tinder-for-Recruiting style fast review):**
    *   **Split Screen:** Resume on left (or overlay), AI Analysis on right.
    *   **AI Analysis Card:**
        *   "Match Score: 92/100"
        *   "Why: Strong B2B experience, 5 years tenure at last role."
        *   "Flag: No direct mention of SQL, but has 'Data Analysis' skill."
3.  **Action:**
    *   **Advance:** "Schedule Screen" (AI takes over scheduling).
    *   **Reject:** "Send polite rejection" (AI drafts, sends after delay).
    *   **Maybe:** "Ask specific question" (AI emails candidate a screening question).

### Flow C: The "Human-in-the-Loop" Approval Queue
**Goal:** Prevent AI form going rogue while maintaining speed.

**The "Pending Approval" UI Pattern:**
Any irreversible action (sending an offer, posting a public job, rejection emails) enters a "Pending" state.
*   **Visuals:** A dedicated persistent "Inbox" or "Approvals" widget in the top right or on the dashboard.
*   **Batch Actions:** "34 Rejection Emails generated. [View All] [Approve All]"
*   **Timeout (Optional):** "Sending in 24 hours unless paused" (for lower risk actions).

## 4. Specific UI Components (The "Agentic" Feel)

### 1. The "Working" Indicator
Don't just show a spinner. Show text explaining the intent.
*   *Bad:* "Loading..."
*   *Good:* "Reading resume...", "Checking calendar availability...", "Drafting email..."

### 2. The Decision Confidence Score
When AI presents a decision or candidate:
*   **High Confidence (>90%):** Green badge. "Highly recommended."
*   **Low Confidence (<70%):** Yellow/Amber badge. "Needs human review. Unclear work history."

### 3. The "Why?" Tooltip
Every AI action must have an explainability layer.
*   "Why is this candidate ranked #1?" -> Hover -> "100% keyword match + worked at Competitor X."

## 5. Visual Style Direction
*   **Clean, Enterprise, Calm:** Lots of whitespace. Not "futuristic cyberpunk", but "reliable Swiss design".
*   **Status Colors:**
    *   Blue/Purple: AI processing.
    *   Amber: Waiting for User (Blocked).
    *   Green: Success / Done.

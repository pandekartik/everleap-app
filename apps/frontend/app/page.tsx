import { Button, Badge } from "@everleap/design-system";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeatureGrid } from "@/components/landing/FeatureGrid";
// ContentBlock removed
import { PlaceholderBox } from "@/components/landing/PlaceholderBox";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { ScrollStepper } from "@/components/landing/ScrollSteps";
import { DemoRequestModal } from "@/components/landing/DemoRequestModal";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-teal-100 selection:text-teal-900">
            <LandingNavbar />

            <main>
                <HeroSection />

                {/* Section 2: The System - Orientation Layer (Bento Grid Style) */}
                <section id="features" className="py-24 bg-slate-50 border-y border-slate-100 scroll-mt-24">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <SectionHeader
                            title="A system of AI agents, working together"
                            description="Hiring intent triggers a coordinated swarm of AI agents. Each agent handles a specialized part of the workflow. Humans approve decisions at key checkpoints."
                            centered
                        />

                        <FeatureGrid
                            features={[
                                { icon: "Target", title: "Intent & Setup", description: "You define the role, location, and constraints. We handle the rest." },
                                { icon: "Robot", title: "Agent Swarm", description: "Specialized agents for writing, screening, and scheduling collaborate." },
                                { icon: "UserCheck", title: "Human Review", description: "You approve key decisions. AI executes the repetitive work." },
                                { icon: "FileText", title: "Deliverables", description: "Market-ready JDs, ranked candidates, and offer letters." }
                            ]}
                        />
                    </div>
                </section>

                {/* Section 3: Creation & Publishing Flow (Stepper) */}
                <ScrollStepper
                    id="how-it-works"
                    steps={[
                        {
                            id: "step-1",
                            badge: "Step 1",
                            title: "Describe who you want to hire",
                            description: "Everleap handles the rest. Just define the basics.",
                            checklist: [
                                "Role creation with skills & experience requirements",
                                "Location preferences and work arrangement",
                                "Salary range and compensation structure",
                                "Compliance notes and hiring constraints"
                            ],
                            icon: "FileText",
                            placeholderLabel: "Job Requisition Form",
                            screenshot: "/screenshots/job-creation-form.png"
                        },
                        {
                            id: "step-2",
                            badge: "Step 2",
                            title: "From intent to market-ready job descriptions",
                            description: "In minutes, not hours. Our agents research the market and write the perfect JD.",
                            checklist: [
                                "Market research on salary and role demand",
                                "Auto-generated, competitive job descriptions",
                                "Edit and approve before publishing"
                            ],
                            icon: "Sparkles",
                            placeholderLabel: "AI-Generated Job Description",
                            screenshot: "/screenshots/ai-generated-jd.png"
                        },
                        {
                            id: "step-3",
                            badge: "Step 3",
                            title: "Jobs go live without manual posting",
                            description: "Automated distribution to LinkedIn, careers pages, and job boards.",
                            checklist: [
                                "LinkedIn job posting integration",
                                "Application link generation",
                                "Real-time posting status tracking"
                            ],
                            icon: "Globe",
                            placeholderLabel: "Job Publishing Dashboard",
                            screenshot: "/screenshots/job-publishing-success.png"
                        },
                        {
                            id: "step-4",
                            badge: "Step 4",
                            title: "A clean, structured experience for every candidate",
                            description: "Professional application flow from first impression.",
                            checklist: [
                                "Simple, professional application forms",
                                "Resume and document upload",
                                "Custom screening questions"
                            ],
                            icon: "Users",
                            placeholderLabel: "Candidate Application Page"
                        }
                    ]}
                />

                {/* Section 7: AI Screening (Core Feature) - Darker/Highlighted Background */}
                <section className="py-24 bg-slate-900 text-white">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <SectionHeader
                            badge="Core Feature"
                            title={<span>AI evaluates candidates objectively.<br />Humans make the call.</span>}
                            description="Every resume is parsed, analyzed, and scored against your requirements. You see the best candidates first, with full AI reasoning."
                            centered
                            dark
                        />

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                                <img
                                    src="/screenshots/candidate-list.png"
                                    alt="Candidate List with AI Scores"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-slate-700 shadow-xl">
                                <img
                                    src="/screenshots/candidate-detail-ai.png"
                                    alt="Candidate Detail with AI Analysis"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </section>


                {/* Pipeline & Decisions (Second Stepper Group) */}
                <ScrollStepper
                    steps={[
                        {
                            id: "step-6",
                            badge: "Step 6",
                            title: "Stay in control of every hiring decision",
                            description: "Move candidates through stages, update statuses, and override AI recommendations whenever needed.",
                            checklist: [
                                "Visual pipeline with drag-and-drop stages",
                                "Status updates and candidate notes",
                                "Manual overrides on AI decisions"
                            ],
                            icon: "Workflow",
                            placeholderLabel: "Candidate Pipeline View"
                        },
                        {
                            id: "step-7",
                            badge: "Step 7",
                            title: "From shortlist to conversation",
                            description: "Automated scheduling and communication keep the process moving without the back-and-forth.",
                            checklist: [
                                "Interview scheduling with availability matching",
                                "Automated candidate communication",
                                "Interview status tracking and timeline"
                            ],
                            icon: "Calendar",
                            placeholderLabel: "Interview Scheduling"
                        },
                        {
                            id: "step-8",
                            badge: "Step 8",
                            title: "Hiring doesn't stop at 'yes'",
                            description: "Everleap carries it forward to a successful first day.",
                            checklist: [
                                "Automated offer letter generation",
                                "Document collection and verification",
                                "Onboarding checklists and task tracking"
                            ],
                            icon: "FileSignature",
                            placeholderLabel: "Offer Letter & Onboarding"
                        },
                        {
                            id: "step-bonus",
                            badge: "Beyond Hiring",
                            title: "Built to support teams beyond the hire",
                            description: "Everleap extends into ongoing HR operations and employee support.",
                            checklist: [
                                "HR query management and routing",
                                "Post-onboarding workflow automation",
                                "Long-term employee lifecycle support"
                            ],
                            icon: "MessageSquare",
                            placeholderLabel: "HR Query Management"
                        }
                    ]}
                />

                {/* Human in the Loop Declaration */}
                <section id="philosophy" className="py-32 bg-teal-900 relative overflow-hidden">
                    {/* ... content ... */}
                </section>

                {/* Final CTA */}
                <section className="py-32 text-center bg-white">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-8 md:text-5xl">
                            Ready to see autonomous hiring<br className="hidden sm:block" /> in action?
                        </h2>
                        <div className="flex justify-center gap-4">
                            <DemoRequestModal>
                                <Button size="lg" className="h-14 px-10 text-lg rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-xl shadow-teal-900/10">Request a demo</Button>
                            </DemoRequestModal>
                        </div>
                    </div>
                </section>
            </main>

            <LandingFooter />
        </div>
    );
}

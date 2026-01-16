import { Button, Badge } from "@everleap/design-system";
import Link from "next/link";
import {
    ArrowRight,
    Check,
    Bot,
    FileText,
    Globe,
    UserCheck,
    ShieldCheck,
    Users,
    Briefcase,
    Calendar,
    FileSignature,
    MessageSquare,
    Workflow,
    Sparkles,
    Target,
    Clock
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
            {/* Global Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <img src="/Logo.svg" alt="Everleap Logo" className="h-8 w-auto" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">Login</Button>
                        <Button size="sm" variant="default">Request a demo</Button>
                    </div>
                </div>
            </header>

            <main>
                {/* Section 1: Hero - Vision Declaration */}
                <section className="pt-24 pb-20 md:pt-32 md:pb-28">
                    <div className="container mx-auto max-w-5xl px-4 text-center">
                        <h1 className="mb-6 text-5xl font-semibold tracking-tight text-slate-900 md:text-6xl lg:text-7xl leading-[1.1] capitalize">
                            Meet your autonomous <br className="hidden md:block" />
                            <span className="text-teal-500">HR team.</span>
                        </h1>
                        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 leading-relaxed md:text-xl">
                            Everleap is an agentic AI system designed to run hiring end-to-end, from job creation to onboarding, while humans stay in control.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button size="lg" className="h-11 px-6 text-base shadow-sm">Request a demo</Button>
                            <Button variant="ghost" size="lg" className="h-11 px-6 text-base text-slate-600 hover:text-slate-900 group">
                                See how it works <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Section 2: The System - Orientation Layer */}
                <section className="py-24 bg-slate-50 border-y border-slate-100">
                    <div className="container mx-auto max-w-5xl px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl mb-4">
                                A system of AI agents, working together
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Hiring intent triggers a coordinated swarm of AI agents. Each agent handles a specialized part of the workflow. Humans approve decisions at key checkpoints.
                            </p>
                        </div>

                        {/* System Flow Visualization */}
                        <div className="flex items-center justify-center gap-4 flex-wrap max-w-4xl mx-auto">
                            {[
                                { label: "Intent", icon: Target, color: "teal" },
                                { label: "Agents", icon: Bot, color: "slate" },
                                { label: "Output", icon: FileText, color: "slate" },
                                { label: "Human Review", icon: UserCheck, color: "teal" },
                                { label: "Next Agent", icon: Workflow, color: "slate" }
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className={`flex flex-col items-center gap-2 p-4 rounded-lg border ${step.color === 'teal' ? 'border-teal-200 bg-teal-50/50' : 'border-slate-200 bg-white'}`}>
                                        <step.icon className={`h-6 w-6 ${step.color === 'teal' ? 'text-teal-600' : 'text-slate-400'}`} />
                                        <span className={`text-xs font-medium ${step.color === 'teal' ? 'text-teal-900' : 'text-slate-600'}`}>{step.label}</span>
                                    </div>
                                    {i < 4 && <ArrowRight className="h-4 w-4 text-slate-300 hidden sm:block" />}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 3: Hiring Intent & Setup */}
                <section className="py-24">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <Badge variant="outline" className="mb-4 text-xs font-medium uppercase tracking-wider">Step 1</Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                    Describe who you want to hire
                                </h2>
                                <p className="text-lg text-slate-600 mb-6">
                                    Everleap handles the rest.
                                </p>
                                <ul className="space-y-3 text-slate-700">
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Role creation with skills & experience requirements</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Location preferences and work arrangement</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Salary range and compensation structure</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Compliance notes and hiring constraints</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-slate-100 border border-slate-200 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                                <div className="text-center text-slate-400">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-medium">Job Requisition Form</p>
                                    <p className="text-xs mt-1">Screenshot placeholder</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4: AI-Powered JD Generation */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1 bg-white border border-slate-200 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                                <div className="text-center text-slate-400">
                                    <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-medium">AI-Generated Job Description</p>
                                    <p className="text-xs mt-1">Screenshot placeholder</p>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <Badge variant="outline" className="mb-4 text-xs font-medium uppercase tracking-wider">Step 2</Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                    From intent to market-ready job descriptions
                                </h2>
                                <p className="text-lg text-slate-600 mb-6">
                                    In minutes, not hours.
                                </p>
                                <ul className="space-y-3 text-slate-700">
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Market research on salary and role demand</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Auto-generated, competitive job descriptions</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Edit and approve before publishing</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 5: Job Distribution & Publishing */}
                <section className="py-24">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <Badge variant="outline" className="mb-4 text-xs font-medium uppercase tracking-wider">Step 3</Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                    Jobs go live without manual posting
                                </h2>
                                <p className="text-lg text-slate-600 mb-6">
                                    Automated distribution to LinkedIn, careers pages, and job boards.
                                </p>
                                <ul className="space-y-3 text-slate-700">
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>LinkedIn job posting integration</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Application link generation</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Real-time posting status tracking</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-slate-100 border border-slate-200 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                                <div className="text-center text-slate-400">
                                    <Globe className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-medium">Job Publishing Dashboard</p>
                                    <p className="text-xs mt-1">Screenshot placeholder</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 6: Candidate Intake & Applications */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1 bg-white border border-slate-200 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                                <div className="text-center text-slate-400">
                                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-medium">Candidate Application Page</p>
                                    <p className="text-xs mt-1">Screenshot placeholder</p>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <Badge variant="outline" className="mb-4 text-xs font-medium uppercase tracking-wider">Step 4</Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                    A clean, structured experience for every candidate
                                </h2>
                                <p className="text-lg text-slate-600 mb-6">
                                    Professional application flow from first impression.
                                </p>
                                <ul className="space-y-3 text-slate-700">
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Simple, professional application forms</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Resume and document upload</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Custom screening questions</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 7: AI Screening & Evaluation - CORE */}
                <section className="py-24 border-y-2 border-teal-100 bg-gradient-to-b from-white to-teal-50/30">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="text-center mb-12">
                            <Badge className="mb-4 text-xs font-medium uppercase tracking-wider bg-teal-100 text-teal-900 border-teal-200">Core Feature</Badge>
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl mb-4">
                                AI evaluates candidates objectively.<br />Humans make the call.
                            </h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                                Every resume is parsed, analyzed, and scored against your requirements. You see the best candidates first, with full AI reasoning.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-12">
                            <div className="bg-white border border-slate-200 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                                <div className="text-center text-slate-400">
                                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-medium">Candidate List with AI Scores</p>
                                    <p className="text-xs mt-1">Screenshot placeholder</p>
                                </div>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                                <div className="text-center text-slate-400">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-medium">Candidate Detail with AI Analysis</p>
                                    <p className="text-xs mt-1">Screenshot placeholder</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { icon: Bot, label: "Resume parsing" },
                                { icon: Target, label: "Skill extraction" },
                                { icon: Sparkles, label: "AI scoring" },
                                { icon: FileText, label: "Strengths & gaps" }
                            ].map((feature, i) => (
                                <div key={i} className="p-4 rounded-lg border border-teal-100 bg-white/50 flex items-center gap-3">
                                    <feature.icon className="h-5 w-5 text-teal-600" />
                                    <span className="text-sm font-medium text-slate-700">{feature.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 8: Pipeline & Human Decisions */}
                <section className="py-24">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <Badge variant="outline" className="mb-4 text-xs font-medium uppercase tracking-wider">Step 6</Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                    Stay in control of every hiring decision
                                </h2>
                                <p className="text-lg text-slate-600 mb-6">
                                    Move candidates through stages, update statuses, and override AI recommendations whenever needed.
                                </p>
                                <ul className="space-y-3 text-slate-700">
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Visual pipeline with drag-and-drop stages</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Status updates and candidate notes</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Manual overrides on AI decisions</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-slate-100 border border-slate-200 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                                <div className="text-center text-slate-400">
                                    <Workflow className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-medium">Candidate Pipeline View</p>
                                    <p className="text-xs mt-1">Screenshot placeholder</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 9: Interview Coordination */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1 bg-white border border-slate-200 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                                <div className="text-center text-slate-400">
                                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-medium">Interview Scheduling</p>
                                    <p className="text-xs mt-1">Screenshot placeholder</p>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <Badge variant="outline" className="mb-4 text-xs font-medium uppercase tracking-wider">Step 7</Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                    From shortlist to conversation, without coordination overhead
                                </h2>
                                <p className="text-lg text-slate-600 mb-6">
                                    Automated scheduling and communication keep the process moving.
                                </p>
                                <ul className="space-y-3 text-slate-700">
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Interview scheduling with availability matching</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Automated candidate communication</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Interview status tracking and timeline</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 10: Offer & Onboarding Automation */}
                <section className="py-24">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <Badge variant="outline" className="mb-4 text-xs font-medium uppercase tracking-wider">Step 8</Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                    Hiring doesn't stop at 'yes'
                                </h2>
                                <p className="text-lg text-slate-600 mb-6">
                                    Everleap carries it forward to a successful first day.
                                </p>
                                <ul className="space-y-3 text-slate-700">
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Automated offer letter generation</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Document collection and verification</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Onboarding checklists and task tracking</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="bg-slate-100 border border-slate-200 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                                <div className="text-center text-slate-400">
                                    <FileSignature className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-medium">Offer Letter & Onboarding</p>
                                    <p className="text-xs mt-1">Screenshot placeholder</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 11: HR Operations & Continuity */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto max-w-6xl px-4">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1 bg-white border border-slate-200 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
                                <div className="text-center text-slate-400">
                                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="text-sm font-medium">HR Query Management</p>
                                    <p className="text-xs mt-1">Screenshot placeholder</p>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <Badge variant="outline" className="mb-4 text-xs font-medium uppercase tracking-wider">Beyond Hiring</Badge>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">
                                    Built to support teams beyond the hire
                                </h2>
                                <p className="text-lg text-slate-600 mb-6">
                                    Everleap extends into ongoing HR operations and employee support.
                                </p>
                                <ul className="space-y-3 text-slate-700">
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>HR query management and routing</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Post-onboarding workflow automation</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <Check className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                                        <span>Long-term employee lifecycle support</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 12: Human-in-the-Loop Principle */}
                <section className="py-32 bg-slate-900 text-white">
                    <div className="container mx-auto max-w-4xl px-4 text-center">
                        <div className="inline-flex items-center justify-center p-4 bg-teal-500/10 rounded-full mb-8">
                            <ShieldCheck className="h-10 w-10 text-teal-400" />
                        </div>
                        <h2 className="text-4xl font-bold tracking-tight mb-6">
                            Humans stay in control.<br />AI does the execution.
                        </h2>
                        <p className="text-xl text-slate-300 mb-10 leading-relaxed max-w-2xl mx-auto">
                            Everleap is designed with approval checkpoints built in. AI agents execute tasks. Humans approve decisions.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                            <span className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-700 bg-slate-800/50">
                                <Check className="h-4 w-4 text-teal-400" /> Review job descriptions
                            </span>
                            <span className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-700 bg-slate-800/50">
                                <Check className="h-4 w-4 text-teal-400" /> Approve shortlists
                            </span>
                            <span className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-700 bg-slate-800/50">
                                <Check className="h-4 w-4 text-teal-400" /> Final hiring decisions
                            </span>
                        </div>
                    </div>
                </section>

                {/* Section 13: Demo Framing */}
                <section className="py-24">
                    <div className="container mx-auto max-w-4xl px-4">
                        <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm p-10 md:p-14 text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">What you'll see in the demo</h2>
                            <p className="text-slate-600 mb-10">A complete walkthrough of the Everleap system</p>

                            <div className="grid sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto mb-12">
                                {[
                                    "Walk through the Everleap system",
                                    "See how AI agents collaborate",
                                    "Understand approval checkpoints",
                                    "Discuss fit for your hiring needs"
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <div className="h-7 w-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 text-sm font-bold">
                                            {i + 1}
                                        </div>
                                        <p className="text-slate-700 pt-1">{step}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col items-center gap-3">
                                <Button size="lg" className="h-12 px-8 text-base">Request a demo</Button>
                                <p className="text-sm text-slate-500 mt-1">No setup. No commitment.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 14: Final CTA */}
                <section className="py-32 text-center bg-slate-50 border-t border-slate-100">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-8 md:text-5xl">
                            Ready to see autonomous hiring<br className="hidden sm:block" /> in action?
                        </h2>
                        <Button size="lg" className="h-12 px-8 text-lg">Request a demo</Button>
                    </div>
                </section>
            </main>

            {/* Enterprise Footer */}
            <footer className="py-16 border-t border-slate-200 bg-white">
                <div className="container mx-auto max-w-6xl px-4">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-2 mb-4">
                                <img src="/Logo.svg" alt="Everleap Logo" className="h-6 w-auto" />
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Everleap is building an agentic AI system for recruitment automation, designed to streamline job creation, candidate screening, interview coordination, and onboarding workflows.
                            </p>
                        </div>

                        {/* Product */}
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Product</h3>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="#" className="text-slate-600 hover:text-slate-900">Hiring Automation</Link></li>
                                <li><Link href="#" className="text-slate-600 hover:text-slate-900">Candidate Screening</Link></li>
                                <li><Link href="#" className="text-slate-600 hover:text-slate-900">Onboarding</Link></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Company</h3>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="#" className="text-slate-600 hover:text-slate-900">About</Link></li>
                                <li><Link href="#" className="text-slate-600 hover:text-slate-900">Contact</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h3 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Legal</h3>
                            <ul className="space-y-3 text-sm">
                                <li><Link href="#" className="text-slate-600 hover:text-slate-900">Privacy</Link></li>
                                <li><Link href="#" className="text-slate-600 hover:text-slate-900">Terms</Link></li>
                                <li><Link href="/login" className="text-slate-600 hover:text-slate-900">Login</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-100 text-center text-xs text-slate-500">
                        © 2026 Everleap. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

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
    Briefcase,
    Search,
    Sparkles,
    Users
} from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-teal-100 selection:text-teal-900">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <img src="/Logo.svg" alt="Everleap Logo" className="h-8 w-auto" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                            Login
                        </Link>
                        <Button size="sm" className="h-8 px-4 text-xs">Request a demo</Button>
                    </div>
                </div>
            </header>

            <main>
                {/* Section 1: Hero */}
                <section className="pt-24 pb-16 md:pt-32 md:pb-24">
                    <div className="container mx-auto max-w-5xl px-4 text-center">
                        <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1">
                            <Badge variant="secondary" className="bg-white text-[10px] font-medium uppercase tracking-wider text-slate-600 shadow-sm border-slate-100 hover:bg-white">v1.0</Badge>
                            <span className="text-xs font-medium text-slate-600">Now available for enterprise teams</span>
                        </div>
                        <h1 className="mb-6 text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl lg:text-7xl leading-[1.1]">
                            Meet your <br className="hidden md:block" />
                            <span className="text-teal-500">autonomous HR team.</span>
                        </h1>
                        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-500 leading-relaxed md:text-xl">
                            Everleap is an agentic AI system designed to run hiring end-to-end — from job creation to onboarding — while humans stay in control.
                        </p>
                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <Button size="lg" className="h-11 px-6 text-base shadow-sm">Request a demo</Button>
                            <Button variant="outline" size="lg" className="h-11 px-6 text-base border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 group">
                                See how it works <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Section 2: Social Proof */}
                <section className="border-y border-slate-100 bg-slate-50/50 py-10">
                    <div className="container mx-auto max-w-5xl px-4 text-center">
                        <p className="text-sm font-medium text-slate-500">Trusted by teams exploring the future of AI-led hiring</p>
                        <div className="mt-6 flex flex-wrap justify-center gap-8 opacity-40 grayscale">
                            <div className="h-6 w-24 rounded bg-slate-300/50"></div>
                            <div className="h-6 w-24 rounded bg-slate-300/50"></div>
                            <div className="h-6 w-24 rounded bg-slate-300/50"></div>
                            <div className="h-6 w-24 rounded bg-slate-300/50"></div>
                        </div>
                    </div>
                </section>

                {/* Section 3: Everleap in Action */}
                <section className="py-24">
                    <div className="container mx-auto max-w-5xl px-4">
                        <div className="mb-16">
                            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl text-center">What happens when you <br />open a role in Everleap</h2>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {[
                                { title: "1. Intent", desc: "Role, skills, location, and constraints", icon: FileText },
                                { title: "2. Market Research", desc: "Benchmarks salary and role demand", icon: Search },
                                { title: "3. JD Generation", desc: "Clear, competitive job description", icon: Sparkles },
                                { title: "4. Human Review", desc: "Approve or edit before publishing", icon: UserCheck, highlight: true },
                                { title: "5. Publishing", desc: "LinkedIn and careers page", icon: Globe },
                                { title: "6. Screening", desc: "Scores and shortlists automatically", icon: Users },
                                { title: "7. Onboarding", desc: "Documents, checklists, access", icon: Briefcase },
                            ].map((step, i) => (
                                <div key={i} className={`p-6 rounded-lg border ${step.highlight ? 'border-teal-200 bg-teal-50/30' : 'border-slate-200 bg-white'} hover:border-slate-300 transition-colors`}>
                                    <div className="flex items-center gap-3 mb-3">
                                        <step.icon className={`h-5 w-5 ${step.highlight ? 'text-teal-600' : 'text-slate-400'}`} />
                                        <h3 className={`font-medium ${step.highlight ? 'text-teal-900' : 'text-slate-900'}`}>{step.title}</h3>
                                    </div>
                                    <p className={`${step.highlight ? 'text-teal-700' : 'text-slate-500'} text-sm`}>{step.desc}</p>
                                </div>
                            ))}
                        </div>

                    </div>
                </section>

                {/* Section 4: AI Agents */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto max-w-5xl px-4">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">A swarm of specialized AI agents</h2>
                                <p className="text-lg text-slate-500 mb-8 leading-relaxed">Unlike traditional ATS tools, Everleap doesn't just store data. Active agents work 24/7 to move candidates forward.</p>
                                <ul className="space-y-4">
                                    {["Market Research Agent", "JD Generation Agent", "Publishing Agent", "Screening Agent", "Onboarding Agent"].map((agent) => (
                                        <li key={agent} className="flex items-center gap-3 text-slate-700 font-medium">
                                            <div className="h-6 w-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600">
                                                <Bot className="h-3.5 w-3.5" />
                                            </div>
                                            {agent}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 flex items-center justify-center min-h-[300px]">
                                {/* Abstract visual of agents connected */}
                                <div className="grid grid-cols-2 gap-4 w-full max-w-xs opacity-80">
                                    <div className="h-24 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center"><Bot className="text-teal-200 h-8 w-8" /></div>
                                    <div className="h-24 rounded-lg bg-slate-50 border border-slate-100 translate-y-8 flex items-center justify-center"><FileText className="text-slate-200 h-8 w-8" /></div>
                                    <div className="h-24 rounded-lg bg-slate-50 border border-slate-100 -translate-y-4 flex items-center justify-center"><Users className="text-slate-200 h-8 w-8" /></div>
                                    <div className="h-24 rounded-lg bg-teal-50 border border-teal-100 translate-y-4 flex items-center justify-center"><Sparkles className="text-teal-200 h-8 w-8" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 5: Human in the loop */}
                <section className="py-24">
                    <div className="container mx-auto max-w-3xl px-4 text-center">
                        <div className="inline-flex items-center justify-center p-3 bg-teal-50 rounded-full mb-8">
                            <ShieldCheck className="h-8 w-8 text-teal-600" />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-6">Humans stay in control. <br />AI does the execution.</h2>
                        <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                            Everleap is designed with human checkpoints built in. AI agents execute tasks. Humans approve decisions.
                            We believe in augmenting human intelligence, not replacing accountability.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-700">
                            <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50">
                                <Check className="h-4 w-4 text-teal-600" /> Review job descriptions
                            </span>
                            <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50">
                                <Check className="h-4 w-4 text-teal-600" /> Approve shortlists
                            </span>
                            <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50">
                                <Check className="h-4 w-4 text-teal-600" /> Final hiring decisions
                            </span>
                        </div>
                    </div>
                </section>

                {/* Section 6: Outcomes */}
                <section className="py-24 bg-slate-900 text-white">
                    <div className="container mx-auto max-w-5xl px-4">
                        <div className="mb-16">
                            <h2 className="text-3xl font-bold tracking-tight mb-4">Designed outcomes teams aim to achieve</h2>
                            <p className="text-slate-400">Outcomes shown reflect designed workflows and early usage patterns.</p>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { label: "JD Creation", from: "Hours", to: "Minutes" },
                                { label: "Resume Screening", from: "Manual", to: "Automated" },
                                { label: "Follow-ups", from: "Inconsistent", to: "Instant" },
                                { label: "HR Workload", from: "Reactive", to: "Strategic" },
                            ].map((item, i) => (
                                <div key={i} className="p-6 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <h3 className="text-sm font-medium text-slate-400 mb-4">{item.label}</h3>
                                    <div className="flex items-baseline gap-2">
                                        <span className="line-through text-slate-500 text-sm">{item.from}</span>
                                        <ArrowRight className="h-3 w-3 text-slate-600" />
                                        <span className="text-2xl font-semibold text-teal-400">{item.to}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 7: Who it's for */}
                <section className="py-24 bg-slate-50 border-b border-slate-200">
                    <div className="container mx-auto max-w-5xl px-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Founders", desc: "Visibility into hiring without micromanagement." },
                                { title: "HR Teams", desc: "Fewer tools. Fewer follow-ups. More strategy." },
                                { title: "Hiring Managers", desc: "Better shortlists, faster decisions." },
                            ].map((item, i) => (
                                <div key={i} className="text-center p-6">
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                                    <p className="text-slate-500">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section 8: Demo Expectation */}
                <section className="py-24">
                    <div className="container mx-auto max-w-4xl px-4">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 text-center">
                            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-8">What you’ll see in the demo</h2>
                            <div className="grid sm:grid-cols-2 gap-y-6 gap-x-12 text-left max-w-2xl mx-auto mb-10">
                                {["Walk through Everleap’s hiring workflows", "See how AI agents collaborate", "Understand where humans stay in control", "Discuss fit for your team"].map((step, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="h-6 w-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</div>
                                        <p className="text-slate-700">{step}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <Button size="lg">Request a demo</Button>
                                <p className="text-xs text-slate-400 mt-2">No setup. No commitment.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 9: Final CTA */}
                <section className="py-32 text-center">
                    <div className="container mx-auto px-4">
                        <h2 className="text-4xl font-bold tracking-tight text-slate-900 mb-8">Ready to see autonomous hiring in action?</h2>
                        <Button size="lg" className="h-12 px-8 text-lg">Request a demo</Button>
                    </div>
                </section>
            </main>

            <footer className="py-12 border-t border-slate-100 bg-white">
                <div className="container mx-auto max-w-5xl px-4 flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="max-w-xs">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="/Logo.svg" alt="Everleap Logo" className="h-6 w-auto" />
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Everleap is building an agentic AI system for recruitment automation, designed to streamline job creation, candidate screening, and onboarding workflows.
                        </p>
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-slate-600">
                        <Link href="#" className="hover:text-slate-900">Privacy</Link>
                        <Link href="#" className="hover:text-slate-900">Contact</Link>
                        <Link href="/login" className="hover:text-slate-900">Login</Link>
                    </div>
                </div>
                <div className="container mx-auto max-w-5xl px-4 mt-12 pt-8 border-t border-slate-50 text-center text-xs text-slate-400">
                    © 2026 Everleap. All rights reserved.
                </div>
            </footer>
        </div>
    );
}

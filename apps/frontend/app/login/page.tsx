"use client";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from "@everleap/design-system";
import { UserRole, useAuth } from "@/lib/mock-auth";
import Link from "next/link";
import { ArrowRight, ShieldCheck, User, Users, Calendar } from "lucide-react";

export default function LoginPage() {
    const { login } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 shadow-xl rounded-2xl overflow-hidden bg-card border">
                {/* Left Side: Brand & Context */}
                <div className="p-8 md:p-12 bg-zinc-900 text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <img src="/Logo.svg" alt="Everleap" className="h-8 w-auto invert brightness-0" />
                            <span className="font-bold text-xl tracking-tight">Everleap</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            Autonomous hiring for modern teams.
                        </h1>
                        <p className="text-zinc-400 text-lg">
                            Experience how Everleap automates the grunt work while you keep the control.
                        </p>
                    </div>
                    <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <span>Enterprise-grade security</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                <Users className="h-4 w-4" />
                            </div>
                            <span>Human-in-the-loop control</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Demo Login */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2">Welcome to the Demo</h2>
                        <p className="text-muted-foreground">Select a role to explore the platform.</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Organization Users</p>
                            <div className="space-y-3">
                                <DemoRoleButton
                                    role="ORG_ADMIN"
                                    title="Org Admin (IT)"
                                    desc="Billing, Integrations, Access"
                                    icon={<ShieldCheck className="h-5 w-5" />}
                                    onClick={() => login("ORG_ADMIN")}
                                />
                                <DemoRoleButton
                                    role="HR_ADMIN"
                                    title="Head of Talent"
                                    desc="Full control of Hiring Pipeline"
                                    icon={<Users className="h-5 w-5" />}
                                    onClick={() => login("HR_ADMIN")}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Job Candidates</p>
                            <div className="space-y-3">
                                <DemoRoleButton
                                    role="CANDIDATE"
                                    title="Candidate"
                                    desc="Apply to jobs, track applications"
                                    icon={<User className="h-5 w-5" />}
                                    onClick={() => login("CANDIDATE")}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Everleap Staff</p>
                            <div className="space-y-3">
                                <DemoRoleButton
                                    role="SUPER_ADMIN"
                                    title="Platform Superadmin"
                                    desc="Manage tenants, billing & API"
                                    icon={<User className="h-5 w-5" />}
                                    onClick={() => login("SUPER_ADMIN")}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DemoRoleButton({ role, title, desc, icon, onClick }: { role: string, title: string, desc: string, icon: React.ReactNode, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all group text-left"
        >
            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="flex-1">
                <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </button>
    )
}

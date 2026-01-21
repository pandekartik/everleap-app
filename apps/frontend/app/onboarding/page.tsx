"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Progress } from "@everleap/design-system";
import { CheckCircle2, Circle, Mail, Slack, FileText } from "lucide-react";

export default function OnboardingPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Onboarding</h1>
                    <p className="text-slate-500">Track progress of new hires.</p>
                </div>
                <Button>Invite New Hire</Button>
            </div>

            <div className="grid gap-6">
                <OnboardingCard
                    name="Amit Kumar"
                    role="DevOps Engineer"
                    startDate="Mar 01, 2026"
                    progress={60}
                    steps={[
                        { name: "Offer Accepted", status: "completed" },
                        { name: "Background Check", status: "completed" },
                        { name: "Equipment Sent", status: "processing" },
                        { name: "Account Setup", status: "pending" }
                    ]}
                />

                <OnboardingCard
                    name="Sarah Jenkins"
                    role="Senior UX Designer"
                    startDate="Mar 15, 2026"
                    progress={20}
                    steps={[
                        { name: "Offer Accepted", status: "completed" },
                        { name: "Background Check", status: "processing" },
                        { name: "Equipment Sent", status: "pending" },
                        { name: "Account Setup", status: "pending" }
                    ]}
                />
            </div>
        </div>
    );
}

function OnboardingCard({ name, role, startDate, progress, steps }: any) {
    return (
        <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-lg">{name}</CardTitle>
                        <p className="text-sm text-slate-500">{role} • Starts {startDate}</p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-slate-900">{progress}%</span>
                        <p className="text-xs text-slate-400">Complete</p>
                    </div>
                </div>
                <Progress value={progress} className="h-2 mt-3" />
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                    {steps.map((step: any, i: number) => (
                        <div key={i} className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                {step.status === "completed" ? (
                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                ) : step.status === "processing" ? (
                                    <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                ) : (
                                    <Circle className="h-5 w-5 text-slate-300" />
                                )}
                                <span className={`text-sm font-medium ${step.status === "completed" ? "text-slate-900" : "text-slate-500"}`}>
                                    {step.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex gap-3 pt-4 border-t border-slate-50">
                    <Button variant="outline" size="sm" className="h-8">
                        <Mail className="mr-2 h-3 w-3" /> Resend Welcome Email
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                        <Slack className="mr-2 h-3 w-3" /> Connect Slack
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                        <FileText className="mr-2 h-3 w-3" /> View Documents
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

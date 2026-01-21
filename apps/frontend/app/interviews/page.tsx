"use client";

import { Button, Card, CardContent } from "@everleap/design-system";
import { MOCK_INTERVIEWS } from "@/lib/mock-data";
import { Calendar, Clock, Video, User } from "lucide-react";
import Link from "next/link";

export default function InterviewsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Interviews</h1>
                    <p className="text-slate-500">Upcoming schedule and feedback requests.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Sync Calendar</Button>
                    <Link href="/hiring">
                        <Button>Schedule New</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Today</h3>
                        <div className="space-y-4">
                            {MOCK_INTERVIEWS.filter(i => i.date === "Today").map(interview => (
                                <InterviewCard key={interview.id} interview={interview} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Tomorrow</h3>
                        <div className="space-y-4">
                            {MOCK_INTERVIEWS.filter(i => i.date === "Tomorrow").map(interview => (
                                <InterviewCard key={interview.id} interview={interview} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats / Feedback Pending */}
                <div className="space-y-6">
                    <Card className="bg-amber-50/50 border-amber-100">
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-amber-900 mb-2">Pending Feedback</h3>
                            <p className="text-sm text-amber-700 mb-4">You have 3 interviews waiting for your feedback.</p>
                            <Button size="sm" className="w-full bg-amber-600 hover:bg-amber-700 text-white border-none">
                                Complete Feedback
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Interviewer Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Hours this week</span>
                                    <span className="font-medium">12.5 hrs</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Candidates met</span>
                                    <span className="font-medium">8</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function InterviewCard({ interview }: { interview: any }) {
    return (
        <Card className="border-slate-100 shadow-sm hover:border-slate-200 transition-colors">
            <div className="p-5 flex items-start gap-4">
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 mb-1">
                                {interview.type} Round
                            </span>
                            <h4 className="text-lg font-semibold text-slate-900">{interview.candidateName}</h4>
                            <p className="text-sm text-slate-500">{interview.role}</p>
                        </div>
                        <Button size="sm" variant="outline">
                            <Video className="h-3 w-3 mr-2" />
                            Join
                        </Button>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-500 mt-3">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            {interview.time}
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {interview.interviewer}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}

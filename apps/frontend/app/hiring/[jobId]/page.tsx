"use client";

import { useState } from "react";
import { Button, Card, CardContent, Badge } from "@everleap/design-system";
import { ArrowLeft, Edit, Pause, Play, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const TABS = ["Setup", "Candidates", "Activity"];

export default function JobDetailPage() {
    const params = useParams();
    const jobId = params.jobId as string;
    const [activeTab, setActiveTab] = useState("Setup");

    // Mock job data
    const job = {
        id: jobId,
        title: "Senior Product Manager",
        department: "Product",
        location: "San Francisco, CA",
        status: "OPEN",
        createdDate: "Nov 15, 2026",
        candidateCount: 12,
        description: "We're looking for an experienced Product Manager to lead our core product initiatives...",
        responsibilities: "• Lead product strategy\n• Collaborate with engineering\n• Drive user research",
        requiredSkills: "Product management, SQL, A/B testing",
        salary: "$120,000 - $150,000",
        equity: "0.10%"
    };

    return (
        <div className="p-8 space-y-6">
            {/* Back Button */}
            <Link href="/hiring">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Jobs
                </Button>
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{job.title}</h1>
                        <Badge className={
                            job.status === "OPEN"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 border"
                                : "bg-slate-100 text-slate-700 border-slate-200 border"
                        }>
                            {job.status}
                        </Badge>
                    </div>
                    <p className="text-slate-500 mt-2">
                        {job.department} • {job.location} • Created {job.createdDate}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                    <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <div className="flex gap-6">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab
                                    ? "border-primary text-primary"
                                    : "border-transparent text-slate-600 hover:text-slate-900"
                                }`}
                        >
                            {tab}
                            {tab === "Candidates" && (
                                <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-xs text-slate-700">
                                    {job.candidateCount}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === "Setup" && <SetupTab job={job} />}
                {activeTab === "Candidates" && <CandidatesTab jobId={jobId} />}
                {activeTab === "Activity" && <ActivityTab jobId={jobId} />}
            </div>
        </div>
    );
}

function SetupTab({ job }: any) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="pt-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Basic Information</h3>
                        <div className="space-y-3 text-sm">
                            <InfoRow label="Job Title" value={job.title} />
                            <InfoRow label="Department" value={job.department} />
                            <InfoRow label="Location" value={job.location} />
                            <InfoRow label="Compensation" value={job.salary} />
                            <InfoRow label="Equity" value={job.equity} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
                <CardContent className="pt-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Requirements</h3>
                        <div className="space-y-3 text-sm">
                            <InfoRow label="Required Skills" value={job.requiredSkills} />
                            <InfoRow label="Status" value={job.status} />
                            <InfoRow label="Posted" value={job.createdDate} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm md:col-span-2">
                <CardContent className="pt-6">
                    <h3 className="font-semibold text-slate-900 mb-3">Job Description</h3>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {job.description}
                    </p>

                    <h3 className="font-semibold text-slate-900 mt-6 mb-3">Key Responsibilities</h3>
                    <p className="text-sm text-slate-700 whitespace-pre-line">
                        {job.responsibilities}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

function CandidatesTab({ jobId }: { jobId: string }) {
    // Mock candidates by stage
    const pipeline = {
        applied: [
            { id: 1, name: "Rohan Gupta", avatar: "https://i.pravatar.cc/150?u=1", score: 95 },
            { id: 2, name: "Sarah Chen", avatar: "https://i.pravatar.cc/150?u=2", score: 88 }
        ],
        screening: [
            { id: 3, name: "Priya Sharma", avatar: "https://i.pravatar.cc/150?u=3", score: 92 }
        ],
        interview: [
            { id: 4, name: "Michael Brown", avatar: "https://i.pravatar.cc/150?u=4", score: 85 }
        ],
        offer: [],
        hired: []
    };

    return (
        <div className="grid grid-cols-5 gap-4">
            <StageColumn title="Applied" count={pipeline.applied.length} candidates={pipeline.applied} />
            <StageColumn title="Screening" count={pipeline.screening.length} candidates={pipeline.screening} />
            <StageColumn title="Interview" count={pipeline.interview.length} candidates={pipeline.interview} />
            <StageColumn title="Offer" count={pipeline.offer.length} candidates={pipeline.offer} />
            <StageColumn title="Hired" count={pipeline.hired.length} candidates={pipeline.hired} />
        </div>
    );
}

function StageColumn({ title, count, candidates }: any) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-slate-700">{title}</h3>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">{count}</span>
            </div>
            <div className="space-y-2 min-h-[400px] bg-slate-50/50 rounded-lg p-3">
                {candidates.map((candidate: any) => (
                    <Card key={candidate.id} className="border-slate-200 shadow-none hover:shadow-sm transition-shadow cursor-pointer">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                                <img
                                    src={candidate.avatar}
                                    alt={candidate.name}
                                    className="h-8 w-8 rounded-full"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-slate-900 truncate">{candidate.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500"
                                        style={{ width: `${candidate.score}%` }}
                                    />
                                </div>
                                <span className="text-xs font-medium text-slate-600">{candidate.score}%</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

function ActivityTab({ jobId }: { jobId: string }) {
    const activities = [
        { id: 1, action: "Job posted to LinkedIn", time: "2 hours ago", type: "system" },
        { id: 2, action: "AI screened 15 new applicants", time: "4 hours ago", type: "ai" },
        { id: 3, action: "Sent rejection emails to 3 candidates", time: "1 day ago", type: "system" },
        { id: 4, action: "Job posted to company career page", time: "2 days ago", type: "system" },
        { id: 5, action: "AI sourced 50 profiles from GitHub", time: "3 days ago", type: "ai" }
    ];

    return (
        <Card className="border-slate-100 shadow-sm">
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4 pb-4 border-b border-slate-100 last:border-0">
                            <div className={`mt-1 h-2 w-2 rounded-full ${activity.type === "ai" ? "bg-primary" : "bg-slate-300"
                                }`} />
                            <div className="flex-1">
                                <p className="text-sm text-slate-900">{activity.action}</p>
                                <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-slate-600">{label}</span>
            <span className="font-medium text-slate-900">{value}</span>
        </div>
    );
}

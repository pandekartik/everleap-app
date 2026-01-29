"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, Badge } from "@everleap/design-system";
import { ArrowLeft, Edit, Pause, Play, Trash2, Globe, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

const TABS = ["Setup", "Candidates", "Activity"];

export default function JobDetailPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.jobId as string;
    const [activeTab, setActiveTab] = useState("Setup");
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [candidates, setCandidates] = useState<any[]>([]);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                // Fetch job details
                const { data: jobData } = await api.get(`/jobs/${jobId}`);
                setJob(jobData);

                // Fetch candidates
                // Note: Currently fetching all candidates and filtering client-side
                // In future, backend should support filtering by job_id
                const { data: candidatesData } = await api.get("/candidates");
                const jobCandidates = candidatesData.candidates.filter((c: any) => c.job_id === jobId);
                setCandidates(jobCandidates);
            } catch (error) {
                console.error("Failed to fetch job details:", error);
                toast.error("Failed to load job details");
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJob();
        }
    }, [jobId]);

    const handlePublish = async () => {
        try {
            await api.post(`/jobs/${jobId}/publish`);
            toast.success("Job published successfully and posted to LinkedIn");
            // Refresh job data
            const { data } = await api.get(`/jobs/${jobId}`);
            setJob(data);
        } catch (error) {
            console.error("Failed to publish job:", error);
            toast.error("Failed to publish job");
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Job not found</h2>
                <Link href="/hiring">
                    <Button variant="outline">Back to Jobs</Button>
                </Link>
            </div>
        );
    }

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
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{job.job_title}</h1>
                        <StatusBadge status={job.status} />
                    </div>
                    <p className="text-slate-500 mt-2">
                        {job.department} • {job.location} • Created {format(new Date(job.created_at), 'MMM d, yyyy')}
                    </p>
                    {job.unique_job_code && (
                        <p className="text-xs text-slate-400 mt-1 font-mono">
                            ID: {job.unique_job_code}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {/* View Public Page Button */}
                    {job.is_published && job.unique_job_code && (
                        <Link
                            href={`https://everleap-demo.com/careers/${job.unique_job_code}`}
                            target="_blank"
                        >
                            <Button variant="outline" size="sm">
                                <Globe className="h-4 w-4 mr-2" />
                                View Public Page
                            </Button>
                        </Link>
                    )}

                    {!job.is_published ? (
                        <Button size="sm" onClick={handlePublish}>
                            <Play className="h-4 w-4 mr-2" />
                            Publish Job
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" className="text-amber-600 border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-700">
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Hiring
                        </Button>
                    )}

                    <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
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
                                    {candidates.length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === "Setup" && <SetupTab job={job} />}
                {activeTab === "Candidates" && <CandidatesTab candidates={candidates} />}
                {activeTab === "Activity" && <ActivityTab jobId={jobId} />}
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'published') {
        return (
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 border">
                Published
            </Badge>
        );
    }
    if (status === 'draft') {
        return (
            <Badge className="bg-slate-100 text-slate-700 border-slate-200 border">
                Draft
            </Badge>
        );
    }
    return (
        <Badge variant="secondary">
            {status}
        </Badge>
    );
}

function SetupTab({ job }: any) {
    // Format currency
    const formatCurrency = (amount: number, currency: string) => {
        if (!amount) return 'N/A';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const salaryRange = job.compensation_min && job.compensation_max
        ? `${formatCurrency(job.compensation_min, job.currency)} - ${formatCurrency(job.compensation_max, job.currency)}`
        : 'Not specified';

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="pt-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Basic Information</h3>
                        <div className="space-y-3 text-sm">
                            <InfoRow label="Job Title" value={job.job_title} />
                            <InfoRow label="Department" value={job.department || 'N/A'} />
                            <InfoRow label="Location" value={job.location || 'Remote'} />
                            <InfoRow label="Employment Type" value={job.employment_type?.replace('_', ' ') || 'N/A'} />
                            <InfoRow label="Compensation" value={salaryRange} />
                            <InfoRow label="Equity" value={job.equity || 'None'} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
                <CardContent className="pt-6 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-900 mb-3">Settings</h3>
                        <div className="space-y-3 text-sm">
                            <InfoRow label="Remote" value={job.is_remote ? "Yes" : "No"} />
                            <InfoRow label="Direct Post" value={job.direct_job_post ? "Yes" : "No"} />
                            <InfoRow label="Status" value={job.status} />
                            <InfoRow label="Posted" value={format(new Date(job.created_at), 'MMM d, yyyy')} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm md:col-span-2">
                <CardContent className="pt-6">
                    <h3 className="font-semibold text-slate-900 mb-3">Job Description</h3>
                    {job.description ? (
                        <div
                            className="text-sm text-slate-700 leading-relaxed prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br/>') }}
                        />
                    ) : (
                        <p className="text-sm text-slate-400 italic">No description available.</p>
                    )}

                    {job.screening_questions && job.screening_questions.length > 0 && (
                        <>
                            <h3 className="font-semibold text-slate-900 mt-6 mb-3">Screening Questions</h3>
                            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                                {job.screening_questions.map((q: any, i: number) => (
                                    <li key={i}>{q.question}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function CandidatesTab({ candidates }: { candidates: any[] }) {
    if (!candidates || candidates.length === 0) {
        return (
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-6 w-6 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No candidates yet</h3>
                    <p className="text-slate-500 max-w-sm mt-1">
                        Candidates who apply to this job will appear here. Publish your job to start receiving applications.
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Determine stage based on status
    // MOCK: Distributing candidates into stages for demo if real stage missing
    const pipeline = {
        applied: candidates.filter(c => !c.status || c.status === 'APPLIED'),
        screening: candidates.filter(c => c.status === 'SCREENING'),
        interview: candidates.filter(c => c.status === 'INTERVIEW'),
        offer: candidates.filter(c => c.status === 'OFFER'),
        hired: candidates.filter(c => c.status === 'HIRED')
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
            <div className="space-y-2 min-h-[200px] bg-slate-50/50 rounded-lg p-3">
                {candidates.map((candidate: any) => {
                    // Extract name/email from parsed_data or fallback
                    const name = candidate.parsed_data?.name?.first ?
                        `${candidate.parsed_data.name.first} ${candidate.parsed_data.name.last || ''}` :
                        (candidate.resume_filename || 'Unknown Candidate');
                    const score = candidate.ai_score ? Math.round(candidate.ai_score) : 0;

                    return (
                        <Card key={candidate.application_id} className="border-slate-200 shadow-none hover:shadow-sm transition-shadow cursor-pointer">
                            <CardContent className="p-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                                        {name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-slate-900 truncate">{name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${score >= 70 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${score}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-slate-600">{score}%</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

function ActivityTab({ jobId }: { jobId: string }) {
    // Mock activities for now since backend activity log isn't fully ready
    const activities = [
        { id: 1, action: "Job details viewed", time: "Just now", type: "system" },
    ];

    return (
        <Card className="border-slate-100 shadow-sm">
            <CardContent className="pt-6">
                <div className="text-center text-slate-500 py-6 text-sm">
                    No recent activity to show.
                </div>
            </CardContent>
        </Card>
    );
}

function InfoRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between">
            <span className="text-slate-600">{label}</span>
            <span className="font-medium text-slate-900 truncate max-w-[200px] text-right" title={value}>{value}</span>
        </div>
    );
}


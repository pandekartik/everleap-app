"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Badge } from "@everleap/design-system";
import { CheckCircle2, Circle, Clock, Calendar, FileText, MapPin, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MOCK_APPLICATIONS } from "@/lib/mock-applications";
import { MOCK_ROLES } from "@/lib/mock-data";
import { ApplicationStatus } from "@/lib/types/candidate";

interface ApplicationCardProps {
    application: any;
    jobTitle: string;
    jobDepartment: string;
    jobLocation: string;
}

function ApplicationCard({ application, jobTitle, jobDepartment, jobLocation }: ApplicationCardProps) {
    const getStatusColor = (status: ApplicationStatus) => {
        const colors: Record<ApplicationStatus, string> = {
            DRAFT: "bg-slate-500",
            APPLIED: "bg-blue-500",
            UNDER_REVIEW: "bg-purple-500",
            SCREENING: "bg-purple-600",
            INTERVIEW_SCHEDULED: "bg-teal-500",
            INTERVIEW_COMPLETED: "bg-teal-600",
            OFFER_EXTENDED: "bg-green-500",
            HIRED: "bg-green-600",
            REJECTED: "bg-red-500",
            WITHDRAWN: "bg-slate-400"
        };
        return colors[status] || "bg-slate-500";
    };

    const getStatusLabel = (status: ApplicationStatus) => {
        const labels: Record<ApplicationStatus, string> = {
            DRAFT: "Draft",
            APPLIED: "Applied",
            UNDER_REVIEW: "Under Review",
            SCREENING: "Screening",
            INTERVIEW_SCHEDULED: "Interview Scheduled",
            INTERVIEW_COMPLETED: "Interview Completed",
            OFFER_EXTENDED: "Offer Extended",
            HIRED: "Hired",
            REJECTED: "Rejected",
            WITHDRAWN: "Withdrawn"
        };
        return labels[status] || status;
    };

    const getProgress = (status: ApplicationStatus) => {
        const progressMap: Record<ApplicationStatus, number> = {
            DRAFT: 10,
            APPLIED: 20,
            UNDER_REVIEW: 40,
            SCREENING: 50,
            INTERVIEW_SCHEDULED: 60,
            INTERVIEW_COMPLETED: 75,
            OFFER_EXTENDED: 90,
            HIRED: 100,
            REJECTED: 100,
            WITHDRAWN: 100
        };
        return progressMap[status] || 0;
    };

    const steps = [
        { name: "Applied", status: "APPLIED" },
        { name: "Under Review", status: "UNDER_REVIEW" },
        { name: "Interview", status: "INTERVIEW_SCHEDULED" },
        { name: "Offer", status: "OFFER_EXTENDED" }
    ];

    const getCurrentStepStatus = (stepStatus: string) => {
        const timeline = application.timeline || [];
        const hasStatus = timeline.some((event: any) => event.status === stepStatus);

        if (hasStatus) return "completed";

        // Check if it's the next step
        const statusOrder = ["APPLIED", "UNDER_REVIEW", "INTERVIEW_SCHEDULED", "OFFER_EXTENDED"];
        const currentIndex = statusOrder.indexOf(application.status);
        const stepIndex = statusOrder.indexOf(stepStatus);

        if (stepIndex === currentIndex) return "processing";
        return "pending";
    };

    const progress = getProgress(application.status);

    return (
        <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg">{jobTitle}</CardTitle>
                            <Badge className={`${getStatusColor(application.status)} text-white`}>
                                {getStatusLabel(application.status)}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                <span>{jobDepartment}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{jobLocation}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Applied {new Date(application.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-slate-900">{progress}%</span>
                        <p className="text-xs text-slate-400">Progress</p>
                    </div>
                </div>
                <Progress value={progress} className="h-2 mt-3" />
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4">
                    {steps.map((step, i) => {
                        const stepStatus = getCurrentStepStatus(step.status);
                        return (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    {stepStatus === "completed" ? (
                                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                    ) : stepStatus === "processing" ? (
                                        <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-slate-300" />
                                    )}
                                    <span className={`text-sm font-medium ${stepStatus === "completed" ? "text-slate-900" : "text-slate-500"}`}>
                                        {step.name}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Interview Details if scheduled */}
                {application.status === "INTERVIEW_SCHEDULED" && application.timeline.some((e: any) => e.scheduledFor) && (
                    <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <Calendar className="h-5 w-5 text-teal-600 mt-0.5" />
                            <div>
                                <h4 className="font-semibold text-teal-900 text-sm mb-1">Interview Scheduled</h4>
                                <p className="text-sm text-teal-700">
                                    {new Date(application.timeline.find((e: any) => e.scheduledFor)?.scheduledFor).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}
                                </p>
                                {application.timeline.find((e: any) => e.note) && (
                                    <p className="text-xs text-teal-600 mt-1">
                                        {application.timeline.find((e: any) => e.note)?.note}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-6 flex gap-3 pt-4 border-t border-slate-50">
                    <Link href={`/candidate/applications/${application.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="h-8 w-full">
                            <FileText className="mr-2 h-3 w-3" /> View Details
                        </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="h-8" disabled>
                        Withdraw
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function CandidateDashboardPage() {
    const applications = MOCK_APPLICATIONS;

    const stats = {
        total: applications.length,
        active: applications.filter(a => !["REJECTED", "WITHDRAWN", "HIRED"].includes(a.status)).length,
        interviews: applications.filter(a => a.status === "INTERVIEW_SCHEDULED" || a.status === "INTERVIEW_COMPLETED").length,
        offers: applications.filter(a => a.status === "OFFER_EXTENDED").length
    };

    // Mock featured jobs for testing the apply flow
    const featuredJobs = [
        {
            id: "TR-821",
            title: "Data Scientist",
            department: "Data",
            location: "Mumbai",
            employmentType: "Full-time",
            salaryRange: "$110,000 - $150,000",
            description: "Apply ML and analytics to drive business insights"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back, Sarah!</h1>
                <p className="text-slate-500 mt-1">You have {stats.active} active applications</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            Total Applications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Active
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Interviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-teal-600">{stats.interviews}</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            Offers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-green-600">{stats.offers}</p>
                    </CardContent>
                </Card>
            </div>

            {/* My Applications */}
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">My Applications</h2>
                {applications.map((app) => {
                    const job = MOCK_ROLES.find(r => r.id === app.jobId);
                    if (!job) return null;

                    return (
                        <ApplicationCard
                            key={app.id}
                            application={app}
                            jobTitle={job.title}
                            jobDepartment={job.department}
                            jobLocation={job.location}
                        />
                    );
                })}
            </div>

            {/* Featured Jobs Section */}
            {featuredJobs.length > 0 && (
                <Card className="border-slate-100">
                    <CardHeader>
                        <div>
                            <CardTitle>More Opportunities</CardTitle>
                            <p className="text-sm text-slate-500 mt-1">Continue exploring open positions</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {featuredJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="border border-slate-200 rounded-lg p-4 hover:border-primary/50 hover:bg-slate-50/50 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-slate-900">{job.title}</h3>
                                                <Badge variant="secondary" className="text-xs">
                                                    {job.employmentType}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-3">{job.description}</p>
                                            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Briefcase className="h-4 w-4" />
                                                    <span>{job.department}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    <span>{job.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href={`/apply/${job.id}`}>
                                            <Button size="sm" className="shrink-0">
                                                Apply Now
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

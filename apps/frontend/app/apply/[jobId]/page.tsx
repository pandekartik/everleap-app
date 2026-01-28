"use client";

import { useParams, useRouter } from "next/navigation";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@everleap/design-system";
import { MapPin, Briefcase, Clock, DollarSign, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MOCK_ROLES } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import ApplicationForm from "@/components/candidate/ApplicationForm";

export default function ApplyJobPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const jobId = params.jobId as string;
    const [showAuthPrompt, setShowAuthPrompt] = useState(!user || !user.roles.includes("CANDIDATE"));

    // Find job from mock data
    const job = MOCK_ROLES.find(r => r.id === jobId);

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <Card className="max-w-md w-full">
                    <CardContent className="pt-6 text-center">
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">Job Not Found</h2>
                        <p className="text-slate-500 mb-4">The job posting you're looking for doesn't exist or has been removed.</p>
                        <Link href="/">
                            <Button>Go Home</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Mock job details - in production, this would come from API
    const jobDetails = {
        description: "We're looking for an experienced professional to join our team and help drive innovation in our products.",
        responsibilities: [
            "Lead the design and implementation of key features",
            "Collaborate with cross-functional teams to deliver high-quality solutions",
            "Mentor junior team members and promote best practices",
            "Participate in strategic planning and technical decision-making"
        ],
        requirements: [
            "5+ years of relevant experience",
            "Strong technical skills and problem-solving abilities",
            "Excellent communication and collaboration skills",
            "Bachelor's degree in relevant field or equivalent experience"
        ],
        salaryRange: "$120,000 - $160,000",
        employmentType: "Full-time",
        remote: job.location.includes("Remote") || false,
        benefits: [
            "Health, dental, and vision insurance",
            "401(k) with company match",
            "Flexible work arrangements",
            "Professional development budget"
        ]
    };

    const handleStartApplication = () => {
        if (!user || !user.roles.includes("CANDIDATE")) {
            // Redirect to signup with job ID
            router.push(`/candidate/signup?jobId=${jobId}`);
        } else {
            setShowAuthPrompt(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href={user?.roles.includes("CANDIDATE") ? "/candidate/dashboard" : "/"}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to {user?.roles.includes("CANDIDATE") ? "Dashboard" : "Jobs"}
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Job Details (Sticky on desktop) */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-8 space-y-6">
                            {/* Job Header Card */}
                            <Card className="border-slate-100">
                                <CardHeader>
                                    <div className="space-y-3">
                                        <div>
                                            <Badge variant="outline" className="mb-2">
                                                {job.status}
                                            </Badge>
                                            <h1 className="text-2xl font-bold text-slate-900">{job.title}</h1>
                                        </div>
                                        <div className="space-y-2 text-sm text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Briefcase className="h-4 w-4" />
                                                <span>{job.department}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                <span>{job.location}</span>
                                                {jobDetails.remote && (
                                                    <Badge variant="secondary" className="ml-2">Remote</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                <span>{jobDetails.employmentType}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="h-4 w-4" />
                                                <span>{jobDetails.salaryRange}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-xs text-slate-500">
                                        Posted {job.createdDate}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Job Description Card (Collapsible on mobile) */}
                            <Card className="border-slate-100 hidden lg:block">
                                <CardHeader>
                                    <CardTitle className="text-base">About This Role</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 text-sm">
                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                                        <p className="text-slate-600">{jobDetails.description}</p>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-2">Key Responsibilities</h4>
                                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                                            {jobDetails.responsibilities.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-2">Requirements</h4>
                                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                                            {jobDetails.requirements.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold text-slate-900 mb-2">Benefits</h4>
                                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                                            {jobDetails.benefits.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Application Form */}
                    <div className="lg:col-span-2">
                        {showAuthPrompt ? (
                            <Card className="border-slate-100">
                                <CardHeader>
                                    <CardTitle>Apply for this Position</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center py-8">
                                        <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                            Create an account to apply
                                        </h3>
                                        <p className="text-slate-600 mb-6">
                                            Sign up to submit your application. It only takes 30 seconds!
                                        </p>
                                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                            <Button onClick={handleStartApplication} size="lg">
                                                Create Account & Apply
                                            </Button>
                                            <Link href={`/candidate/login?jobId=${jobId}`}>
                                                <Button variant="outline" size="lg">
                                                    Already have an account? Sign in
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <ApplicationForm
                                jobId={jobId}
                                onSubmit={(data) => {
                                    console.log("Application submitted:", data);
                                    router.push("/my-applications");
                                }}
                            />
                        )}

                        {/* Mobile Job Details */}
                        <Card className="border-slate-100 lg:hidden mt-6">
                            <CardHeader>
                                <CardTitle className="text-base">About This Role</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
                                    <p className="text-slate-600">{jobDetails.description}</p>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2">Key Responsibilities</h4>
                                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                                        {jobDetails.responsibilities.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2">Requirements</h4>
                                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                                        {jobDetails.requirements.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-2">Benefits</h4>
                                    <ul className="list-disc list-inside space-y-1 text-slate-600">
                                        {jobDetails.benefits.map((item, idx) => (
                                            <li key={idx}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

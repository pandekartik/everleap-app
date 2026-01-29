"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Separator } from "@everleap/design-system";
import { ArrowLeft, Mail, Phone, Linkedin, Globe, MapPin, Briefcase, GraduationCap, CheckCircle, XCircle, MessageSquare, Video, Download } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CandidateDetailPage() {
    const params = useParams();
    const candidateId = params.candidateId as string;
    const [activeTab, setActiveTab] = useState("Overview");
    const [candidate, setCandidate] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidate = async () => {
            try {
                const { data } = await api.get(`/candidates/${candidateId}`);

                // Transform API data to UI format
                const parsed = data.parsed_data || {};
                const name = parsed.name ? `${parsed.name.first} ${parsed.name.last || ''}` : (data.resume_filename || "Unknown");

                setCandidate({
                    id: data.application_id,
                    name: name,
                    email: parsed.email || "No email provided",
                    phone: parsed.phone || "No phone provided",
                    location: parsed.address?.city ? `${parsed.address.city}, ${parsed.address.country || ''}` : "Location not specified",
                    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
                    linkedin: parsed.linkedin_url || "",
                    portfolio: parsed.website || "",
                    appliedFor: data.job_title,
                    appliedDate: format(new Date(data.applied_at), 'MMM d, yyyy'),
                    stage: data.status,
                    matchScore: data.ai_score ? Math.round(data.ai_score) : 0,
                    resumeUrl: data.resume_url,

                    // Resume parsing
                    experience: parsed.work_experience?.map((exp: any) => ({
                        title: exp.job_title || "Role not specified",
                        company: exp.company || "Company not specified",
                        duration: `${exp.start_date || ''} - ${exp.end_date || 'Present'}`,
                        description: exp.description || ""
                    })) || [],

                    education: parsed.education?.map((edu: any) => ({
                        degree: edu.degree || "Degree not specified",
                        school: edu.school || "School not specified",
                        year: edu.end_date || ""
                    })) || [],

                    skills: parsed.skills || [],

                    // Screening (Mock for now if not in parsed data)
                    screeningQuestions: data.screening_answers || [],

                    // AI Analysis
                    aiInsights: {
                        strengths: parsed.ai_insights?.strengths || [],
                        concerns: parsed.ai_insights?.weaknesses || [],
                        recommendation: data.recommendation || "Pending AI Analysis"
                    }
                });
            } catch (error) {
                console.error("Failed to fetch candidate:", error);
                toast.error("Failed to load candidate details");
            } finally {
                setLoading(false);
            }
        };

        if (candidateId) {
            fetchCandidate();
        }
    }, [candidateId]);

    const TABS = ["Overview", "Resume", "Screening", "AI Analysis"];

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-xl font-semibold mb-2">Candidate not found</h2>
                <Link href="/candidates">
                    <Button variant="outline">Back to Candidates</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6">
            {/* Back Button */}
            <Link href="/candidates">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Candidates
                </Button>
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                    <img
                        src={candidate.avatar}
                        alt={candidate.name}
                        className="h-20 w-20 rounded-full border-2 border-slate-100 object-cover"
                    />
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{candidate.name}</h1>
                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                            <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {candidate.email}
                            </div>
                            <div className="flex items-center gap-1">
                                <Phone className="h-4 w-4" />
                                {candidate.phone}
                            </div>
                            <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {candidate.location}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 mt-3">
                            <Badge className="bg-slate-100 text-slate-700 border-slate-200 border">
                                {candidate.stage}
                            </Badge>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-600">Match Score:</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${candidate.matchScore >= 70 ? 'bg-emerald-500' : candidate.matchScore >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                            style={{ width: `${candidate.matchScore}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700">{candidate.matchScore}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {candidate.resumeUrl && (
                        <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Resume
                            </Button>
                        </a>
                    )}
                    <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                    </Button>
                    <Button variant="outline" size="sm">
                        <Video className="h-4 w-4 mr-2" />
                        Schedule
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Advance
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                    </Button>
                </div>
            </div>

            {/* Applied For */}
            <Card className="border-slate-100 bg-slate-50/50">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Applied for</p>
                            <p className="font-semibold text-slate-900 mt-0.5">{candidate.appliedFor}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">Applied on</p>
                            <p className="text-slate-900 mt-0.5">{candidate.appliedDate}</p>
                        </div>
                        <div className="flex gap-3">
                            {candidate.linkedin && (
                                <a href={candidate.linkedin.startsWith('http') ? candidate.linkedin : `https://${candidate.linkedin}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">
                                        <Linkedin className="h-4 w-4 mr-2" />
                                        LinkedIn
                                    </Button>
                                </a>
                            )}
                            {candidate.portfolio && (
                                <a href={candidate.portfolio.startsWith('http') ? candidate.portfolio : `https://${candidate.portfolio}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="sm">
                                        <Globe className="h-4 w-4 mr-2" />
                                        Portfolio
                                    </Button>
                                </a>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

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
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === "Overview" && <OverviewTab candidate={candidate} />}
                {activeTab === "Resume" && <ResumeTab candidate={candidate} />}
                {activeTab === "Screening" && <ScreeningTab candidate={candidate} />}
                {activeTab === "AI Analysis" && <AIAnalysisTab candidate={candidate} />}
            </div>
        </div>
    );
}

function OverviewTab({ candidate }: any) {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                    {candidate.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {candidate.skills.map((skill: string) => (
                                <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                    {skill}
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 italic">No skills extracted</p>
                    )}
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Quick Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-600">Total Experience</span>
                        <span className="font-medium text-slate-900">
                            {candidate.experience.length > 0 ? `${candidate.experience.length} roles found` : 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Current/Latest Role</span>
                        <span className="font-medium text-slate-900">
                            {candidate.experience[0]?.title || 'N/A'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Education</span>
                        <span className="font-medium text-slate-900">
                            {candidate.education[0]?.degree || 'N/A'}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">Recent Experience</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {candidate.experience.length > 0 ? (
                            candidate.experience.slice(0, 2).map((exp: any, idx: number) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="mt-1">
                                        <Briefcase className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-900">{exp.title}</p>
                                                <p className="text-sm text-slate-600">{exp.company}</p>
                                            </div>
                                            <span className="text-sm text-slate-500">{exp.duration}</span>
                                        </div>
                                        <p className="text-sm text-slate-700 mt-2">{exp.description}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500 italic">No experience data available</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ResumeTab({ candidate }: any) {
    if (candidate.experience.length === 0 && candidate.education.length === 0) {
        return (
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="py-8 text-center text-slate-500">
                    No parsed resume data available.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Work Experience
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {candidate.experience.map((exp: any, idx: number) => (
                        <div key={idx}>
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-semibold text-slate-900 text-lg">{exp.title}</p>
                                    <p className="text-slate-600">{exp.company}</p>
                                </div>
                                <span className="text-slate-500 text-sm">{exp.duration}</span>
                            </div>
                            <p className="text-slate-700">{exp.description}</p>
                            {idx < candidate.experience.length - 1 && <Separator className="mt-6" />}
                        </div>
                    ))}
                    {candidate.experience.length === 0 && <p className="text-sm text-slate-500">No experience records found.</p>}
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Education
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {candidate.education.map((edu: any, idx: number) => (
                        <div key={idx} className="flex items-start justify-between">
                            <div>
                                <p className="font-semibold text-slate-900">{edu.degree}</p>
                                <p className="text-slate-600">{edu.school}</p>
                            </div>
                            <span className="text-slate-500 text-sm">{edu.year}</span>
                        </div>
                    ))}
                    {candidate.education.length === 0 && <p className="text-sm text-slate-500">No education records found.</p>}
                </CardContent>
            </Card>
        </div>
    );
}

function ScreeningTab({ candidate }: any) {
    if (candidate.screeningQuestions.length === 0) {
        return (
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="py-8 text-center text-slate-500">
                    No screening questions or answers found.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {candidate.screeningQuestions.map((item: any, idx: number) => (
                <Card key={idx} className="border-slate-100 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm font-medium text-slate-600 mb-2">Question {idx + 1}</p>
                                <p className="text-slate-900 font-medium">{item.question}</p>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-sm font-medium text-slate-600 mb-2">Answer</p>
                                <p className="text-slate-700 leading-relaxed">{item.answer}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

function AIAnalysisTab({ candidate }: any) {
    if (!candidate.aiInsights || (candidate.aiInsights.strengths.length === 0 && candidate.aiInsights.concerns.length === 0)) {
        return (
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="py-8 text-center text-slate-500">
                    AI Analysis not available for this candidate yet.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            <Card className="border-emerald-100 bg-emerald-50/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        Strengths
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {candidate.aiInsights.strengths.map((strength: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-700">
                                <span className="text-emerald-600 mt-1">•</span>
                                <span>{strength}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card className="border-amber-100 bg-amber-50/50 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <XCircle className="h-5 w-5 text-amber-600" />
                        Potential Concerns
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        {candidate.aiInsights.concerns.map((concern: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-700">
                                <span className="text-amber-600 mt-1">•</span>
                                <span>{concern}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">AI Recommendation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-slate-900 font-medium">{candidate.aiInsights.recommendation}</p>
                </CardContent>
            </Card>
        </div>
    );
}

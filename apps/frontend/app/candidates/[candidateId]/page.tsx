"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Separator } from "@everleap/design-system";
import { ArrowLeft, Mail, Phone, Linkedin, Globe, MapPin, Calendar, Briefcase, GraduationCap, CheckCircle, XCircle, MessageSquare, Video, Download } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function CandidateDetailPage() {
    const params = useParams();
    const candidateId = params.candidateId as string;
    const [activeTab, setActiveTab] = useState("Overview");

    // Mock candidate data
    const candidate = {
        id: candidateId,
        name: "Sarah Chen",
        email: "sarah.chen@email.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        avatar: "https://i.pravatar.cc/150?u=sarah",
        linkedin: "linkedin.com/in/sarahchen",
        portfolio: "sarahchen.design",
        appliedFor: "Senior Product Manager",
        appliedDate: "Nov 18, 2026",
        stage: "SCREENING",
        matchScore: 92,

        // Resume parsing
        experience: [
            { title: "Product Manager", company: "TechCorp", duration: "2021 - Present", description: "Led product strategy for B2B SaaS platform serving 10k+ users" },
            { title: "Associate PM", company: "StartupCo", duration: "2019 - 2021", description: "Managed feature development and user research" }
        ],
        education: [
            { degree: "MBA", school: "Stanford GSB", year: "2019" },
            { degree: "BS Computer Science", school: "UC Berkeley", year: "2017" }
        ],
        skills: ["Product Strategy", "SQL", "A/B Testing", "User Research", "Agile", "Data Analysis"],

        // Screening
        screeningQuestions: [
            { question: "What's your experience with B2B SaaS products?", answer: "I've spent 4+ years working on B2B SaaS platforms, most recently at TechCorp where I led a product serving enterprise clients. I'm comfortable with complex user workflows and stakeholder management." },
            { question: "Are you comfortable with SQL and data analysis?", answer: "Yes, I use SQL daily to analyze user behavior and make data-driven decisions. I'm proficient in writing complex queries and building dashboards." },
            { question: "What's your expected salary range?", answer: "$140k - $160k" }
        ],

        // AI Analysis
        aiInsights: {
            strengths: [
                "Strong B2B SaaS experience matching role requirements",
                "Proven track record of data-driven decision making",
                "Educational background from top-tier institutions"
            ],
            concerns: [
                "Salary expectation at upper end of budget",
                "No direct mention of product-led growth experience"
            ],
            recommendation: "Strong candidate - recommend advancing to interview stage"
        }
    };

    const TABS = ["Overview", "Resume", "Screening", "AI Analysis"];

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
                        className="h-20 w-20 rounded-full border-2 border-slate-100"
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
                                            className="h-full bg-emerald-500"
                                            style={{ width: `${candidate.matchScore}%` }}
                                        />
                                    </div>
                                    <span className="text-sm font-semibold text-emerald-700">{candidate.matchScore}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Resume
                    </Button>
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
                            <a href={`https://${candidate.linkedin}`} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm">
                                    <Linkedin className="h-4 w-4 mr-2" />
                                    LinkedIn
                                </Button>
                            </a>
                            {candidate.portfolio && (
                                <a href={`https://${candidate.portfolio}`} target="_blank" rel="noopener noreferrer">
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
                    <div className="flex flex-wrap gap-2">
                        {candidate.skills.map((skill: string) => (
                            <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                                {skill}
                            </Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base">Quick Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-slate-600">Total Experience</span>
                        <span className="font-medium text-slate-900">5+ years</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Current Role</span>
                        <span className="font-medium text-slate-900">Product Manager</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Education</span>
                        <span className="font-medium text-slate-900">MBA, Stanford</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-600">Salary Expectation</span>
                        <span className="font-medium text-slate-900">$140k - $160k</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-100 shadow-sm md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-base">Recent Experience</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {candidate.experience.slice(0, 2).map((exp: any, idx: number) => (
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
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function ResumeTab({ candidate }: any) {
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
                </CardContent>
            </Card>
        </div>
    );
}

function ScreeningTab({ candidate }: any) {
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

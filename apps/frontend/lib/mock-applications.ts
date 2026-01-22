import { Candidate, Application, ApplicationStatus, TimelineEvent } from "@/lib/types/candidate";

// Mock Candidates
export const MOCK_CANDIDATE: Candidate = {
    id: "cand_001",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@email.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    resumeUrl: "/resumes/sarah-chen.pdf",
    linkedInUrl: "linkedin.com/in/sarahchen",
    portfolioUrl: "sarahchen.com",
    createdAt: new Date("2026-01-20")
};

// Mock Applications
export const MOCK_APPLICATIONS: Application[] = [
    {
        id: "app_001",
        candidateId: "cand_001",
        jobId: "TR-818",
        status: "INTERVIEW_SCHEDULED",
        appliedAt: new Date("2026-01-15T10:30:00Z"),
        lastUpdated: new Date("2026-01-20T09:00:00Z"),
        resumeUrl: "/resumes/sarah-chen.pdf",
        coverLetter: "I am very excited about this opportunity...",
        screeningAnswers: {
            q1: "I am interested in this position because...",
            q2: "My relevant experience includes..."
        },
        portfolioUrl: "sarahchen.com",
        startDateAvailability: new Date("2026-03-01"),
        salaryExpectation: {
            min: 120000,
            max: 150000
        },
        parsedData: {
            personalInfo: {
                name: "Sarah Chen",
                email: "sarah.chen@email.com",
                phone: "+1 (555) 123-4567",
                location: "San Francisco, CA",
                linkedIn: "linkedin.com/in/sarahchen"
            },
            workExperience: [
                {
                    title: "Senior Product Manager",
                    company: "TechCorp",
                    startDate: new Date("2021-01"),
                    endDate: undefined,
                    current: true,
                    description: "Leading product strategy and development"
                }
            ],
            education: [
                {
                    degree: "Bachelor of Science",
                    field: "Computer Science",
                    institution: "Stanford University",
                    startDate: new Date("2014-09"),
                    endDate: new Date("2018-06")
                }
            ],
            skills: ["JavaScript", "React", "TypeScript", "Node.js", "Product Management"],
            extractedAt: new Date("2026-01-15T10:35:00Z"),
            confidence: 0.95
        },
        timeline: [
            {
                status: "APPLIED",
                timestamp: new Date("2026-01-15T10:30:00Z")
            },
            {
                status: "UNDER_REVIEW",
                timestamp: new Date("2026-01-16T14:00:00Z")
            },
            {
                status: "INTERVIEW_SCHEDULED",
                timestamp: new Date("2026-01-20T09:00:00Z"),
                scheduledFor: new Date("2026-01-25T14:00:00Z"),
                note: "Virtual interview via Zoom"
            }
        ]
    },
    {
        id: "app_002",
        candidateId: "cand_001",
        jobId: "TR-824",
        status: "UNDER_REVIEW",
        appliedAt: new Date("2026-01-20T15:00:00Z"),
        lastUpdated: new Date("2026-01-21T10:00:00Z"),
        resumeUrl: "/resumes/sarah-chen.pdf",
        screeningAnswers: {
            q1: "DevOps has always been my passion...",
            q2: "I have 3 years of cloud infrastructure experience..."
        },
        timeline: [
            {
                status: "APPLIED",
                timestamp: new Date("2026-01-20T15:00:00Z")
            },
            {
                status: "UNDER_REVIEW",
                timestamp: new Date("2026-01-21T10:00:00Z")
            }
        ]
    }
];

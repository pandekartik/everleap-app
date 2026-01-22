export interface Candidate {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    location?: string;
    resumeUrl?: string;
    linkedInUrl?: string;
    portfolioUrl?: string;
    createdAt: Date;
}

export interface Application {
    id: string;
    candidateId: string;
    jobId: string;
    status: ApplicationStatus;
    appliedAt: Date;
    lastUpdated: Date;

    // Application data
    resumeUrl: string;
    coverLetter?: string;
    screeningAnswers: Record<string, string>;
    portfolioUrl?: string;
    startDateAvailability?: Date;
    salaryExpectation?: {
        min: number;
        max: number;
    };

    // Parsed resume data (AI)
    parsedData?: ParsedResumeData;

    // Timeline
    timeline: TimelineEvent[];
}

export interface ParsedResumeData {
    personalInfo: PersonalInfo;
    workExperience: WorkExperience[];
    education: Education[];
    skills: string[];
    certifications?: Certification[];
    extractedAt: Date;
    confidence: number;
}

export interface PersonalInfo {
    name: string;
    email: string;
    phone?: string;
    location?: string;
    linkedIn?: string;
    website?: string;
}

export interface WorkExperience {
    title: string;
    company: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description: string;
    achievements?: string[];
}

export interface Education {
    degree: string;
    field: string;
    institution: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    gpa?: number;
}

export interface Certification {
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialId?: string;
}

export type ApplicationStatus =
    | "DRAFT"
    | "APPLIED"
    | "UNDER_REVIEW"
    | "SCREENING"
    | "INTERVIEW_SCHEDULED"
    | "INTERVIEW_COMPLETED"
    | "OFFER_EXTENDED"
    | "HIRED"
    | "REJECTED"
    | "WITHDRAWN";

export interface TimelineEvent {
    status: ApplicationStatus;
    timestamp: Date;
    note?: string;
    scheduledFor?: Date; // For interviews
}

export type RoleStatus = "OPEN" | "CLOSED" | "PAUSED" | "DRAFT";

export interface Role {
    id: string;
    title: string;
    department: string;
    location: string;
    createdDate: string;
    createdBy: string;
    candidateCount: number;
    status: RoleStatus;
}

export const MOCK_ROLES: Role[] = [
    {
        id: "TR-817",
        title: "Senior UX Designer",
        department: "Engineering",
        location: "Pune",
        createdDate: "Jan 01, 2026",
        createdBy: "Shivachaitanya R.",
        candidateCount: 2,
        status: "CLOSED"
    },
    {
        id: "TR-818",
        title: "Product Manager",
        department: "Product",
        location: "Bangalore",
        createdDate: "Feb 15, 2026",
        createdBy: "Aditi Sharma",
        candidateCount: 4,
        status: "OPEN"
    },
    {
        id: "TR-824",
        title: "DevOps Engineer",
        department: "Engineering",
        location: "Ahmedabad",
        createdDate: "Aug 25, 2026",
        createdBy: "Neha Joshi",
        candidateCount: 4,
        status: "OPEN"
    },
    {
        id: "TR-821",
        title: "Data Scientist",
        department: "Data",
        location: "Mumbai",
        createdDate: "May 20, 2026",
        createdBy: "Vikram Singh",
        candidateCount: 1,
        status: "OPEN"
    },
    {
        id: "TR-823",
        title: "Backend Developer",
        department: "Engineering",
        location: "Kochi",
        createdDate: "Jul 10, 2026",
        createdBy: "Aniket R.",
        candidateCount: 2,
        status: "PAUSED"
    },
    {
        id: "TR-829",
        title: "Frontend Developer",
        department: "Engineering",
        location: "Hyderabad",
        createdDate: "Mar 10, 2026",
        createdBy: "Rahul Mehta",
        candidateCount: 3,
        status: "PAUSED"
    },
    {
        id: "TR-827",
        title: "Graphic Designer",
        department: "Design",
        location: "Pune",
        createdDate: "Nov 20, 2026",
        createdBy: "Maya K.",
        candidateCount: 2,
        status: "OPEN"
    },
];

export type CandidateStatus = "APPLIED" | "SCREENING" | "INTERVIEW" | "OFFER" | "HIRED" | "REJECTED";

export interface Candidate {
    id: string;
    name: string;
    role: string;
    roleId: string;
    stage: CandidateStatus;
    appliedDate: string;
    score: number; // AI Score 1-100
    email: string;
    avatarUrl: string;
}

export const MOCK_CANDIDATES: Candidate[] = [
    {
        id: "c_001",
        name: "Rohan Gupta",
        role: "Product Manager",
        roleId: "TR-818",
        stage: "INTERVIEW",
        appliedDate: "Feb 18, 2026",
        score: 88,
        email: "rohan.g@gmail.com",
        avatarUrl: "https://i.pravatar.cc/150?u=rohan"
    },
    {
        id: "c_002",
        name: "Sriya Patel",
        role: "Product Manager",
        roleId: "TR-818",
        stage: "SCREENING",
        appliedDate: "Feb 20, 2026",
        score: 92,
        email: "sriya.p@gmail.com",
        avatarUrl: "https://i.pravatar.cc/150?u=sriya"
    },
    {
        id: "c_003",
        name: "Amit Kumar",
        role: "DevOps Engineer",
        roleId: "TR-824",
        stage: "APPLIED",
        appliedDate: "Aug 26, 2026",
        score: 75,
        email: "amit.k@gmail.com",
        avatarUrl: "https://i.pravatar.cc/150?u=amit"
    },
    {
        id: "c_004",
        name: "Priya Singh",
        role: "Graphic Designer",
        roleId: "TR-827",
        stage: "OFFER",
        appliedDate: "Nov 22, 2026",
        score: 95,
        email: "priya.s@gmail.com",
        avatarUrl: "https://i.pravatar.cc/150?u=priya"
    }
];

export interface Interview {
    id: string;
    candidateId: string;
    candidateName: string;
    role: string;
    type: "Screening" | "Technical" | "Cultural" | "Final";
    date: string;
    time: string;
    interviewer: string;
    status: "Scheduled" | "Completed" | "Cancelled";
    avatarUrl: string;
}

export const MOCK_INTERVIEWS: Interview[] = [
    {
        id: "int_001",
        candidateId: "c_001",
        candidateName: "Rohan Gupta",
        role: "Product Manager",
        type: "Technical",
        date: "Today",
        time: "2:00 PM",
        interviewer: "Aditi Sharma",
        status: "Scheduled",
        avatarUrl: "https://i.pravatar.cc/150?u=rohan"
    },
    {
        id: "int_002",
        candidateId: "c_002",
        candidateName: "Sriya Patel",
        role: "Product Manager",
        type: "Screening",
        date: "Tomorrow",
        time: "11:00 AM",
        interviewer: "AI Agent",
        status: "Scheduled",
        avatarUrl: "https://i.pravatar.cc/150?u=sriya"
    }
];

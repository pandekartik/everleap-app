"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "SUPER_ADMIN" | "ORG_ADMIN" | "HR_ADMIN" | "HIRING_MANAGER" | "RECRUITER" | "INTERVIEWER" | "CANDIDATE";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatarUrl?: string;
    orgId?: string; // Optional for Superadmin, required for Org users
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (role: UserRole) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS: Record<UserRole, User> = {
    SUPER_ADMIN: {
        id: "usr_super_01",
        name: "Kartik (Founder)",
        email: "kartik@everleap.ai",
        role: "SUPER_ADMIN",
        avatarUrl: "https://i.pravatar.cc/150?u=kartik"
    },
    ORG_ADMIN: {
        id: "usr_org_admin_01",
        name: "Steve IT (Org Owner)",
        email: "steve@acme.inc",
        role: "ORG_ADMIN",
        avatarUrl: "https://i.pravatar.cc/150?u=steve",
        orgId: "org_acme"
    },
    HR_ADMIN: {
        id: "usr_hr_admin_01",
        name: "Sarah Head of Talent",
        email: "sarah@acme.inc",
        role: "HR_ADMIN",
        avatarUrl: "https://i.pravatar.cc/150?u=sarah",
        orgId: "org_acme"
    },
    HIRING_MANAGER: {
        id: "usr_manager_01",
        name: "Mike Manager",
        email: "mike@acme.inc",
        role: "HIRING_MANAGER",
        avatarUrl: "https://i.pravatar.cc/150?u=mike",
        orgId: "org_acme"
    },
    RECRUITER: {
        id: "usr_recruiter_01",
        name: "Rachel Recruiter",
        email: "rachel@acme.inc",
        role: "RECRUITER",
        avatarUrl: "https://i.pravatar.cc/150?u=rachel",
        orgId: "org_acme"
    },
    INTERVIEWER: {
        id: "usr_interviewer_01",
        name: "Ian Interviewer",
        email: "ian@acme.inc",
        role: "INTERVIEWER",
        avatarUrl: "https://i.pravatar.cc/150?u=ian",
        orgId: "org_acme"
    },
    CANDIDATE: {
        id: "usr_candidate_01",
        name: "Sarah Chen",
        email: "sarah.chen@email.com",
        role: "CANDIDATE",
        avatarUrl: "https://i.pravatar.cc/150?u=sarahchen"
    }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Hydrate from local storage
        const stored = localStorage.getItem("everleap_demo_user");
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse auth user", e);
            }
        }
        setIsLoading(false);
    }, []);

    const login = (role: UserRole) => {
        const demoUser = DEMO_USERS[role];
        setUser(demoUser);
        localStorage.setItem("everleap_demo_user", JSON.stringify(demoUser));

        if (role === "SUPER_ADMIN") {
            router.push("/admin/clients");
        } else if (role === "CANDIDATE") {
            router.push("/candidate/dashboard");
        } else if (role === "ORG_ADMIN") {
            router.push("/dashboard");
        } else {
            router.push("/dashboard");
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("everleap_demo_user");
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

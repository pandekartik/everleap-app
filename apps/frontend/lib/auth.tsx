"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
import { toast } from "sonner";

export type UserRole = "SUPER_ADMIN" | "ORG_ADMIN" | "HR_ADMIN" | "HIRING_MANAGER" | "RECRUITER" | "INTERVIEWER" | "CANDIDATE";

export interface User {
    id: string;
    email: string;
    full_name: string;
    phone?: string;
    roles: UserRole[];
    company_id?: string;
    avatarUrl?: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    registerCandidate: (data: any) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to normalize backend roles to frontend definitions
const normalizeUser = (userData: any): User => {
    if (!userData) return userData;
    const roles = userData.roles || [];
    const normalizedRoles = roles.map((r: string) => {
        if (r === "ADMIN") return "ORG_ADMIN";
        if (r === "HR") return "HR_ADMIN";
        return r;
    });
    return { ...userData, roles: normalizedRoles };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("everleap_access_token");
            if (token) {
                try {
                    const { data } = await api.get("/auth/me");
                    setUser(normalizeUser(data));
                } catch (error: any) {
                    console.error("Failed to fetch user", error);
                    // Only clear token if it's a 401 or 403, otherwise it might be a network error
                    if (error.response?.status === 401 || error.response?.status === 403) {
                        localStorage.removeItem("everleap_access_token");
                        localStorage.removeItem("everleap_refresh_token");
                    }
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { data } = await api.post("/auth/login", { email, password });

            localStorage.setItem("everleap_access_token", data.access_token);
            localStorage.setItem("everleap_refresh_token", data.refresh_token);

            const normalizedUser = normalizeUser(data.user);
            setUser(normalizedUser);

            const roles = normalizedUser.roles || [];
            if (roles.includes("SUPER_ADMIN")) {
                router.push("/platform-dashboard");
            } else if (roles.includes("CANDIDATE")) {
                router.push("/my-applications");
            } else {
                router.push("/dashboard");
            }
            toast.success("Welcome back!");
        } catch (error: any) {
            console.error("Login failed", error);
            const message = error.response?.data?.detail || "Invalid email or password";
            toast.error(message);
            throw error;
        }
    };

    const registerCandidate = async (registrationData: any) => {
        try {
            await api.post("/auth/register", registrationData);
            // explicitely not logging in automatically as per new requirements
        } catch (error: any) {
            console.error("Registration failed", error);
            const message = error.response?.data?.detail || "Registration failed";
            toast.error(message);
            throw error;
        }
    }

    const requestPasswordReset = async (email: string) => {
        try {
            await api.post("/auth/request-password-reset", { email });
            toast.success("If an account exists with this email, you will receive a password reset link.");
        } catch (error: any) {
            console.error("Password reset request failed", error);
            // We should still populate success message or generic error to prevent enumeration, 
            // but for now let's just log and show a safe message or the detail if valid.
            // The backend returns success even if email not found, so this catch block implies network/server error.
            const message = error.response?.data?.detail || "Failed to send reset request.";
            toast.error(message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem("everleap_refresh_token");
            if (refreshToken) {
                await api.post("/auth/logout", { refresh_token: refreshToken });
            }
        } catch (e) {
            console.error("Logout error", e);
        }

        setUser(null);
        localStorage.removeItem("everleap_access_token");
        localStorage.removeItem("everleap_refresh_token");
        router.push("/login");
        toast.info("Logged out successfully");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, registerCandidate, requestPasswordReset }}>
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

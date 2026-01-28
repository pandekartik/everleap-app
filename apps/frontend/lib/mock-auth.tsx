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
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    registerCandidate: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
                    setUser(data);
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    localStorage.removeItem("everleap_access_token");
                    localStorage.removeItem("everleap_refresh_token");
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

            setUser(data.user);

            const roles = data.user.roles || [];
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
            const { data } = await api.post("/auth/register", registrationData);

            localStorage.setItem("everleap_access_token", data.access_token);
            localStorage.setItem("everleap_refresh_token", data.refresh_token);

            // Re-fetch user to get full profile if needed, or assume data.user is returned if API changes.
            // Based on schemas, register returns tokens. We might need to fetch /me or just trust tokens work.
            // Let's fetch /me to be sure we have the user state correct.
            const userResponse = await api.get("/auth/me");
            setUser(userResponse.data);

            router.push("/my-applications");
            toast.success("Account created successfully!");
        } catch (error: any) {
            console.error("Registration failed", error);
            const message = error.response?.data?.detail || "Registration failed";
            toast.error(message);
            throw error;
        }
    }

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
        <AuthContext.Provider value={{ user, isLoading, login, logout, registerCandidate }}>
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

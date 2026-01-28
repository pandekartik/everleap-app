"use client";

import { Sidebar } from "./Sidebar";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Shell({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className="min-h-screen bg-background">
            <Sidebar />
            <main className="pl-64 min-h-screen">
                <div className="container mx-auto p-8 max-w-[1600px]">
                    {children}
                </div>
            </main>
        </div>
    );
}

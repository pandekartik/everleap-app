"use client";

import { useAuth } from "@/lib/mock-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push("/login");
            } else if (user.role !== "SUPER_ADMIN") {
                // If logged in but not superadmin, bounce them to their app
                router.push("/hiring");
            }
        }
    }, [user, isLoading, router]);

    if (isLoading) return null;

    if (!user || user.role !== "SUPER_ADMIN") return null;

    return (
        <div className="min-h-screen bg-background flex">
            <AdminSidebar />
            <main className="flex-1 pl-64 min-h-screen bg-slate-50/50">
                <div className="container mx-auto p-8 max-w-[1600px]">
                    {children}
                </div>
            </main>
        </div>
    );
}

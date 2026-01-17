import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Role, UserProfile } from "@/lib/types";
import { notFound } from "next/navigation";

export default async function DashboardLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ role: string }>;
}) {
    const { role } = await params;

    if (role !== "super-admin" && role !== "hr") {
        notFound();
    }

    const userRole = role as Role;

    const users: Record<Role, UserProfile> = {
        "super-admin": {
            name: "Admin User",
            role: "super-admin",
            designation: "Super Administrator",
            companyName: "Everleap",
        },
        "hr": {
            name: "HR Manager",
            role: "hr",
            designation: "Senior HR",
            companyName: "Everleap",
        },
    };

    const currentUser = users[userRole];

    return (
        <div className="min-h-screen bg-secondary/30">
            <Sidebar role={userRole} />
            <Topbar user={currentUser} title="Dashboard" subtitle={`Welcome to the ${currentUser.designation} panel`} />
            <main className="pl-64 pt-16">
                <div className="container mx-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

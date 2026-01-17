import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Role, UserProfile } from "@/lib/types";

interface DashboardShellProps {
    children: React.ReactNode;
    role: Role;
    user: UserProfile;
    title: string;
    subtitle?: string;
}

export function DashboardShell({ children, role, user, title, subtitle }: DashboardShellProps) {
    return (
        <div className="min-h-screen bg-secondary/30">
            <Sidebar role={role} />
            <Topbar user={user} title={title} subtitle={subtitle} />
            <main className="pl-64 pt-16">
                <div className="container mx-auto p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}

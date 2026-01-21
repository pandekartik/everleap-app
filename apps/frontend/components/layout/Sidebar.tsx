"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Calendar,
    FileSignature,
    Rocket,
    Building2,
    BarChart3,
    Settings,
    LogOut
} from "lucide-react";
import { cn } from "@everleap/design-system/lib/utils";
import { Button } from "@everleap/design-system";
import { useAuth } from "@/lib/mock-auth";

const NAV_ITEMS = [
    // HR / Recruiter Views
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["HR_ADMIN", "HIRING_MANAGER", "RECRUITER"] },
    { name: "Hiring", href: "/hiring", icon: Briefcase, roles: ["HR_ADMIN", "HIRING_MANAGER", "RECRUITER"] },
    { name: "Candidates", href: "/candidates", icon: Users, roles: ["HR_ADMIN", "HIRING_MANAGER", "RECRUITER"] },
    { name: "Interviews", href: "/interviews", icon: Calendar, roles: ["HR_ADMIN", "HIRING_MANAGER", "INTERVIEWER"] },
    { name: "Offers", href: "/offers", icon: FileSignature, roles: ["HR_ADMIN"] },
    { name: "Onboarding", href: "/onboarding", icon: Rocket, roles: ["HR_ADMIN", "HIRING_MANAGER"] },

    // Shared / Org Admin Views
    { name: "Employees", href: "/employees", icon: Building2, roles: ["ORG_ADMIN", "HR_ADMIN"] },

    // Org Admin Specific
    { name: "Billing & Plans", href: "/billing", icon: FileSignature, roles: ["ORG_ADMIN"] },

    // Settings (Context Aware)
    { name: "Reports", href: "/reports", icon: BarChart3, roles: ["HR_ADMIN", "ORG_ADMIN"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["ORG_ADMIN", "HR_ADMIN"] },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Default to strict empty if no user, but should be handled by Shell
    const userRole = user?.role || "GUEST";

    return (
        <div className="w-64 border-r border-slate-100 h-screen bg-card flex flex-col fixed left-0 top-0 z-50">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <img src="/Logo.svg" alt="Everleap" className="h-6 w-auto" />
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {NAV_ITEMS.filter(item => item.roles.includes(userRole)).map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 mb-1 font-medium",
                                    isActive ? "text-primary bg-primary/10 hover:bg-primary/15" : "text-muted-foreground"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                {item.name}
                            </Button>
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <img
                        src={user?.avatarUrl || "https://i.pravatar.cc/150"}
                        className="h-8 w-8 rounded-full bg-muted border"
                        alt="User"
                    />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.name || "Demo User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.role || "Guest"}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={logout}>
                    <LogOut className="h-3 w-3 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}

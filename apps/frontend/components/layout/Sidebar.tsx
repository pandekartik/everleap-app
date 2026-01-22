"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Calendar,
    FileSignature,
    Building2,
    BarChart3,
    Settings,
    LogOut
} from "lucide-react";
import { cn } from "@everleap/design-system/lib/utils";
import { Button } from "@everleap/design-system";
import { useAuth } from "@/lib/mock-auth";

const NAV_ITEMS = [
    // COMMAND CENTER
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["HR_ADMIN", "RECRUITER", "ORG_ADMIN"], section: "command" },

    // HIRING EXECUTION
    { type: "divider", section: "hiring", label: "HIRING", roles: ["HR_ADMIN", "RECRUITER"] },
    { name: "Jobs", href: "/hiring", icon: Briefcase, roles: ["HR_ADMIN", "RECRUITER"], section: "hiring" },
    { name: "Candidates", href: "/candidates", icon: Users, roles: ["HR_ADMIN", "RECRUITER"], section: "hiring" },

    // PIPELINE
    { type: "divider", section: "pipeline", label: "PIPELINE", roles: ["HR_ADMIN", "INTERVIEWER"] },
    { name: "Interviews", href: "/interviews", icon: Calendar, roles: ["HR_ADMIN", "INTERVIEWER"], section: "pipeline" },
    { name: "Offers", href: "/offers", icon: FileSignature, roles: ["HR_ADMIN"], section: "pipeline" },

    // CANDIDATE NAVIGATION
    { type: "divider", section: "candidate", label: "MY APPLICATIONS", roles: ["CANDIDATE"] },
    { name: "Dashboard", href: "/candidate/dashboard", icon: LayoutDashboard, roles: ["CANDIDATE"], section: "candidate" },
    { name: "My Profile", href: "/candidate/profile", icon: Users, roles: ["CANDIDATE"], section: "candidate" },

    // SETTINGS
    { type: "divider", section: "settings", label: "SETTINGS", roles: ["HR_ADMIN", "ORG_ADMIN"] },
    { name: "Settings", href: "/settings", icon: Settings, roles: ["ORG_ADMIN", "HR_ADMIN"], section: "settings" },

    // ORG ADMIN ONLY
    { type: "divider", section: "org-admin", label: "ORGANIZATION", roles: ["ORG_ADMIN"] },
    { name: "Employees", href: "/employees", icon: Building2, roles: ["ORG_ADMIN"], section: "org-admin" },
    { name: "Billing & Plans", href: "/billing", icon: FileSignature, roles: ["ORG_ADMIN"], section: "org-admin" },
    { name: "Reports", href: "/reports", icon: BarChart3, roles: ["ORG_ADMIN"], section: "org-admin" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    // Default to strict empty if no user, but should be handled by Shell
    const userRole = user?.role || "GUEST";

    // Filter items based on role and determine which dividers to show
    const filteredItems = NAV_ITEMS.filter(item => {
        if (item.type === "divider") {
            // Show divider only if there are visible items in that section
            return NAV_ITEMS.some(navItem =>
                navItem.section === item.section &&
                navItem.type !== "divider" &&
                navItem.roles.includes(userRole)
            );
        }
        return item.roles?.includes(userRole);
    });

    return (
        <div className="w-64 border-r border-slate-100 h-screen bg-card flex flex-col fixed left-0 top-0 z-50">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <Link href={userRole === "CANDIDATE" ? "/candidate/dashboard" : "/dashboard"} className="flex items-center gap-2">
                    <img src="/Logo.svg" alt="Everleap" className="h-6 w-auto" />
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {filteredItems.map((item, index) => {
                    if (item.type === "divider") {
                        return (
                            <div key={`divider-${item.section}`} className={`px-3 pt-4 pb-2 ${index > 0 ? 'mt-2' : ''}`}>
                                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                    {item.label}
                                </p>
                            </div>
                        );
                    }

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

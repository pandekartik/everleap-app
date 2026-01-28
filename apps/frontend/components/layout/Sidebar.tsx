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
import {
    Button,
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@everleap/design-system";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

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

    // PLATFORM ADMIN
    { type: "divider", section: "platform", label: "PLATFORM", roles: ["SUPER_ADMIN"] },
    { name: "Dashboard", href: "/platform-dashboard", icon: LayoutDashboard, roles: ["SUPER_ADMIN"], section: "platform" },
    { name: "Clients", href: "/clients", icon: Building2, roles: ["SUPER_ADMIN"], section: "platform" },
    { name: "System Health", href: "/system", icon: BarChart3, roles: ["SUPER_ADMIN"], section: "platform" },

    // BILLING & PLANS
    { type: "divider", section: "billing", label: "BILLING & PLANS", roles: ["SUPER_ADMIN"] },
    { name: "Plans", href: "/plans", icon: FileSignature, roles: ["SUPER_ADMIN"], section: "billing" },
    { name: "Coupons", href: "/coupons", icon: FileSignature, roles: ["SUPER_ADMIN"], section: "billing" },

    // CANDIDATE NAVIGATION
    { type: "divider", section: "candidate", label: "MY APPLICATIONS", roles: ["CANDIDATE"] },
    { name: "My Applications", href: "/my-applications", icon: LayoutDashboard, roles: ["CANDIDATE"], section: "candidate" },
    { name: "Profile", href: "/profile", icon: Users, roles: ["CANDIDATE"], section: "candidate" },

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
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    // Default to strict empty if no user, but should be handled by Shell
    const userRole = user?.roles?.[0] || "GUEST";

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
                <Link href={
                    userRole === "SUPER_ADMIN" ? "/admin/dashboard" :
                        userRole === "CANDIDATE" ? "/candidate/dashboard" :
                            "/dashboard"
                } className="flex items-center gap-2">
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
                    {user?.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            className="h-8 w-8 rounded-full bg-muted border"
                            alt="User"
                        />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                            {user?.full_name
                                ? user.full_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                                : user?.email?.substring(0, 2).toUpperCase() || "U"}
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.full_name || "Demo User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.roles?.[0] || "Guest"}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => setShowLogoutDialog(true)}>
                    <LogOut className="h-3 w-3 mr-2" />
                    Sign Out
                </Button>
            </div>

            <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sign out</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to sign out?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>Cancel</Button>
                        <Button onClick={logout}>Sign out</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

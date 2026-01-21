"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/mock-auth";
import { cn } from "@everleap/design-system/lib/utils";
import {
    LayoutDashboard,
    Users,
    Settings,
    Building2,
    Activity,
    LogOut
} from "lucide-react";
import { Button } from "@everleap/design-system";

const ADMIN_NAV_ITEMS = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard },
    { name: "Clients", href: "/admin/clients", icon: Building2 },
    { name: "Platform Jobs", href: "/admin/jobs", icon: Activity },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    return (
        <div className="w-64 border-r border-slate-100 bg-card flex flex-col fixed left-0 top-0 z-50 h-screen">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <Link href="/admin" className="flex items-center gap-2">
                    <img src="/Logo.svg" alt="Everleap" className="h-6 w-auto" />
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {ADMIN_NAV_ITEMS.map((item) => {
                    // Fix: treat root "/admin" strictly, others as prefixes
                    const isActive = item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);

                    return (
                        <Link key={item.href} href={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className={cn(
                                    "w-full justify-start gap-3 mb-1 font-medium",
                                    isActive ? "text-primary bg-primary/10 hover:bg-primary/15" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-slate-400")} />
                                {item.name}
                            </Button>
                        </Link>
                    );
                })}
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <img
                        src={user?.avatarUrl || "https://i.pravatar.cc/150"}
                        alt="User"
                        className="h-8 w-8 rounded-full border border-slate-200"
                    />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-700" onClick={logout}>
                    <LogOut className="mr-2 h-3 w-3" />
                    Sign out
                </Button>
            </div>
        </div>
    );
}

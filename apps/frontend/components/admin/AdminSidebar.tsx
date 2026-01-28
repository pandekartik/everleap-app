"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { cn } from "@everleap/design-system/lib/utils";
import {
    LayoutDashboard,
    Building2,
    BarChart3,
    FileSignature,
    LogOut
} from "lucide-react";
import {
    Button,
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from "@everleap/design-system";
import { useState } from "react";

const ADMIN_NAV_ITEMS = [
    // PLATFORM
    { type: "divider", label: "PLATFORM" },
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Clients", href: "/admin/clients", icon: Building2 },
    { name: "System Health", href: "/admin/system", icon: BarChart3 },

    // BILLING & PLANS
    { type: "divider", label: "BILLING & PLANS" },
    { name: "Plans", href: "/admin/plans", icon: FileSignature },
    { name: "Coupons", href: "/admin/coupons", icon: FileSignature },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    return (
        <div className="w-64 border-r border-slate-100 bg-card flex flex-col fixed left-0 top-0 z-50 h-screen">
            {/* Header */}
            <div className="h-16 flex items-center px-6 border-b border-slate-100">
                <Link href="/admin/dashboard" className="flex items-center gap-2">
                    <img src="/Logo.svg" alt="Everleap" className="h-6 w-auto" />
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {ADMIN_NAV_ITEMS.map((item, index) => {
                    if (item.type === "divider") {
                        return (
                            <div key={`divider-${index}`} className={`px-3 pt-4 pb-2 ${index > 0 ? 'mt-2' : ''}`}>
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
                    {user?.avatarUrl ? (
                        <img
                            src={user.avatarUrl}
                            alt="User"
                            className="h-8 w-8 rounded-full border border-slate-200"
                        />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs border border-primary/20">
                            {user?.full_name
                                ? user.full_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                                : user?.email?.substring(0, 2).toUpperCase() || "U"}
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{user?.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" className="w-full text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-700" onClick={() => setShowLogoutDialog(true)}>
                    <LogOut className="mr-2 h-3 w-3" />
                    Sign out
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EverleapLogo, cn } from "@everleap/design-system";
import { LayoutDashboard, Users, UserCog, Settings, FileText, Briefcase } from "lucide-react";
import { NavItem, Role } from "@/lib/types";

interface SidebarProps {
    role: Role;
}

export function Sidebar({ role }: SidebarProps) {
    const pathname = usePathname();

    // Define navigation items based on requirements or generic ones for now
    const navItems: NavItem[] = [
        {
            title: "Dashboard",
            href: `/dashboard/${role}`,
            icon: LayoutDashboard,
            role: ["super-admin", "hr"],
        },
        {
            title: "Employees",
            href: `/dashboard/${role}/employees`,
            icon: Users,
            role: ["hr", "super-admin"],
        },
        {
            title: "Recruitment",
            href: `/dashboard/${role}/recruitment`,
            icon: Briefcase,
            role: ["hr"],
        },
        {
            title: "Admin Management",
            href: `/dashboard/${role}/admins`,
            icon: UserCog,
            role: ["super-admin"],
        },
        {
            title: "Reports",
            href: `/dashboard/${role}/reports`,
            icon: FileText,
            role: ["super-admin", "hr"],
        },
        {
            title: "Settings",
            href: `/dashboard/${role}/settings`,
            icon: Settings,
            role: ["super-admin", "hr"],
        },
    ];

    const filteredNavItems = navItems.filter(
        (item) => !item.role || item.role.includes(role)
    );

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background">
            <div className="flex h-16 items-center border-b px-6">
                <div className="w-32">
                    <EverleapLogo className="h-8 w-auto text-primary" />
                </div>
            </div>
            <nav className="flex flex-col gap-2 p-4">
                {filteredNavItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-muted",
                                isActive ? "bg-primary/10 text-primary hover:bg-primary/15" : "text-muted-foreground"
                            )}
                        >
                            {item.icon && <item.icon className="h-4 w-4" />}
                            {item.title}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}

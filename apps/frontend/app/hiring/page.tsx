"use client";

import { Button, Input } from "@everleap/design-system";
import { Search, Filter, SlidersHorizontal, CheckCircle2, Circle, PauseCircle, FileEdit } from "lucide-react";
import { StatsRow } from "@/components/hiring/StatsRow";
import { RolesTable } from "@/components/hiring/RolesTable";
import { CreateRoleDialog } from "@/components/hiring/CreateRoleDialog";
import { cn } from "@everleap/design-system/lib/utils";

export default function HiringPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold tracking-tight">Hiring</h1>
                    <div className="hidden md:flex items-center p-1 bg-muted rounded-lg border border-slate-100">
                        <TabButton label="All" count={120} active icon={null} />
                        <TabButton label="Open" count={NaN} active={false} icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
                        <TabButton label="Pause" count={NaN} active={false} icon={<PauseCircle className="h-3.5 w-3.5" />} />
                        <TabButton label="Closed" count={NaN} active={false} icon={<CheckCircle2 className="h-3.5 w-3.5" />} />
                        <TabButton label="Draft" count={NaN} active={false} icon={<FileEdit className="h-3.5 w-3.5" />} />
                    </div>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-[300px]">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search roles..."
                            className="pl-9 bg-card"
                        />
                    </div>
                    <CreateRoleDialog />
                </div>
            </div>

            {/* Content */}
            <div>
                <StatsRow />
                <RolesTable />
            </div>
        </div>
    );
}

function TabButton({ label, count, active, icon }: { label: string, count: number, active: boolean, icon: React.ReactNode }) {
    return (
        <button className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-all",
            active ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
        )}>
            {icon}
            {label}
            {!isNaN(count) && (
                <span className={cn(
                    "ml-1 text-xs px-1.5 py-0.5 rounded-full",
                    active ? "bg-primary-foreground/20" : "bg-muted-foreground/10"
                )}>
                    {count}
                </span>
            )}
        </button>
    )
}

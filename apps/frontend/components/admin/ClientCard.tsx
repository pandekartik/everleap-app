"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Progress, Badge } from "@everleap/design-system";
import { CheckCircle2, Circle, Building2, Users, Briefcase, DollarSign, ExternalLink, ShieldAlert, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";

interface ClientCardProps {
    id: string;
    name: string;
    adminEmail: string;
    plan: "Starter" | "Professional" | "Enterprise";
    status: "ACTIVE" | "TRIAL" | "SUSPENDED" | "CHURNED";
    users: number;
    mrr: number;
    health: number;
    activeJobs: number;
    joinedDate: string;
}

export function ClientCard({ id, name, adminEmail, plan, status, users, mrr, health, activeJobs, joinedDate }: ClientCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "ACTIVE": return "bg-emerald-500";
            case "TRIAL": return "bg-blue-500";
            case "SUSPENDED": return "bg-red-500";
            case "CHURNED": return "bg-slate-400";
            default: return "bg-slate-500";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "ACTIVE": return "Active";
            case "TRIAL": return "Trial";
            case "SUSPENDED": return "Suspended";
            case "CHURNED": return "Churned";
            default: return status;
        }
    };

    const getPlanColor = (plan: string) => {
        switch (plan) {
            case "Enterprise": return "bg-purple-100 text-purple-700 border-purple-200";
            case "Professional": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Starter": return "bg-slate-100 text-slate-700 border-slate-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const getHealthColor = (health: number) => {
        if (health >= 80) return "text-emerald-600";
        if (health >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <Card className="border-slate-100 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-50">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                {name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg">{name}</CardTitle>
                                    <Badge className={`${getStatusColor(status)} text-white`}>
                                        {getStatusLabel(status)}
                                    </Badge>
                                    <Badge variant="outline" className={getPlanColor(plan)}>
                                        {plan}
                                    </Badge>
                                </div>
                                <p className="text-sm text-slate-500">{adminEmail} • Joined {joinedDate}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className={`text-2xl font-bold ${getHealthColor(health)}`}>{health}%</span>
                        <p className="text-xs text-slate-400">Health</p>
                    </div>
                </div>
                <Progress value={health} className="h-2 mt-3" />
            </CardHeader>
            <CardContent className="pt-6">
                <div className="grid gap-4 md:grid-cols-4 mb-6">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-900">{users} Users</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-900">${mrr.toLocaleString()} MRR</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-900">{activeJobs} Active Jobs</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium text-slate-500 font-mono text-xs">{id}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-50">
                    <Link href={`/admin/clients/${id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="h-8 w-full">
                            <Building2 className="mr-2 h-3 w-3" /> View Details
                        </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="h-8">
                        <ExternalLink className="mr-2 h-3 w-3" /> Login As
                    </Button>
                    <Button variant="outline" size="sm" className="h-8">
                        <SettingsIcon className="mr-2 h-3 w-3" /> Manage
                    </Button>
                    {status === "ACTIVE" ? (
                        <Button variant="outline" size="sm" className="h-8 text-red-600 hover:bg-red-50">
                            <ShieldAlert className="mr-2 h-3 w-3" /> Suspend
                        </Button>
                    ) : status === "SUSPENDED" ? (
                        <Button variant="outline" size="sm" className="h-8 text-green-600 hover:bg-green-50">
                            <CheckCircle2 className="mr-2 h-3 w-3" /> Activate
                        </Button>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
}

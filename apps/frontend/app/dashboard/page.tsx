"use client";

import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@everleap/design-system";
import {
    Users,
    Briefcase,
    Calendar,
    TrendingUp,
    ArrowRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
    const { user } = useAuth();
    const firstName = user?.full_name?.split(" ")[0] || "User";

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Good morning, {firstName}</h1>
                    <p className="text-slate-500 mt-1">
                        {user?.roles.includes("ORG_ADMIN")
                            ? "Here is your organization's overview and usage status."
                            : "Here's what's happening with your hiring pipeline today."}
                    </p>
                </div>
                <div className="flex gap-3">
                    {!user?.roles.includes("ORG_ADMIN") && (
                        <Link href="/hiring/create">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create Job
                            </Button>
                        </Link>
                    )}
                    {user?.roles.includes("ORG_ADMIN") && (
                        <Link href="/employees">
                            <Button>
                                <Users className="mr-2 h-4 w-4" />
                                Manage Users
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            {/* Org Admin View */}
            {user?.roles.includes("ORG_ADMIN") ? (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                        <MetricCard
                            title="Active Users"
                            value="42"
                            trend="+3 this month"
                            icon={Users}
                            trendColor="text-emerald-600"
                        />
                        <MetricCard
                            title="Storage Used"
                            value="128 GB"
                            trend="45% of 500GB"
                            icon={Briefcase}
                            trendColor="text-slate-600"
                        />
                        <MetricCard
                            title="API Credits"
                            value="8,400"
                            trend="Renews in 12 days"
                            icon={TrendingUp}
                            trendColor="text-blue-600"
                        />
                        <MetricCard
                            title="Next Invoice"
                            value="$299"
                            trend="Due on Oct 1"
                            icon={Calendar}
                            trendColor="text-slate-600"
                        />
                    </div>
                    {/* Simplified Activity for Org Admin */}
                    <Card className="border-slate-100 shadow-sm">
                        <CardHeader>
                            <CardTitle>System Usage</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-md">
                                <p className="text-slate-400">Usage Analytics Chart Placeholder</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* HR / Hiring Manager View */
                <>
                    <div className="grid gap-4 md:grid-cols-4">
                        <MetricCard
                            title="Total Candidates"
                            value="1,284"
                            trend="+12% from last month"
                            icon={Users}
                            trendColor="text-emerald-600"
                        />
                        <MetricCard
                            title="Interviews Today"
                            value="8"
                            trend="3 pending feedback"
                            icon={Calendar}
                            trendColor="text-amber-600"
                        />
                        <MetricCard
                            title="Open Jobs"
                            value="12"
                            trend="2 closing soon"
                            icon={Briefcase}
                            trendColor="text-blue-600"
                        />
                        <MetricCard
                            title="Time to Hire"
                            value="18d"
                            trend="-2 days avg"
                            icon={Clock}
                            trendColor="text-emerald-600"
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-7">
                        {/* Action Items - Main Focus */}
                        <Card className="md:col-span-4 border-slate-100 shadow-sm">
                            <CardHeader>
                                <CardTitle>Action Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <ActionItem
                                        title="Review 3 new candidates for Product Manager"
                                        desc="AI Agent flagged them as Top Match (90%+)"
                                        type="urgent"
                                        action="Review Now"
                                        href="/candidates"
                                    />
                                    <ActionItem
                                        title="Approve Offer for Sarah Jenkins"
                                        desc="Senior UX Designer • $140k • Remote"
                                        type="action"
                                        action="View Offer"
                                        href="/offers"
                                    />
                                    <ActionItem
                                        title="Interview Feedback Missing"
                                        desc="Please submit feedback for Amit Kumar (Technical Round)"
                                        type="warning"
                                        action="Add Feedback"
                                        href="/interviews"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Activity / Feed */}
                        <Card className="md:col-span-3 border-slate-100 shadow-sm bg-slate-50/50">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    <ActivityItem
                                        user="Shivachaitanya R."
                                        action="moved candidate"
                                        target="Rohan Gupta"
                                        role="Product Manager"
                                        time="2m ago"
                                    />
                                    <ActivityItem
                                        user="AI Agent"
                                        action="screened"
                                        target="15 candidates"
                                        role="DevOps Engineer"
                                        time="1h ago"
                                    />
                                    <ActivityItem
                                        user="Aditi Sharma"
                                        action="scheduled interview"
                                        target="Sriya Patel"
                                        role="Product Manager"
                                        time="3h ago"
                                    />
                                    <ActivityItem
                                        user="System"
                                        action="posted new job"
                                        target="Graphic Designer"
                                        role=""
                                        time="5h ago"
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}

function MetricCard({ title, value, trend, icon: Icon, trendColor }: any) {
    return (
        <Card className="border-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-slate-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                <p className={`text-xs ${trendColor} font-medium mt-1`}>
                    {trend}
                </p>
            </CardContent>
        </Card>
    );
}

function ActionItem({ title, desc, type, action, href }: any) {
    const iconMap = {
        urgent: <TrendingUp className="h-5 w-5 text-emerald-600" />,
        action: <CheckCircle2 className="h-5 w-5 text-blue-600" />,
        warning: <AlertCircle className="h-5 w-5 text-amber-600" />
    };

    return (
        <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-colors">
            <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-2 rounded-full bg-slate-50`}>
                    {iconMap[type as keyof typeof iconMap]}
                </div>
                <div>
                    <h4 className="font-medium text-slate-900">{title}</h4>
                    <p className="text-sm text-slate-500">{desc}</p>
                </div>
            </div>
            <Link href={href}>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                    {action} <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </Link>
        </div>
    );
}

function ActivityItem({ user, action, target, role, time }: any) {
    return (
        <div className="flex gap-3">
            <div className="mt-1 h-2 w-2 rounded-full bg-slate-300 ring-4 ring-white" />
            <div>
                <p className="text-sm text-slate-800">
                    <span className="font-medium">{user}</span> {action} <span className="font-medium">{target}</span>
                </p>
                {role && <p className="text-xs text-slate-500">for {role}</p>}
                <p className="text-xs text-slate-400 mt-1">{time}</p>
            </div>
        </div>
    );
}

"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge } from "@everleap/design-system";
import { Building2, Users, DollarSign, TrendingUp, CheckCircle, Activity } from "lucide-react";
import Link from "next/link";

export default function PlatformDashboardPage() {
    const stats = {
        totalOrgs: 42,
        activeOrgs: 38,
        totalUsers: 256,
        uptime: 99.98
    };

    const recentActivity = [
        { type: "upgrade", org: "TechCorp", action: "upgraded to Enterprise", time: "2 hours ago" },
        { type: "signup", org: "StartupX", action: "signed up (Trial)", time: "5 hours ago" },
        { type: "payment", org: "Globex Corp", action: "payment successful ($799)", time: "1 day ago" },
        { type: "suspend", org: "Soylent Corp", action: "suspended for non-payment", time: "2 days ago" }
    ];

    const systemServices = [
        { name: "API Service", status: "operational", uptime: 100 },
        { name: "Database", status: "operational", uptime: 99.99 },
        { name: "Email Service", status: "operational", uptime: 99.95 },
        { name: "Payment Gateway", status: "operational", uptime: 99.98 }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Dashboard</h1>
                <p className="text-slate-500">Monitor platform health and activity</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Total Organizations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-slate-900">{stats.totalOrgs}</p>
                        <p className="text-xs text-slate-500 mt-1">+3 this month</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Active Organizations
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-emerald-600">{stats.activeOrgs}</p>
                        <p className="text-xs text-slate-500 mt-1">{((stats.activeOrgs / stats.totalOrgs) * 100).toFixed(1)}% of total</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                        <p className="text-xs text-slate-500 mt-1">Across all organizations</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            System Uptime
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-primary">{stats.uptime}%</p>
                        <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="border-slate-100">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivity.map((activity, idx) => (
                                <div key={idx} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                        activity.type === "upgrade" ? "bg-purple-100 text-purple-600" :
                                        activity.type === "signup" ? "bg-blue-100 text-blue-600" :
                                        activity.type === "payment" ? "bg-green-100 text-green-600" :
                                        "bg-red-100 text-red-600"
                                    }`}>
                                        <Activity className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">
                                            <span className="font-semibold">{activity.org}</span> {activity.action}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* System Health */}
                <Card className="border-slate-100">
                    <CardHeader>
                        <CardTitle>System Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {systemServices.map((service, idx) => (
                                <div key={idx} className="flex items-center justify-between pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${service.status === "operational" ? "bg-green-500" : "bg-red-500"}`} />
                                        <span className="text-sm font-medium text-slate-900">{service.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500">{service.uptime}% uptime</span>
                                        <Badge className="bg-green-50 text-green-700 border-green-200">
                                            {service.status === "operational" ? "Operational" : "Down"}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <Link href="/system" className="text-sm text-primary hover:underline">
                                View detailed system status →
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-slate-100">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <Link href="/clients" className="p-4 border border-slate-200 rounded-lg hover:border-primary/50 hover:bg-slate-50 transition-all">
                            <div className="flex items-center gap-3">
                                <Building2 className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium text-sm">Manage Clients</p>
                                    <p className="text-xs text-slate-500">View all organizations</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/plans" className="p-4 border border-slate-200 rounded-lg hover:border-primary/50 hover:bg-slate-50 transition-all">
                            <div className="flex items-center gap-3">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium text-sm">Manage Plans</p>
                                    <p className="text-xs text-slate-500">Create & edit pricing</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/coupons" className="p-4 border border-slate-200 rounded-lg hover:border-primary/50 hover:bg-slate-50 transition-all">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium text-sm">Create Coupon</p>
                                    <p className="text-xs text-slate-500">Discount codes</p>
                                </div>
                            </div>
                        </Link>
                        <Link href="/system" className="p-4 border border-slate-200 rounded-lg hover:border-primary/50 hover:bg-slate-50 transition-all">
                            <div className="flex items-center gap-3">
                                <Activity className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="font-medium text-sm">System Health</p>
                                    <p className="text-xs text-slate-500">Monitor services</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

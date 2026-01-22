"use client";

import { Card, CardContent, CardHeader, CardTitle, Badge, Progress } from "@everleap/design-system";
import { CheckCircle, AlertCircle, XCircle, Activity, Clock } from "lucide-react";

export default function SystemHealthPage() {
    const services = [
        {
            name: "API Service",
            status: "operational",
            uptime: 100,
            latency: "45ms",
            errors: "0.02%",
            lastIncident: null
        },
        {
            name: "Database (PostgreSQL)",
            status: "operational",
            uptime: 99.99,
            latency: "12ms",
            errors: "0.01%",
            lastIncident: "Database connection spike • 2 days ago • Resolved"
        },
        {
            name: "Email Service (SendGrid)",
            status: "operational",
            uptime: 99.95,
            latency: "350ms",
            errors: "0.05%",
            lastIncident: null
        },
        {
            name: "Payment Gateway (Stripe)",
            status: "operational",
            uptime: 99.98,
            latency: "180ms",
            errors: "0.01%",
            lastIncident: null
        },
        {
            name: "Storage (AWS S3)",
            status: "degraded",
            uptime: 99.85,
            latency: "450ms",
            errors: "0.15%",
            lastIncident: "S3 upload latency • 2 hours ago • Monitoring"
        },
        {
            name: "Background Jobs (Redis)",
            status: "operational",
            uptime: 99.99,
            latency: "8ms",
            errors: "0.00%",
            lastIncident: null
        }
    ];

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "operational":
                return <CheckCircle className="h-5 w-5 text-emerald-500" />;
            case "degraded":
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case "down":
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Activity className="h-5 w-5 text-slate-400" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "operational":
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Operational</Badge>;
            case "degraded":
                return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Degraded</Badge>;
            case "down":
                return <Badge className="bg-red-50 text-red-700 border-red-200">Down</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const recentIncidents = [
        {
            title: "S3 upload latency",
            status: "monitoring",
            time: "2 hours ago",
            description: "Increased latency on S3 uploads. Monitoring for improvements."
        },
        {
            title: "Database connection spike",
            status: "resolved",
            time: "2 days ago",
            description: "Temporary spike in database connections. Auto-scaled and resolved."
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Health</h1>
                <p className="text-slate-500">Real-time monitoring of all platform services</p>
            </div>

            {/* Overall Status */}
            <Card className="border-slate-100 bg-emerald-50/50">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                            <CheckCircle className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-emerald-900">All Systems Operational</h3>
                            <p className="text-sm text-emerald-700">1 service experiencing degraded performance</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Performance Metrics */}
            <div className="grid sm:grid-cols-3 gap-4">
                <Card className="border-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Average Uptime</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-slate-900">99.98%</p>
                        <p className="text-xs text-slate-500 mt-1">Last 30 days</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Avg Latency</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-slate-900">45ms</p>
                        <p className="text-xs text-slate-500 mt-1">API response time</p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">Error Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-slate-900">0.02%</p>
                        <p className="text-xs text-slate-500 mt-1">Last 24 hours</p>
                    </CardContent>
                </Card>
            </div>

            {/* Services Status */}
            <Card className="border-slate-100">
                <CardHeader>
                    <CardTitle>Service Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {services.map((service, idx) => (
                            <div key={idx} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(service.status)}
                                        <div>
                                            <h4 className="font-semibold text-slate-900">{service.name}</h4>
                                            {service.lastIncident && (
                                                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {service.lastIncident}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {getStatusBadge(service.status)}
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-2">
                                    <div>
                                        <p className="text-xs text-slate-500">Uptime</p>
                                        <p className="text-sm font-semibold text-slate-900">{service.uptime}%</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Latency</p>
                                        <p className="text-sm font-semibold text-slate-900">{service.latency}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500">Error Rate</p>
                                        <p className="text-sm font-semibold text-slate-900">{service.errors}</p>
                                    </div>
                                </div>

                                <Progress value={service.uptime} className="h-1.5" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Recent Incidents */}
            <Card className="border-slate-100">
                <CardHeader>
                    <CardTitle>Recent Incidents</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentIncidents.map((incident, idx) => (
                            <div key={idx} className="flex items-start gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${incident.status === "resolved" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                                    }`}>
                                    {incident.status === "resolved" ?
                                        <CheckCircle className="h-4 w-4" /> :
                                        <AlertCircle className="h-4 w-4" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold text-slate-900">{incident.title}</h4>
                                        <Badge variant="outline" className={
                                            incident.status === "resolved" ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        }>
                                            {incident.status === "resolved" ? "Resolved" : "Monitoring"}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600">{incident.description}</p>
                                    <p className="text-xs text-slate-500 mt-1">{incident.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

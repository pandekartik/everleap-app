"use client";

import { useState } from "react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@everleap/design-system";
import { Search, Filter, Download, Plus, Building2, Users, DollarSign, TrendingUp, ExternalLink, Settings as SettingsIcon, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const MOCK_CLIENTS = [
    {
        id: "org_acme",
        name: "Acme Corp",
        adminEmail: "sarah@acme.inc",
        plan: "Enterprise",
        status: "ACTIVE",
        users: 45,
        mrr: 2999,
        health: 95,
        activeJobs: 12,
        joinedDate: "Feb 12, 2024"
    },
    {
        id: "org_globex",
        name: "Globex Corporation",
        adminEmail: "hank@globex.com",
        plan: "Professional",
        status: "ACTIVE",
        users: 25,
        mrr: 799,
        health: 88,
        activeJobs: 5,
        joinedDate: "Mar 01, 2024"
    },
    {
        id: "org_techstart",
        name: "TechStart Inc",
        adminEmail: "founder@techstart.io",
        plan: "Professional",
        status: "TRIAL",
        users: 8,
        mrr: 0,
        health: 75,
        activeJobs: 2,
        joinedDate: "Jan 18, 2026"
    },
    {
        id: "org_soylent",
        name: "Soylent Corp",
        adminEmail: "admin@soylent.green",
        plan: "Starter",
        status: "SUSPENDED",
        users: 10,
        mrr: 0,
        health: 20,
        activeJobs: 0,
        joinedDate: "Jan 10, 2024"
    },
    {
        id: "org_initech",
        name: "Initech",
        adminEmail: "bill@initech.com",
        plan: "Starter",
        status: "ACTIVE",
        users: 12,
        mrr: 99,
        health: 92,
        activeJobs: 3,
        joinedDate: "Nov 05, 2023"
    },
    {
        id: "org_umbrella",
        name: "Umbrella Corp",
        adminEmail: "admin@umbrella.corp",
        plan: "Enterprise",
        status: "ACTIVE",
        users: 120,
        mrr: 2999,
        health: 98,
        activeJobs: 25,
        joinedDate: "Aug 15, 2023"
    }
];

export default function AdminClientsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [planFilter, setPlanFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"name" | "plan" | "status" | "health" | "joined">("joined");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Calculate stats
    const totalClients = MOCK_CLIENTS.length;
    const activeClients = MOCK_CLIENTS.filter(c => c.status === "ACTIVE").length;
    const trialClients = MOCK_CLIENTS.filter(c => c.status === "TRIAL").length;
    const totalMRR = MOCK_CLIENTS.reduce((sum, c) => sum + c.mrr, 0);

    // Filter and sort clients
    const filteredClients = MOCK_CLIENTS.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.adminEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || client.status === statusFilter;
        const matchesPlan = planFilter === "all" || client.plan === planFilter;
        return matchesSearch && matchesStatus && matchesPlan;
    }).sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case "name":
                comparison = a.name.localeCompare(b.name);
                break;
            case "plan":
                comparison = a.plan.localeCompare(b.plan);
                break;
            case "status":
                comparison = a.status.localeCompare(b.status);
                break;
            case "health":
                comparison = a.health - b.health;
                break;
            case "joined":
                comparison = new Date(a.joinedDate).getTime() - new Date(b.joinedDate).getTime();
                break;
        }
        return sortOrder === "asc" ? comparison : -comparison;
    });

    const handleSort = (column: typeof sortBy) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(column);
            setSortOrder("asc");
        }
    };

    const SortIcon = ({ column }: { column: typeof sortBy }) => {
        if (sortBy !== column) return <ArrowUpDown className="ml-2 h-3.5 w-3.5 text-slate-400" />;
        return sortOrder === "asc" ?
            <ChevronUp className="ml-2 h-3.5 w-3.5 text-primary" /> :
            <ChevronDown className="ml-2 h-3.5 w-3.5 text-primary" />;
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>;
            case "TRIAL":
                return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Trial</Badge>;
            case "SUSPENDED":
                return <Badge className="bg-red-50 text-red-700 border-red-200">Suspended</Badge>;
            case "CHURNED":
                return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Churned</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPlanBadge = (plan: string) => {
        switch (plan) {
            case "Enterprise":
                return <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">Enterprise</Badge>;
            case "Professional":
                return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Professional</Badge>;
            case "Starter":
                return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Starter</Badge>;
            default:
                return <Badge variant="outline">{plan}</Badge>;
        }
    };

    const getHealthColor = (health: number) => {
        if (health >= 80) return "text-emerald-600";
        if (health >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clients</h1>
                    <p className="text-slate-500 mt-1">Manage organizations and their subscriptions</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Organization
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <MetricCard
                    title="Total Clients"
                    value={totalClients.toString()}
                    trend={`${activeClients} active`}
                    icon={Building2}
                    trendColor="text-emerald-600"
                />
                <MetricCard
                    title="Active"
                    value={activeClients.toString()}
                    trend={`${trialClients} on trial`}
                    icon={TrendingUp}
                    trendColor="text-blue-600"
                />
                <MetricCard
                    title="Total Users"
                    value={MOCK_CLIENTS.reduce((sum, c) => sum + c.users, 0).toString()}
                    trend="Across all orgs"
                    icon={Users}
                    trendColor="text-slate-600"
                />
                <MetricCard
                    title="Total MRR"
                    value={`$${totalMRR.toLocaleString()}`}
                    trend="+12% from last month"
                    icon={DollarSign}
                    trendColor="text-emerald-600"
                />
            </div>

            {/* Filters and Search */}
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                type="search"
                                placeholder="Search by name, email, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white border-slate-200"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="TRIAL">Trial</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="CHURNED">Churned</option>
                        </select>
                        <select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Plans</option>
                            <option value="Enterprise">Enterprise</option>
                            <option value="Professional">Professional</option>
                            <option value="Starter">Starter</option>
                        </select>
                        <Button variant="outline" size="sm" className="text-slate-600">
                            <Filter className="h-4 w-4 mr-2" />
                            More Filters
                        </Button>
                        <Button variant="outline" size="sm" className="text-slate-600">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Clients Table */}
            <Card className="border-slate-100 shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100 hover:bg-slate-50/50">
                            <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSort("name")}>
                                <div className="flex items-center">Organization<SortIcon column="name" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("plan")}>
                                <div className="flex items-center">Plan<SortIcon column="plan" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                                <div className="flex items-center">Status<SortIcon column="status" /></div>
                            </TableHead>
                            <TableHead className="text-center">Users</TableHead>
                            <TableHead className="text-center">Jobs</TableHead>
                            <TableHead className="text-right">MRR</TableHead>
                            <TableHead className="text-center cursor-pointer" onClick={() => handleSort("health")}>
                                <div className="flex items-center justify-center">Health<SortIcon column="health" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("joined")}>
                                <div className="flex items-center">Joined<SortIcon column="joined" /></div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-12 text-slate-500">
                                    No organizations found matching your criteria
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClients.map((client) => (
                                <TableRow
                                    key={client.id}
                                    className="border-slate-100 group hover:bg-slate-50/50 cursor-pointer"
                                    onClick={() => router.push(`/admin/clients/${client.id}`)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {client.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{client.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{client.adminEmail}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getPlanBadge(client.plan)}</TableCell>
                                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                                            {client.users}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                                            {client.activeJobs}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-sm text-slate-900">
                                        ${client.mrr.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className={`font-semibold ${getHealthColor(client.health)}`}>
                                            {client.health}%
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-sm">{client.joinedDate}</TableCell>
                                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-600 hover:text-primary">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="sm" className="h-7 px-2 text-slate-600 hover:text-primary">
                                                <SettingsIcon className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}

function MetricCard({ title, value, trend, icon: Icon, trendColor }: any) {
    return (
        <Card className="border-slate-100">
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-600">{title}</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">{value}</p>
                        <p className={`text-xs mt-1 ${trendColor}`}>{trend}</p>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

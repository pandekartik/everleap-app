"use client";

import { useEffect, useState } from "react";
import { Button, Input, Card, CardContent, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@everleap/design-system";
import { Search, Filter, Download, Building2, Users, DollarSign, TrendingUp, ExternalLink, Settings as SettingsIcon, ChevronUp, ChevronDown, ArrowUpDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CreateClientDialog } from "@/components/admin/CreateClientDialog";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";

interface Company {
    id: string;
    name: string;
    domain: string;
    subscription_tier: string;
    is_active: boolean;
    created_at: string;
    // These might be missing from list API, using placeholders or handling elegantly
    total_employees?: number;
    total_jobs?: number;
    api_credits_used?: number;
}

export default function AdminClientsPage() {
    const router = useRouter();
    const { user, isLoading: isAuthLoading } = useAuth();
    const [clients, setClients] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [planFilter, setPlanFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"name" | "plan" | "status" | "date">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const fetchClients = async () => {
        setIsLoading(true);
        try {
            const response = await api.get("/companies");
            setClients(response.data);
        } catch (error) {
            console.error("Failed to fetch clients:", error);
            // Only show toast if user is actually logged in, otherwise let auth redirect handle it
            if (user) {
                toast.error("Failed to load organizations");
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthLoading) {
            if (!user) {
                router.push("/login"); // Or handled by a global protection component
                return;
            }
            fetchClients();
        }
    }, [isAuthLoading, user]);

    // Show loading state while checking auth
    if (isAuthLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Filter and sort clients
    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.id.toLowerCase().includes(searchTerm.toLowerCase());

        const status = client.is_active ? "ACTIVE" : "INACTIVE";
        const matchesStatus = statusFilter === "all" || status === statusFilter;

        const matchesPlan = planFilter === "all" || client.subscription_tier === planFilter;

        return matchesSearch && matchesStatus && matchesPlan;
    }).sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case "name":
                comparison = a.name.localeCompare(b.name);
                break;
            case "plan":
                comparison = a.subscription_tier.localeCompare(b.subscription_tier);
                break;
            case "status":
                comparison = Number(a.is_active) - Number(b.is_active);
                break;
            case "date":
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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

    const getStatusBadge = (isActive: boolean) => {
        if (isActive) {
            return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>;
        }
        return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Inactive</Badge>;
    };

    const getPlanBadge = (plan: string) => {
        switch (plan.toLowerCase()) {
            case "enterprise":
                return <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">Enterprise</Badge>;
            case "pro":
                return <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">Professional</Badge>;
            case "basic":
                return <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">Basic</Badge>;
            default:
                return <Badge variant="outline">{plan}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clients</h1>
                    <p className="text-slate-500 mt-1">Manage organizations and their subscriptions</p>
                </div>
                <CreateClientDialog onSuccess={fetchClients} />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <MetricCard
                    title="Total Clients"
                    value={clients.length.toString()}
                    trend={`${clients.filter(c => c.is_active).length} active`}
                    icon={Building2}
                    trendColor="text-emerald-600"
                />
                <MetricCard
                    title="Active"
                    value={clients.filter(c => c.is_active).length.toString()}
                    trend="Organizations"
                    icon={TrendingUp}
                    trendColor="text-blue-600"
                />
                {/* These are placeholders as the API doesn't return aggregate metrics efficiently yet */}
                <MetricCard
                    title="Total Users"
                    value="-"
                    trend="Across all orgs"
                    icon={Users}
                    trendColor="text-slate-600"
                />
                <MetricCard
                    title="Total Revenue"
                    value="-"
                    trend="Needs Integration"
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
                                placeholder="Search by name, domain, or ID..."
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
                            <option value="INACTIVE">Inactive</option>
                        </select>
                        <select
                            value={planFilter}
                            onChange={(e) => setPlanFilter(e.target.value)}
                            className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Plans</option>
                            <option value="enterprise">Enterprise</option>
                            <option value="pro">Pro</option>
                            <option value="basic">Basic</option>
                        </select>

                    </div>
                </CardContent>
            </Card>

            {/* Clients Table */}
            <Card className="border-slate-100 shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100 hover:bg-slate-50/50">
                            <TableHead className="w-[300px] cursor-pointer" onClick={() => handleSort("name")}>
                                <div className="flex items-center">Organization<SortIcon column="name" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("plan")}>
                                <div className="flex items-center">Plan<SortIcon column="plan" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                                <div className="flex items-center">Status<SortIcon column="status" /></div>
                            </TableHead>
                            <TableHead className="text-center cursor-pointer" onClick={() => handleSort("date")}>
                                <div className="flex items-center justify-center">Joined<SortIcon column="date" /></div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        Loading organizations...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                    No organizations found matching your criteria
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClients.map((client) => (
                                <TableRow
                                    key={client.id}
                                    className="border-slate-100 group hover:bg-slate-50/50 cursor-pointer"
                                    onClick={() => router.push(`/platform-dashboard/clients/${client.id}`)}
                                >
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {client.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{client.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{client.domain}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getPlanBadge(client.subscription_tier)}</TableCell>
                                    <TableCell>{getStatusBadge(client.is_active)}</TableCell>
                                    <TableCell className="text-center text-slate-600 text-sm">
                                        {format(new Date(client.created_at), "MMM d, yyyy")}
                                    </TableCell>
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

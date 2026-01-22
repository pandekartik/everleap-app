"use client";

import { useState } from "react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@everleap/design-system";
import { Search, Filter, Download, Eye, Edit, Briefcase, Users, Clock, TrendingUp, Plus, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { StatusBadge } from "@/components/hiring/StatusBadge";
import { MOCK_ROLES } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HiringPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"id" | "title" | "department" | "location" | "date" | "status">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Calculate stats
    const totalJobs = MOCK_ROLES.length;
    const openJobs = MOCK_ROLES.filter(r => r.status === "OPEN").length;
    const totalCandidates = MOCK_ROLES.reduce((sum, job) => sum + job.candidateCount, 0);
    const avgTimeToHire = 18; // Mock value

    // Filter and sort jobs
    const filteredJobs = MOCK_ROLES.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || job.status === statusFilter;
        return matchesSearch && matchesStatus;
    }).sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case "id":
                comparison = a.id.localeCompare(b.id);
                break;
            case "title":
                comparison = a.title.localeCompare(b.title);
                break;
            case "department":
                comparison = a.department.localeCompare(b.department);
                break;
            case "location":
                comparison = a.location.localeCompare(b.location);
                break;
            case "date":
                comparison = new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
                break;
            case "status":
                comparison = a.status.localeCompare(b.status);
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Jobs</h1>
                    <p className="text-slate-500 mt-1">Manage and track all your open positions</p>
                </div>
                <Link href="/hiring/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Job
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <MetricCard
                    title="Total Jobs"
                    value={totalJobs.toString()}
                    trend={`${openJobs} active`}
                    icon={Briefcase}
                    trendColor="text-emerald-600"
                />
                <MetricCard
                    title="Open Positions"
                    value={openJobs.toString()}
                    trend="+2 this month"
                    icon={TrendingUp}
                    trendColor="text-blue-600"
                />
                <MetricCard
                    title="Total Candidates"
                    value={totalCandidates.toString()}
                    trend="+12% from last month"
                    icon={Users}
                    trendColor="text-emerald-600"
                />
                <MetricCard
                    title="Avg. Time to Fill"
                    value={`${avgTimeToHire}d`}
                    trend="-2 days improvement"
                    icon={Clock}
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
                                placeholder="Search by title, department, or location..."
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
                            <option value="OPEN">Open</option>
                            <option value="CLOSED">Closed</option>
                            <option value="PAUSED">Paused</option>
                            <option value="DRAFT">Draft</option>
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

            {/* Jobs Table */}
            <Card className="border-slate-100 shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100 hover:bg-slate-50/50">
                            <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort("id")}>
                                <div className="flex items-center">Job ID<SortIcon column="id" /></div>
                            </TableHead>
                            <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort("title")}>
                                <div className="flex items-center">Position<SortIcon column="title" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("department")}>
                                <div className="flex items-center">Department<SortIcon column="department" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("location")}>
                                <div className="flex items-center">Location<SortIcon column="location" /></div>
                            </TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                                <div className="flex items-center">Created<SortIcon column="date" /></div>
                            </TableHead>
                            <TableHead className="text-center">Candidates</TableHead>
                            <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                                <div className="flex items-center">Status<SortIcon column="status" /></div>
                            </TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredJobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                    No jobs found matching your criteria
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredJobs.map((job) => (
                                <TableRow
                                    key={job.id}
                                    className="border-slate-100 group hover:bg-slate-50/50 cursor-pointer"
                                    onClick={() => router.push(`/hiring/${job.id}`)}
                                >
                                    <TableCell className="font-mono text-xs text-slate-500">{job.id}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-semibold text-slate-900">{job.title}</p>
                                            <p className="text-xs text-slate-500 mt-0.5">Posted by {job.createdBy}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-700">{job.department}</TableCell>
                                    <TableCell className="text-slate-700">{job.location}</TableCell>
                                    <TableCell className="text-slate-600 text-sm">{job.createdDate}</TableCell>
                                    <TableCell className="text-center">
                                        <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                                            {job.candidateCount}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={job.status} />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center justify-end gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                    <div className="text-sm text-slate-600">
                        Showing <span className="font-medium">{filteredJobs.length}</span> of <span className="font-medium">{totalJobs}</span> jobs
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" className="bg-primary text-primary-foreground border-primary hover:bg-primary/90">1</Button>
                        <Button variant="outline" size="sm">2</Button>
                        <Button variant="outline" size="sm">3</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </div>
            </Card>
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

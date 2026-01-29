"use client";

import { useState, useEffect } from "react";
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@everleap/design-system";
import { Search, Filter, Download, Eye, Edit, Briefcase, Users, Clock, TrendingUp, Plus, ChevronUp, ChevronDown, ArrowUpDown, Loader2, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/hiring/StatusBadge";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { PaginatedJobResponse, JobListItem } from "@/lib/types";

export default function HiringPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [jobs, setJobs] = useState<JobListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState<"id" | "title" | "department" | "location" | "date" | "status">("date");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalJobs, setTotalJobs] = useState(0);

    // Fetch jobs from API
    useEffect(() => {
        const fetchJobs = async () => {
            if (!user?.company_id) return;

            try {
                setIsLoading(true);
                const params: any = {
                    page,
                    page_size: 25,
                };

                if (statusFilter !== "all") {
                    params.status = statusFilter;
                }

                const { data } = await api.get<PaginatedJobResponse>("/jobs", { params });
                setJobs(data.items);
                setTotalJobs(data.total);
                setTotalPages(data.total_pages);
            } catch (error: any) {
                console.error("Failed to fetch jobs:", error);
                toast.error(error.response?.data?.detail || "Failed to load jobs");
            } finally {
                setIsLoading(false);
            }
        };

        fetchJobs();
    }, [user?.company_id, page, statusFilter]);

    // Calculate stats
    const openJobs = jobs.filter(j => j.is_published && j.status === "published").length;
    const totalCandidates = jobs.reduce((sum, job) => sum + job.total_applications, 0);
    const avgTimeToHire = 18; // TODO: Calculate from actual data

    // Client-side filter and sort
    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    }).sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case "id":
                comparison = a.unique_job_code.localeCompare(b.unique_job_code);
                break;
            case "title":
                comparison = a.job_title.localeCompare(b.job_title);
                break;
            case "department":
                comparison = a.department.localeCompare(b.department);
                break;
            case "location":
                comparison = a.location.localeCompare(b.location);
                break;
            case "date":
                comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
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
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>

            {/* Search Only */}
            <Card className="border-slate-100 shadow-sm">
                <CardContent className="p-4">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="search"
                            placeholder="Search by title, department, or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-white border-slate-200"
                        />
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
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                                    <p className="text-slate-500 mt-2">Loading jobs...</p>
                                </TableCell>
                            </TableRow>
                        ) : filteredJobs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-12 text-slate-500">
                                    {jobs.length === 0 ? "No jobs yet. Create your first job to get started!" : "No jobs found matching your criteria"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredJobs.map((job) => {
                                const createdDate = new Date(job.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                });

                                return (
                                    <TableRow
                                        key={job.id}
                                        className="border-slate-100 group hover:bg-slate-50/50 cursor-pointer"
                                        onClick={() => router.push(`/hiring/${job.id}`)}
                                    >
                                        <TableCell className="font-mono text-xs text-slate-500">{job.unique_job_code}</TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold text-slate-900">{job.job_title}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{job.employment_type.replace('_', ' ')}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-700">{job.department}</TableCell>
                                        <TableCell className="text-slate-700">
                                            {job.location}{job.is_remote && " (Remote)"}
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-sm">{createdDate}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                                                {job.total_applications}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={job.status} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                {(job.status === "published" || job.is_published) && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(`${window.location.origin}/jobs/${job.unique_job_code}`, '_blank');
                                                        }}
                                                    >
                                                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                                        View URL
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/hiring/${job.id}`);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/hiring/${job.id}/edit`);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                    <div className="text-sm text-slate-600">
                        Showing <span className="font-medium">{filteredJobs.length}</span> of <span className="font-medium">{totalJobs}</span> jobs
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page === 1 || isLoading}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                        >
                            Previous
                        </Button>
                        {totalPages > 0 && Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPages - 2, page - 1)) + i;
                            return (
                                <Button
                                    key={pageNum}
                                    variant="outline"
                                    size="sm"
                                    className={pageNum === page ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" : ""}
                                    onClick={() => setPage(pageNum)}
                                    disabled={isLoading}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={page >= totalPages || isLoading}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        >
                            Next
                        </Button>
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

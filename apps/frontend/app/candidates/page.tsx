"use client";

import { useState } from "react";
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Card, CardContent, CardHeader, CardTitle } from "@everleap/design-system";
import { Search, Filter, Download, MessageSquare, Calendar, Users, TrendingUp, Clock, Target, LayoutList, LayoutGrid, ChevronDown, ChevronUp, ArrowUpDown } from "lucide-react";
import { MOCK_CANDIDATES, CandidateStatus } from "@/lib/mock-data";
import { cn } from "@everleap/design-system/lib/utils";
import { useRouter } from "next/navigation";

export default function CandidatesPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [stageFilter, setStageFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"all" | "byJob">("all");
    const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<"name" | "role" | "stage" | "score" | "applied">("applied");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Calculate stats
    const totalCandidates = MOCK_CANDIDATES.length;
    const inInterview = MOCK_CANDIDATES.filter(c => c.stage === "INTERVIEW").length;
    const avgScore = Math.round(MOCK_CANDIDATES.reduce((sum, c) => sum + c.score, 0) / totalCandidates);
    const topMatches = MOCK_CANDIDATES.filter(c => c.score >= 90).length;

    // Filter and sort candidates
    const filteredCandidates = MOCK_CANDIDATES.filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            candidate.role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStage = stageFilter === "all" || candidate.stage === stageFilter;
        return matchesSearch && matchesStage;
    }).sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case "name":
                comparison = a.name.localeCompare(b.name);
                break;
            case "role":
                comparison = a.role.localeCompare(b.role);
                break;
            case "stage":
                comparison = a.stage.localeCompare(b.stage);
                break;
            case "score":
                comparison = a.score - b.score;
                break;
            case "applied":
                comparison = new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
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

    // Group candidates by role
    const candidatesByJob = filteredCandidates.reduce((acc, candidate) => {
        if (!acc[candidate.role]) {
            acc[candidate.role] = [];
        }
        acc[candidate.role].push(candidate);
        return acc;
    }, {} as Record<string, typeof filteredCandidates>);

    const toggleJob = (job: string) => {
        const newExpanded = new Set(expandedJobs);
        if (newExpanded.has(job)) {
            newExpanded.delete(job);
        } else {
            newExpanded.add(job);
        }
        setExpandedJobs(newExpanded);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidates</h1>
                    <p className="text-slate-500 mt-1">Manage and track your talent pool</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* View Toggle */}
                    <div className="flex items-center border border-slate-200 rounded-lg p-1 bg-slate-50">
                        <button
                            onClick={() => setViewMode("all")}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors",
                                viewMode === "all"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <LayoutList className="h-4 w-4" />
                            All
                        </button>
                        <button
                            onClick={() => setViewMode("byJob")}
                            className={cn(
                                "px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors",
                                viewMode === "byJob"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            )}
                        >
                            <LayoutGrid className="h-4 w-4" />
                            By Job
                        </button>
                    </div>
                    <Button>
                        <Download className="mr-2 h-4 w-4" />
                        Export All
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <MetricCard
                    title="Total Candidates"
                    value={totalCandidates.toString()}
                    trend="+12% from last month"
                    icon={Users}
                    trendColor="text-emerald-600"
                />
                <MetricCard
                    title="In Interview"
                    value={inInterview.toString()}
                    trend="Active pipeline"
                    icon={Calendar}
                    trendColor="text-blue-600"
                />
                <MetricCard
                    title="Avg. Match Score"
                    value={`${avgScore}%`}
                    trend="AI rating"
                    icon={Target}
                    trendColor="text-slate-600"
                />
                <MetricCard
                    title="Top Matches (90%+)"
                    value={topMatches.toString()}
                    trend="High potential"
                    icon={TrendingUp}
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
                                placeholder="Search by name, role, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white border-slate-200"
                            />
                        </div>
                        <select
                            value={stageFilter}
                            onChange={(e) => setStageFilter(e.target.value)}
                            className="h-9 px-3 rounded-md border border-slate-200 bg-white text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="all">All Stages</option>
                            <option value="APPLIED">Applied</option>
                            <option value="SCREENING">Screening</option>
                            <option value="INTERVIEW">Interview</option>
                            <option value="OFFER">Offer</option>
                            <option value="HIRED">Hired</option>
                            <option value="REJECTED">Rejected</option>
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

            {/* Candidates Table/Grouped View */}
            {viewMode === "all" ? (
                <Card className="border-slate-100 shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-100 hover:bg-slate-50/50">
                                <TableHead className="w-[300px] cursor-pointer" onClick={() => handleSort("name")}>
                                    <div className="flex items-center">Candidate<SortIcon column="name" /></div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("role")}>
                                    <div className="flex items-center">Role Applied<SortIcon column="role" /></div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("stage")}>
                                    <div className="flex items-center">Stage<SortIcon column="stage" /></div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("score")}>
                                    <div className="flex items-center">Match Score<SortIcon column="score" /></div>
                                </TableHead>
                                <TableHead className="cursor-pointer" onClick={() => handleSort("applied")}>
                                    <div className="flex items-center">Applied Date<SortIcon column="applied" /></div>
                                </TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCandidates.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                                        No candidates found matching your criteria
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCandidates.map((candidate) => (
                                    <TableRow
                                        key={candidate.id}
                                        className="border-slate-100 group hover:bg-slate-50/50 cursor-pointer"
                                        onClick={() => router.push(`/candidates/${candidate.id}`)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={candidate.avatarUrl}
                                                    alt={candidate.name}
                                                    className="h-10 w-10 rounded-full bg-slate-100 object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-900">{candidate.name}</p>
                                                    <p className="text-xs text-slate-500">{candidate.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-700">{candidate.role}</TableCell>
                                        <TableCell>
                                            <StageBadge stage={candidate.stage} />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getScoreColor(candidate.score)}`}
                                                        style={{ width: `${candidate.score}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-slate-700">{candidate.score}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-sm">{candidate.appliedDate}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                                                    <MessageSquare className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                                                    <Calendar className="h-4 w-4" />
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
                            Showing <span className="font-medium">{filteredCandidates.length}</span> of <span className="font-medium">{totalCandidates}</span> candidates
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>Previous</Button>
                            <Button variant="outline" size="sm" className="bg-primary text-primary-foreground border-primary hover:bg-primary/90">1</Button>
                            <Button variant="outline" size="sm">Next</Button>
                        </div>
                    </div>
                </Card>
            ) : (
                /* By Job View */
                <div className="space-y-4">
                    {Object.keys(candidatesByJob).length === 0 ? (
                        <Card className="border-slate-100 shadow-sm">
                            <CardContent className="py-12 text-center text-slate-500">
                                No candidates found matching your criteria
                            </CardContent>
                        </Card>
                    ) : (
                        Object.entries(candidatesByJob).map(([jobRole, candidates]) => (
                            <Card key={jobRole} className="border-slate-100 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => toggleJob(jobRole)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <ChevronDown
                                            className={cn(
                                                "h-5 w-5 text-slate-400 transition-transform",
                                                expandedJobs.has(jobRole) ? "rotate-0" : "-rotate-90"
                                            )}
                                        />
                                        <div className="text-left">
                                            <h3 className="font-semibold text-slate-900">{jobRole}</h3>
                                            <p className="text-sm text-slate-500">{candidates.length} candidates</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                            Avg Score: {Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)}%
                                        </Badge>
                                    </div>
                                </button>

                                {expandedJobs.has(jobRole) && (
                                    <div className="border-t border-slate-100">
                                        <Table>
                                            <TableHeader className="bg-slate-50/50">
                                                <TableRow className="border-slate-100">
                                                    <TableHead className="w-[300px]">Candidate</TableHead>
                                                    <TableHead>Stage</TableHead>
                                                    <TableHead>Match Score</TableHead>
                                                    <TableHead>Applied Date</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {candidates.map((candidate) => (
                                                    <TableRow
                                                        key={candidate.id}
                                                        className="border-slate-100 group hover:bg-slate-50/50 cursor-pointer"
                                                        onClick={() => router.push(`/candidates/${candidate.id}`)}
                                                    >
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={candidate.avatarUrl}
                                                                    alt={candidate.name}
                                                                    className="h-10 w-10 rounded-full bg-slate-100 object-cover"
                                                                />
                                                                <div>
                                                                    <p className="font-medium text-slate-900">{candidate.name}</p>
                                                                    <p className="text-xs text-slate-500">{candidate.email}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <StageBadge stage={candidate.stage} />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full ${getScoreColor(candidate.score)}`}
                                                                        style={{ width: `${candidate.score}%` }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-medium text-slate-700">{candidate.score}%</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-slate-600 text-sm">{candidate.appliedDate}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                                                                    <MessageSquare className="h-4 w-4" />
                                                                </Button>
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                                                                    <Calendar className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </Card>
                        ))
                    )}
                </div>
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

function StageBadge({ stage }: { stage: CandidateStatus }) {
    const styles = {
        APPLIED: "bg-slate-100 text-slate-700 border-slate-200",
        SCREENING: "bg-blue-50 text-blue-700 border-blue-200",
        INTERVIEW: "bg-amber-50 text-amber-700 border-amber-200",
        OFFER: "bg-purple-50 text-purple-700 border-purple-200",
        HIRED: "bg-emerald-50 text-emerald-700 border-emerald-200",
        REJECTED: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[stage]}`}>
            {stage}
        </span>
    );
}

function getScoreColor(score: number) {
    if (score >= 90) return "bg-emerald-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-red-500";
}

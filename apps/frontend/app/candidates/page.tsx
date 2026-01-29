"use client";

import { useEffect, useState } from "react";
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Card, CardContent, CardHeader, CardTitle } from "@everleap/design-system";
import { Search, Filter, Download, MessageSquare, Calendar, Users, TrendingUp, Clock, Target, LayoutList, LayoutGrid, ChevronDown, ChevronUp, ArrowUpDown, Loader2 } from "lucide-react";
import { cn } from "@everleap/design-system/lib/utils";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CandidatesPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [stageFilter, setStageFilter] = useState("all");
    const [viewMode, setViewMode] = useState<"all" | "byJob">("all");
    const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<"name" | "role" | "stage" | "score" | "applied">("applied");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    // Data state
    const [candidates, setCandidates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const { data } = await api.get("/candidates");
                // Transform API data to match UI needs
                const transformedCandidates = data.candidates.map((c: any) => ({
                    id: c.application_id, // Use application_id for navigation
                    name: c.parsed_data?.name?.first ? `${c.parsed_data.name.first} ${c.parsed_data.name.last || ''}` : (c.resume_filename || "Unknown"),
                    email: c.parsed_data?.email || "No email",
                    role: c.job_title,
                    stage: c.status || 'APPLIED',
                    score: c.ai_score ? Math.round(c.ai_score) : 0,
                    appliedDate: format(new Date(c.applied_at), 'MMM d, yyyy'),
                    avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.parsed_data?.name?.first || 'U')}&background=random`,
                    rawDate: new Date(c.applied_at) // For sorting
                }));
                setCandidates(transformedCandidates);
            } catch (error) {
                console.error("Failed to fetch candidates:", error);
                toast.error("Failed to load candidates");
            } finally {
                setLoading(false);
            }
        };

        fetchCandidates();
    }, []);

    // Calculate stats
    const totalCandidates = candidates.length;
    const inInterview = candidates.filter(c => c.stage === "INTERVIEW").length;
    const avgScore = totalCandidates > 0
        ? Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / totalCandidates)
        : 0;
    const topMatches = candidates.filter(c => c.score >= 90).length;

    // Filter and sort candidates
    const filteredCandidates = candidates.filter(candidate => {
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
                comparison = a.rawDate.getTime() - b.rawDate.getTime();
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

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

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
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <MetricCard
                    title="Total Candidates"
                    value={totalCandidates.toString()}
                    trend="Active Pool"
                    icon={Users}
                    trendColor="text-slate-600"
                />
                <MetricCard
                    title="In Interview"
                    value={inInterview.toString()}
                    trend="Active Pipeline"
                    icon={Calendar}
                    trendColor="text-blue-600"
                />
                <MetricCard
                    title="Avg. Match Score"
                    value={`${avgScore}%`}
                    trend="AI Rating"
                    icon={Target}
                    trendColor="text-slate-600"
                />
                <MetricCard
                    title="Top Matches (90%+)"
                    value={topMatches.toString()}
                    trend="High Potential"
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
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-12">
                                        <div className="flex justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredCandidates.length === 0 ? (
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
                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                                    <img
                                                        src={candidate.avatarUrl}
                                                        alt={candidate.name}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            target.style.display = 'none';
                                                            target.parentElement!.innerHTML = `<span class="text-xs font-semibold text-slate-600">${candidate.name.charAt(0)}</span>`;
                                                        }}
                                                    />
                                                </div>
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
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination - Simplified for MVP */}
                    {filteredCandidates.length > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/30">
                            <div className="text-sm text-slate-600">
                                Showing <span className="font-medium">{filteredCandidates.length}</span> of <span className="font-medium">{totalCandidates}</span> candidates
                            </div>
                        </div>
                    )}
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
                        Object.entries(candidatesByJob).map(([jobRole, candidates]: [string, any[]]) => (
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
                                                                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                                                                    <img
                                                                        src={candidate.avatarUrl}
                                                                        alt={candidate.name}
                                                                        className="h-full w-full object-cover"
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.style.display = 'none';
                                                                            target.parentElement!.innerHTML = `<span class="text-xs font-semibold text-slate-600">${candidate.name.charAt(0)}</span>`;
                                                                        }}
                                                                    />
                                                                </div>
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

function StageBadge({ stage }: { stage: string }) {
    const styles: Record<string, string> = {
        APPLIED: "bg-slate-100 text-slate-700 border-slate-200",
        SCREENING: "bg-blue-50 text-blue-700 border-blue-200",
        INTERVIEW: "bg-amber-50 text-amber-700 border-amber-200",
        OFFER: "bg-purple-50 text-purple-700 border-purple-200",
        HIRED: "bg-emerald-50 text-emerald-700 border-emerald-200",
        REJECTED: "bg-red-50 text-red-700 border-red-200",
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[stage] || styles.APPLIED}`}>
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

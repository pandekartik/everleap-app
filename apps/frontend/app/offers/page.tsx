"use client";

import { useState } from "react";
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Card, CardContent, CardHeader, CardTitle, Badge } from "@everleap/design-system";
import { Plus, Search, Filter, Download, Eye, CheckCircle, Clock, Users, TrendingUp, DollarSign, LayoutList, LayoutGrid, ChevronDown } from "lucide-react";
import { MOCK_CANDIDATES } from "@/lib/mock-data";
import { cn } from "@everleap/design-system/lib/utils";

export default function OffersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"all" | "byJob">("all");
    const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

    // Filter for candidates in offer stage
    const offersData = MOCK_CANDIDATES.filter(c => c.stage === "OFFER" || c.stage === "HIRED");

    // Mock offer details (in real app, would come from API)
    const offers = offersData.map(candidate => ({
        ...candidate,
        salary: candidate.role === "Graphic Designer" ? "$95,000" : "$120,000",
        equity: "0.05%",
        status: candidate.stage === "HIRED" ? "Accepted" : "Sent",
        sentDate: "Nov 23, 2026"
    }));

    // Calculate stats
    const totalOffers = offers.length;
    const pending = offers.filter(o => o.status === "Sent").length;
    const accepted = offers.filter(o => o.status === "Accepted").length;
    const acceptanceRate = totalOffers > 0 ? Math.round((accepted / totalOffers) * 100) : 0;

    // Filter offers
    const filteredOffers = offers.filter(offer =>
        offer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group offers by role
    const offersByJob = filteredOffers.reduce((acc, offer) => {
        if (!acc[offer.role]) {
            acc[offer.role] = [];
        }
        acc[offer.role].push(offer);
        return acc;
    }, {} as Record<string, typeof filteredOffers>);

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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Offers</h1>
                    <p className="text-slate-500 mt-1">Manage candidate offers and approvals</p>
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
                        <Plus className="mr-2 h-4 w-4" />
                        Draft New Offer
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <MetricCard
                    title="Total Offers"
                    value={totalOffers.toString()}
                    trend="This quarter"
                    icon={Users}
                    trendColor="text-slate-600"
                />
                <MetricCard
                    title="Pending Response"
                    value={pending.toString()}
                    trend="Awaiting decision"
                    icon={Clock}
                    trendColor="text-amber-600"
                />
                <MetricCard
                    title="Accepted"
                    value={accepted.toString()}
                    trend={`${acceptanceRate}% acceptance rate`}
                    icon={CheckCircle}
                    trendColor="text-emerald-600"
                />
                <MetricCard
                    title="Avg. Offer Value"
                    value="$108k"
                    trend="+5% from last year"
                    icon={DollarSign}
                    trendColor="text-blue-600"
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
                                placeholder="Search by candidate name or role..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white border-slate-200"
                            />
                        </div>
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

            {/* Offers Table/Grouped View */}
            {viewMode === "all" ? (
                <Card className="border-slate-100 shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50/50">
                            <TableRow className="border-slate-100 hover:bg-slate-50/50">
                                <TableHead>Candidate</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Offer Amount</TableHead>
                                <TableHead>Equity</TableHead>
                                <TableHead>Sent Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOffers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                                        No offers found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOffers.map((offer) => (
                                    <TableRow key={offer.id} className="border-slate-100 group hover:bg-slate-50/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={offer.avatarUrl}
                                                    alt={offer.name}
                                                    className="h-9 w-9 rounded-full bg-slate-100 object-cover"
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-900">{offer.name}</p>
                                                    <p className="text-xs text-slate-500">{offer.email}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-700">{offer.role}</TableCell>
                                        <TableCell className="font-semibold text-slate-900">{offer.salary}</TableCell>
                                        <TableCell className="text-slate-600">{offer.equity}</TableCell>
                                        <TableCell className="text-slate-600 text-sm">{offer.sentDate}</TableCell>
                                        <TableCell>
                                            {offer.status === "Accepted" ? (
                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Accepted
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Sent
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                                                    <Eye className="h-4 w-4" />
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
                            Showing <span className="font-medium">{filteredOffers.length}</span> of <span className="font-medium">{totalOffers}</span> offers
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
                    {Object.keys(offersByJob).length === 0 ? (
                        <Card className="border-slate-100 shadow-sm">
                            <CardContent className="py-12 text-center text-slate-500">
                                No offers found
                            </CardContent>
                        </Card>
                    ) : (
                        Object.entries(offersByJob).map(([jobRole, jobOffers]) => (
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
                                            <p className="text-sm text-slate-500">{jobOffers.length} offers</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                            {jobOffers.filter(o => o.status === "Accepted").length} Accepted
                                        </Badge>
                                    </div>
                                </button>

                                {expandedJobs.has(jobRole) && (
                                    <div className="border-t border-slate-100">
                                        <Table>
                                            <TableHeader className="bg-slate-50/50">
                                                <TableRow className="border-slate-100">
                                                    <TableHead>Candidate</TableHead>
                                                    <TableHead>Offer Amount</TableHead>
                                                    <TableHead>Equity</TableHead>
                                                    <TableHead>Sent Date</TableHead>
                                                    <TableHead>Status</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {jobOffers.map((offer) => (
                                                    <TableRow key={offer.id} className="border-slate-100 group hover:bg-slate-50/50">
                                                        <TableCell>
                                                            <div className="flex items-center gap-3">
                                                                <img
                                                                    src={offer.avatarUrl}
                                                                    alt={offer.name}
                                                                    className="h-9 w-9 rounded-full bg-slate-100 object-cover"
                                                                />
                                                                <div>
                                                                    <p className="font-medium text-slate-900">{offer.name}</p>
                                                                    <p className="text-xs text-slate-500">{offer.email}</p>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="font-semibold text-slate-900">{offer.salary}</TableCell>
                                                        <TableCell className="text-slate-600">{offer.equity}</TableCell>
                                                        <TableCell className="text-slate-600 text-sm">{offer.sentDate}</TableCell>
                                                        <TableCell>
                                                            {offer.status === "Accepted" ? (
                                                                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                                    Accepted
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700 border border-purple-200">
                                                                    <Clock className="h-3 w-3 mr-1" />
                                                                    Sent
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary hover:bg-primary/10">
                                                                    <Eye className="h-4 w-4" />
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

"use client";

import { useState } from "react";
import { Button, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@everleap/design-system";
import { Search, Filter, Download, MoreHorizontal, MessageSquare, Calendar } from "lucide-react";
import { MOCK_CANDIDATES, CandidateStatus } from "@/lib/mock-data";

export default function CandidatesPage() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidates</h1>
                    <p className="text-slate-500">Manage and track your talent pool.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button>
                        <Filter className="mr-2 h-4 w-4" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 bg-white p-1 rounded-lg border border-slate-100 max-w-md">
                <Search className="h-4 w-4 ml-3 text-slate-400" />
                <Input
                    placeholder="Search candidates by name, role, or email..."
                    className="border-0 focus-visible:ring-0 shadow-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="rounded-md border border-slate-100 bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-slate-100 hover:bg-slate-50/50">
                            <TableHead className="w-[300px]">Candidate</TableHead>
                            <TableHead>Role Applied</TableHead>
                            <TableHead>Stage</TableHead>
                            <TableHead>Match Score</TableHead>
                            <TableHead>Applied Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {MOCK_CANDIDATES.map((candidate) => (
                            <TableRow key={candidate.id} className="border-slate-100 group">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={candidate.avatarUrl}
                                            alt={candidate.name}
                                            className="h-10 w-10 rounded-full bg-slate-100 object-cover"
                                        />
                                        <div>
                                            <p className="font-medium text-slate-900 group-hover:text-primary transition-colors cursor-pointer">{candidate.name}</p>
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
                                <TableCell className="text-slate-500">{candidate.appliedDate}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
                                            <MessageSquare className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-primary">
                                            <Calendar className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
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

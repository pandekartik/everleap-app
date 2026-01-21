"use client";

import { Card, CardContent, CardHeader, Button } from "@everleap/design-system";
import { MOCK_ROLES } from "@/lib/mock-data";
import { StatusBadge } from "./StatusBadge";
import { Users, MapPin, Calendar, MoreVertical, Eye, Edit } from "lucide-react";
import Link from "next/link";

export function JobsGrid() {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {MOCK_ROLES.map((job) => (
                <JobCard key={job.id} job={job} />
            ))}
        </div>
    );
}

function JobCard({ job }: { job: any }) {
    return (
        <Card className="border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-slate-400">{job.id}</span>
                            <StatusBadge status={job.status} />
                        </div>
                        <h3 className="font-semibold text-slate-900 text-base leading-tight">
                            {job.title}
                        </h3>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <MoreVertical className="h-4 w-4 text-slate-400" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Meta Info */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{job.location}</span>
                        <span className="text-slate-300">•</span>
                        <span>{job.department}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs">Created {job.createdDate}</span>
                    </div>
                </div>

                {/* Candidate Count */}
                <div className="flex items-center gap-2 pt-2 pb-1 border-t border-slate-100">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                        {job.candidateCount} {job.candidateCount === 1 ? 'Candidate' : 'Candidates'}
                    </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Link href={`/hiring/${job.id}`} className="flex-1">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-xs h-8 border-slate-200 hover:border-primary hover:text-primary"
                        >
                            <Eye className="h-3 w-3 mr-1.5" />
                            View
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 px-3 text-slate-600 hover:text-primary"
                    >
                        <Edit className="h-3 w-3 mr-1.5" />
                        Edit
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

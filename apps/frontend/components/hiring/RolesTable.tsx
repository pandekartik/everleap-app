"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@everleap/design-system";
import { Button } from "@everleap/design-system";
import { Avatar, AvatarFallback, AvatarImage } from "@everleap/design-system";
import { MOCK_ROLES } from "@/lib/mock-data";
import { StatusBadge } from "./StatusBadge";
import { FileEdit, Download, MoreHorizontal } from "lucide-react";

export function RolesTable() {
    return (
        <div className="rounded-md border border-slate-100 bg-card">
            <Table>
                <TableHeader className="bg-transparent border-b border-slate-100">
                    <TableRow>
                        <TableHead className="w-[100px]">Role ID ↑↓</TableHead>
                        <TableHead className="w-[200px]">Role name ↑↓</TableHead>
                        <TableHead>Department ↑↓</TableHead>
                        <TableHead>Location ↑↓</TableHead>
                        <TableHead>Created ↑↓</TableHead>
                        <TableHead className="text-center">Candidates ↑↓</TableHead>
                        <TableHead>Status ↑↓</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {MOCK_ROLES.map((role) => (
                        <TableRow key={role.id}>
                            <TableCell className="font-medium text-muted-foreground">{role.id}</TableCell>
                            <TableCell className="font-semibold text-foreground">{role.title}</TableCell>
                            <TableCell>{role.department}</TableCell>
                            <TableCell>{role.location}</TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-sm">{role.createdDate}</span>
                                    <span className="text-xs text-muted-foreground">{role.createdBy}</span>
                                </div>
                            </TableCell>
                            <TableCell className="text-center">{role.candidateCount}</TableCell>
                            <TableCell>
                                <StatusBadge status={role.status} />
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                        <FileEdit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    {/* <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button> */}
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100">
                <div className="text-sm text-muted-foreground">
                    Showing {MOCK_ROLES.length} of 120
                </div>
                <div className="flex gap-2">
                    {/* Pagination placeholder */}
                    <Button variant="outline" size="sm" disabled>Prev</Button>
                    <Button variant="outline" size="sm" className="bg-primary text-primary-foreground border-primary">1</Button>
                    <Button variant="outline" size="sm">2</Button>
                    <Button variant="outline" size="sm">3</Button>
                    <Button variant="outline" size="sm">Next</Button>
                </div>
            </div>
        </div>
    );
}

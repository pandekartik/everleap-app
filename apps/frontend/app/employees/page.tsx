"use client";

import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@everleap/design-system";
import { Plus, MoreHorizontal, Mail } from "lucide-react";

export default function EmployeesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Employees</h1>
                    <p className="text-slate-500">Manage access and roles for your organization.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Invite Employee
                </Button>
            </div>

            <div className="rounded-md border border-slate-100 bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <EmployeeRow
                            name="Steve IT"
                            email="steve@acme.inc"
                            role="Org Admin"
                            status="active"
                            lastActive="Just now"
                        />
                        <EmployeeRow
                            name="Sarah Head of Talent"
                            email="sarah@acme.inc"
                            role="HR Admin"
                            status="active"
                            lastActive="2h ago"
                        />
                        <EmployeeRow
                            name="Mike Manager"
                            email="mike@acme.inc"
                            role="Hiring Manager"
                            status="active"
                            lastActive="Yesterday"
                        />
                        <EmployeeRow
                            name="Rachel Recruiter"
                            email="rachel@acme.inc"
                            role="Recruiter"
                            status="invited"
                            lastActive="-"
                        />
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

function EmployeeRow({ name, email, role, status, lastActive }: any) {
    return (
        <TableRow className="border-slate-100">
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium text-xs">
                        {name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">{name}</p>
                        <p className="text-xs text-slate-500">{email}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-slate-700">{role}</TableCell>
            <TableCell>
                {status === "active" ? (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                    </span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        Pending
                    </span>
                )}
            </TableCell>
            <TableCell className="text-slate-500">{lastActive}</TableCell>
            <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
}

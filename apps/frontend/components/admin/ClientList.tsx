"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Badge,
    Button
} from "@everleap/design-system";
import { MoreHorizontal, ExternalLink, ShieldCheck, Mail } from "lucide-react";

const MOCK_CLIENTS = [
    {
        id: "org_acme",
        name: "Acme Corp",
        adminEmail: "sarah@acme.inc",
        plan: "Enterprise",
        status: "ACTIVE",
        activeJobs: 12,
        joinedDate: "Feb 12, 2024"
    },
    {
        id: "org_globex",
        name: "Globex Corporation",
        adminEmail: "hank@globex.com",
        plan: "Growth",
        status: "ACTIVE",
        activeJobs: 5,
        joinedDate: "Mar 01, 2024"
    },
    {
        id: "org_soylent",
        name: "Soylent Corp",
        adminEmail: "admin@soylent.green",
        plan: "Starter",
        status: "SUSPENDED",
        activeJobs: 0,
        joinedDate: "Jan 10, 2024"
    }
];

export function ClientList() {
    return (
        <div className="bg-card border border-slate-100 rounded-lg">
            <Table>
                <TableHeader className="bg-transparent border-b border-slate-100">
                    <TableRow>
                        <TableHead>Organization</TableHead>
                        <TableHead>Admin</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Active Jobs</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {MOCK_CLIENTS.map((client) => (
                        <TableRow key={client.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                        {client.name.substring(0, 2)}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold">{client.name}</div>
                                        <div className="text-xs text-muted-foreground font-mono">{client.id}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail className="h-3 w-3" />
                                    {client.adminEmail}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-700 border-slate-200">
                                    {client.plan}
                                </Badge>
                            </TableCell>
                            <TableCell>{client.activeJobs}</TableCell>
                            <TableCell>
                                <StatusBadge status={client.status} />
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-primary">
                                    Login as
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

function StatusBadge({ status }: { status: string }) {
    if (status === "ACTIVE") {
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-none hover:bg-emerald-100">Active</Badge>
    }
    if (status === "SUSPENDED") {
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 shadow-none hover:bg-red-100">Suspended</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
}

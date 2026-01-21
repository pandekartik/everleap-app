"use client";

import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@everleap/design-system";
import { Plus, Check, X } from "lucide-react";
import { MOCK_CANDIDATES } from "@/lib/mock-data";

export default function OffersPage() {
    // Filter for offer stage
    const offers = MOCK_CANDIDATES.filter(c => c.stage === "OFFER" || c.stage === "HIRED");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Offers</h1>
                    <p className="text-slate-500">Manage candidate offers and approvals.</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Draft New Offer
                </Button>
            </div>

            <div className="border rounded-lg bg-white overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead>Candidate</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Offer Amount</TableHead>
                            <TableHead>Equity</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Priya Singh</TableCell>
                            <TableCell>Graphic Designer</TableCell>
                            <TableCell>$95,000</TableCell>
                            <TableCell>0.05%</TableCell>
                            <TableCell>
                                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                                    Sent
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="sm">View Details</Button>
                            </TableCell>
                        </TableRow>
                        {/* Placeholder for more offers */}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

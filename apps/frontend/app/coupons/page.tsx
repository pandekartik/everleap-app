"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@everleap/design-system";
import { Plus, Edit, Copy, AlertCircle } from "lucide-react";

export default function CouponsPage() {
    const coupons = [
        {
            id: "coup_launch2026",
            code: "LAUNCH2026",
            type: "percentage",
            amount: 50,
            duration: "repeating",
            durationMonths: 3,
            status: "active",
            used: 15,
            limit: 100,
            expires: "Mar 31, 2026",
            applicablePlans: ["All plans"],
            createdAt: "Jan 1, 2026"
        },
        {
            id: "coup_annual20",
            code: "ANNUAL20",
            type: "percentage",
            amount: 20,
            duration: "forever",
            status: "active",
            used: 8,
            limit: null,
            expires: null,
            applicablePlans: ["Professional", "Enterprise"],
            createdAt: "Dec 15, 2025"
        },
        {
            id: "coup_startup",
            code: "STARTUP100",
            type: "fixed",
            amount: 100,
            duration: "once",
            status: "active",
            used: 42,
            limit: 50,
            expires: "Feb 28, 2026",
            applicablePlans: ["Starter", "Professional"],
            createdAt: "Jan 10, 2026"
        },
        {
            id: "coup_expired",
            code: "NEWYEAR",
            type: "percentage",
            amount: 30,
            duration: "once",
            status: "expired",
            used: 23,
            limit: 50,
            expires: "Jan 15, 2026",
            applicablePlans: ["All plans"],
            createdAt: "Dec 20, 2025"
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>;
            case "expired":
                return <Badge className="bg-slate-100 text-slate-600 border-slate-200">Expired</Badge>;
            case "deactivated":
                return <Badge className="bg-red-50 text-red-700 border-red-200">Deactivated</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getDiscountLabel = (coupon: any) => {
        const discount = coupon.type === "percentage"
            ? `${coupon.amount}% off`
            : `$${coupon.amount} off`;

        if (coupon.duration === "forever") {
            return `${discount} forever`;
        } else if (coupon.duration === "repeating") {
            return `${discount} for ${coupon.durationMonths} months`;
        } else {
            return `${discount} first payment`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Coupon Codes</h1>
                    <p className="text-slate-500">Create and manage discount codes</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Coupon
                </Button>
            </div>

            {/* Stats */}
            <div className="grid sm:grid-cols-3 gap-4">
                <Card className="border-slate-100">
                    <CardContent className="pt-6">
                        <p className="text-sm font-medium text-slate-600">Active Coupons</p>
                        <p className="text-3xl font-bold text-slate-900 mt-2">
                            {coupons.filter(c => c.status === "active").length}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100">
                    <CardContent className="pt-6">
                        <p className="text-sm font-medium text-slate-600">Total Redemptions</p>
                        <p className="text-3xl font-bold text-primary mt-2">
                            {coupons.reduce((sum, c) => sum + c.used, 0)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-slate-100">
                    <CardContent className="pt-6">
                        <p className="text-sm font-medium text-slate-600">Expiring Soon</p>
                        <p className="text-3xl font-bold text-yellow-600 mt-2">2</p>
                    </CardContent>
                </Card>
            </div>

            {/* Coupons List */}
            <div className="space-y-4">
                {coupons.map((coupon) => (
                    <Card key={coupon.id} className={`border-slate-100 ${coupon.status !== "active" ? "opacity-60" : ""}`}>
                        <CardHeader className="pb-3 border-b border-slate-50">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CardTitle className="text-lg font-mono">{coupon.code}</CardTitle>
                                        {getStatusBadge(coupon.status)}
                                        <button className="ml-auto p-1.5 hover:bg-slate-100 rounded">
                                            <Copy className="h-4 w-4 text-slate-400" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-600">{getDiscountLabel(coupon)}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="grid sm:grid-cols-4 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Usage</p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {coupon.used}{coupon.limit ? `/${coupon.limit}` : ""}
                                    </p>
                                    {coupon.limit && (
                                        <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                                            <div
                                                className="bg-primary h-1.5 rounded-full transition-all"
                                                style={{ width: `${(coupon.used / coupon.limit) * 100}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Expires</p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {coupon.expires || "Never"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Applicable Plans</p>
                                    <p className="text-sm font-semibold text-slate-900">
                                        {coupon.applicablePlans.join(", ")}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 mb-1">Created</p>
                                    <p className="text-sm font-semibold text-slate-900">{coupon.createdAt}</p>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-slate-50">
                                <Button variant="outline" size="sm">
                                    <Edit className="mr-2 h-3 w-3" /> Edit
                                </Button>
                                {coupon.status === "active" ? (
                                    <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50">
                                        <AlertCircle className="mr-2 h-3 w-3" /> Deactivate
                                    </Button>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Info Card */}
            <Card className="border-slate-100 bg-purple-50/50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                            <AlertCircle className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-purple-900 mb-1">Coupon Best Practices</h4>
                            <p className="text-sm text-purple-700">
                                Set usage limits to prevent abuse. Monitor redemption rates and adjust expiration dates as needed. Coupons can be deactivated at any time.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

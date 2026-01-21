"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Separator } from "@everleap/design-system";
import { CreditCard, Check, Download } from "lucide-react";

export default function BillingPage() {
    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Billing & Plans</h1>
                <p className="text-slate-500">Manage your subscription and payment details.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Current Plan */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Current Plan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Growth Plan</h3>
                                    <p className="text-slate-500 text-sm">$299/month • Billed monthly</p>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                                    Active
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Check className="h-4 w-4 text-emerald-500" />
                                    <span>Unlimited Job Postings</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Check className="h-4 w-4 text-emerald-500" />
                                    <span>5 Admin Seats included</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Check className="h-4 w-4 text-emerald-500" />
                                    <span>Advanced AI Matching</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex gap-3">
                                <Button variant="outline">Change Plan</Button>
                                <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">Cancel Subscription</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <InvoiceRow date="Oct 01, 2026" amount="$299.00" status="Paid" />
                                <Separator />
                                <InvoiceRow date="Sep 01, 2026" amount="$299.00" status="Paid" />
                                <Separator />
                                <InvoiceRow date="Aug 01, 2026" amount="$299.00" status="Paid" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payment Method */}
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-3 p-3 border rounded-lg bg-slate-50 border-slate-100">
                                <div className="h-8 w-12 bg-white rounded flex items-center justify-center border border-slate-200">
                                    <div className="h-3 w-3 rounded-full bg-red-500 ml-[-6px]" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-500 mr-[-6px]" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">Mastercard ending in 4242</p>
                                    <p className="text-xs text-slate-500">Expires 12/28</p>
                                </div>
                            </div>
                            <Button className="w-full" variant="outline">
                                Update Payment Method
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function InvoiceRow({ date, amount, status }: any) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-900">Invoice #{Math.floor(Math.random() * 10000)}</p>
                <p className="text-xs text-slate-500">{date}</p>
            </div>
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-900">{amount}</span>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4 text-slate-400" />
                </Button>
            </div>
        </div>
    );
}

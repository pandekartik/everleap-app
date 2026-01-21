"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@everleap/design-system";

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports & Analytics</h1>
                <p className="text-slate-500">Track system usage and hiring metrics.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Credit Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 bg-slate-50 flex items-center justify-center rounded border border-dashed text-slate-400">
                            Chart: Monthly Credit Consumption
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Hiring Velocity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 bg-slate-50 flex items-center justify-center rounded border border-dashed text-slate-400">
                            Chart: Time to Hire Trend
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

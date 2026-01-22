"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Badge } from "@everleap/design-system";
import { Plus, Edit, Archive, Check } from "lucide-react";

export default function PlansPage() {
    const plans = [
        {
            id: "plan_starter",
            name: "Starter",
            price: 99,
            interval: "month",
            status: "active",
            description: "Perfect for small teams getting started",
            features: [
                "Up to 10 users",
                "5 active jobs",
                "Basic support",
                "Email notifications",
                "Basic analytics"
            ],
            limits: {
                users: 10,
                jobs: 5,
                storage: "10 GB"
            },
            organizations: 12
        },
        {
            id: "plan_professional",
            name: "Professional",
            price: 299,
            interval: "month",
            status: "active",
            description: "For growing teams with advanced needs",
            features: [
                "Up to 50 users",
                "Unlimited jobs",
                "Priority support",
                "API access",
                "Advanced analytics",
                "Custom workflows",
                "Slack integration"
            ],
            limits: {
                users: 50,
                jobs: "Unlimited",
                storage: "100 GB"
            },
            organizations: 18
        },
        {
            id: "plan_enterprise",
            name: "Enterprise",
            price: 999,
            interval: "month",
            status: "active",
            description: "For large organizations with custom requirements",
            features: [
                "Unlimited users",
                "Unlimited jobs",
                "24/7 dedicated support",
                "API access",
                "Advanced analytics",
                "Custom workflows",
                "SSO & SAML",
                "Custom integrations",
                "SLA guarantees",
                "Dedicated account manager"
            ],
            limits: {
                users: "Unlimited",
                jobs: "Unlimited",
                storage: "Unlimited"
            },
            organizations: 8
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Subscription Plans</h1>
                    <p className="text-slate-500">Create and manage pricing plans</p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Plan
                </Button>
            </div>

            {/* Plans Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id} className={`border-slate-100 ${plan.name === "Professional" ? "border-primary/50 shadow-md" : ""
                        }`}>
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between mb-2">
                                <CardTitle className="text-xl">{plan.name}</CardTitle>
                                {plan.name === "Professional" && (
                                    <Badge className="bg-primary text-white">Popular</Badge>
                                )}
                            </div>
                            <p className="text-sm text-slate-600">{plan.description}</p>
                            <div className="mt-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-slate-900">${plan.price}</span>
                                    <span className="text-slate-500">/{plan.interval}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Features */}
                            <div>
                                <h4 className="text-sm font-semibold text-slate-900 mb-3">Features</h4>
                                <ul className="space-y-2">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                            <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Limits */}
                            <div className="pt-4 border-t border-slate-100">
                                <h4 className="text-sm font-semibold text-slate-900 mb-2">Limits</h4>
                                <div className="space-y-1 text-sm text-slate-600">
                                    <p>• Users: {plan.limits.users}</p>
                                    <p>• Jobs: {plan.limits.jobs}</p>
                                    <p>• Storage: {plan.limits.storage}</p>
                                </div>
                            </div>

                            {/* Usage */}
                            <div className="pt-4 border-t border-slate-100">
                                <p className="text-sm text-slate-600">
                                    <span className="font-semibold text-slate-900">{plan.organizations}</span> organizations on this plan
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-slate-100">
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Edit className="mr-2 h-3 w-3" /> Edit
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                    <Archive className="mr-2 h-3 w-3" /> Archive
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Info Card */}
            <Card className="border-slate-100 bg-blue-50/50">
                <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <Check className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-blue-900 mb-1">Plan Management</h4>
                            <p className="text-sm text-blue-700">
                                Changes to plans will affect new subscriptions immediately. Existing subscriptions will be grandfathered unless manually migrated.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

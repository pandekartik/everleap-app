"use client";

import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from "@everleap/design-system";

export default function SettingsPage() {
    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
                <p className="text-slate-500">Manage your organization profile and preferences.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Organization Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="orgName">Organization Name</Label>
                        <Input type="text" id="orgName" placeholder="Acme Inc." defaultValue="Acme Inc." />
                    </div>

                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="domain">Primary Domain</Label>
                        <Input type="text" id="domain" placeholder="acme.inc" defaultValue="acme.inc" disabled />
                        <p className="text-xs text-slate-500">Contact support to change your primary domain.</p>
                    </div>
                    <div className="grid w-full items-center gap-1.5">
                        <Label htmlFor="logo">Logo URL</Label>
                        <Input type="text" id="logo" placeholder="https://..." defaultValue="https://logo.clearbit.com/acme.com" />
                    </div>
                </CardContent>
                <div className="flex items-center justify-end p-6 pt-0">
                    <Button>Save Changes</Button>
                </div>
            </Card>
        </div>
    );
}

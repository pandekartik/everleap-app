"use client";

import { useState } from "react";
import {
    Button,
    Input,
    Label,
    Badge,
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@everleap/design-system";
import { Plus, X, Building2, DollarSign, Link as LinkIcon, CheckCircle2, XCircle, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { CURRENCY_OPTIONS, ORG_SETTINGS } from "@/lib/org-settings";
import { useAuth } from "@/lib/auth";

export default function SettingsPage() {
    const { user } = useAuth();

    // Parse user name
    const fullName = user?.full_name || "";
    const nameParts = fullName.split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // Get user role/designation
    const designation = user?.roles?.[0]?.replace(/_/g, " ") || "User";

    // Organization Profile
    const [orgName] = useState("Acme Inc.");

    // Departments
    const [departments, setDepartments] = useState<string[]>(ORG_SETTINGS.departments);
    const [newDepartment, setNewDepartment] = useState("");

    // Currency
    const [currency, setCurrency] = useState("USD");

    // LinkedIn
    const [linkedinConnected, setLinkedinConnected] = useState(false);
    const [linkedinOrgId, setLinkedinOrgId] = useState("");

    // Handlers
    const handleAddDepartment = () => {
        if (newDepartment.trim() && !departments.includes(newDepartment.trim())) {
            setDepartments([...departments, newDepartment.trim()]);
            setNewDepartment("");
        }
    };

    const handleRemoveDepartment = (dept: string) => {
        setDepartments(departments.filter(d => d !== dept));
    };

    const handleSaveDepartments = () => {
        toast.success("Departments saved successfully!");
    };

    const handleSaveCurrency = () => {
        toast.success("Default currency saved successfully!");
    };

    const handleConnectLinkedIn = () => {
        // TODO: Implement OAuth flow
        setLinkedinConnected(true);
        toast.success("LinkedIn account connected!");
    };

    const handleDisconnectLinkedIn = () => {
        setLinkedinConnected(false);
        setLinkedinOrgId("");
        toast.info("LinkedIn account disconnected");
    };

    const handleSaveLinkedIn = () => {
        toast.success("LinkedIn settings saved successfully!");
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your organization profile and preferences.</p>
            </div>

            <Accordion type="multiple" className="space-y-4">
                {/* Account Information */}
                <AccordionItem value="account" className="border rounded-lg px-6 bg-white shadow-sm">
                    <AccordionTrigger className="hover:no-underline py-4">
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-slate-600" />
                            <span className="font-semibold">Account Information</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6 pt-2">
                        <p className="text-sm text-slate-500 mb-4">
                            Your personal and organization details
                        </p>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input
                                        type="text"
                                        id="firstName"
                                        value={firstName || ""}
                                        disabled
                                        className="bg-slate-50"
                                    />
                                </div>
                                <div className="grid w-full items-center gap-1.5">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        type="text"
                                        id="lastName"
                                        value={lastName || ""}
                                        disabled
                                        className="bg-slate-50"
                                    />
                                </div>
                            </div>

                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    type="email"
                                    id="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="bg-slate-50"
                                />
                            </div>

                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="designation">Designation</Label>
                                <Input
                                    type="text"
                                    id="designation"
                                    value={designation || ""}
                                    disabled
                                    className="bg-slate-50"
                                />
                            </div>

                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="orgNameReadonly">Organization Name</Label>
                                <Input
                                    type="text"
                                    id="orgNameReadonly"
                                    value={orgName || ""}
                                    disabled
                                    className="bg-slate-50"
                                />
                            </div>

                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="domainReadonly">Primary Domain</Label>
                                <Input
                                    type="text"
                                    id="domainReadonly"
                                    value="acme.inc"
                                    disabled
                                    className="bg-slate-50"
                                />
                                <p className="text-xs text-slate-500">Contact support to update these details.</p>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {user?.roles?.includes("ORG_ADMIN") && (
                    <>
                        {/* Departments */}
                        <AccordionItem value="departments" className="border rounded-lg px-6 bg-white shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-slate-600" />
                                    <span className="font-semibold">Departments</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 pt-2">
                                <p className="text-sm text-slate-500 mb-4">
                                    Manage departments shown in job creation dropdown
                                </p>
                                <div className="space-y-4">
                                    {/* Add Department */}
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            value={newDepartment || ""}
                                            onChange={(e) => setNewDepartment(e.target.value)}
                                            onKeyPress={(e) => e.key === "Enter" && handleAddDepartment()}
                                            placeholder="Enter department name..."
                                            className="flex-1"
                                        />
                                        <Button onClick={handleAddDepartment} size="sm">
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add
                                        </Button>
                                    </div>

                                    {/* Department List */}
                                    <div className="flex flex-wrap gap-2">
                                        {departments.map((dept) => (
                                            <Badge
                                                key={dept}
                                                variant="secondary"
                                                className="px-3 py-1.5 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            >
                                                {dept}
                                                <button
                                                    onClick={() => handleRemoveDepartment(dept)}
                                                    className="ml-2 text-slate-500 hover:text-slate-700"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>

                                    {departments.length === 0 && (
                                        <p className="text-sm text-slate-500 text-center py-4">
                                            No departments added yet. Add your first department above.
                                        </p>
                                    )}

                                    <div className="flex items-center justify-end pt-2">
                                        <Button onClick={handleSaveDepartments}>Save Departments</Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* Currency */}
                        <AccordionItem value="currency" className="border rounded-lg px-6 bg-white shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-slate-600" />
                                    <span className="font-semibold">Default Currency</span>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 pt-2">
                                <p className="text-sm text-slate-500 mb-4">
                                    Set the default currency for job compensation
                                </p>
                                <div className="space-y-4">
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="currency">Currency</Label>
                                        <select
                                            id="currency"
                                            value={currency || "USD"}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                                        >
                                            {CURRENCY_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-slate-500">
                                            This currency will be used as the default when creating new jobs
                                        </p>
                                    </div>

                                    {/* Preview */}
                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                        <p className="text-xs text-slate-500 mb-2">Preview:</p>
                                        <p className="text-sm text-slate-700">
                                            Salary Range: {CURRENCY_OPTIONS.find(c => c.value === currency)?.symbol}100,000 - {CURRENCY_OPTIONS.find(c => c.value === currency)?.symbol}150,000
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-end pt-2">
                                        <Button onClick={handleSaveCurrency}>Save Currency</Button>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* LinkedIn Integration */}
                        <AccordionItem value="linkedin" className="border rounded-lg px-6 bg-white shadow-sm">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center justify-between flex-1 mr-2">
                                    <div className="flex items-center gap-2">
                                        <LinkIcon className="h-5 w-5 text-slate-600" />
                                        <span className="font-semibold">LinkedIn Integration</span>
                                    </div>
                                    {linkedinConnected ? (
                                        <Badge variant="default" className="bg-emerald-500">
                                            <CheckCircle2 className="h-3 w-3 mr-1" />
                                            Connected
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Not Connected
                                        </Badge>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 pt-2">
                                <p className="text-sm text-slate-500 mb-4">
                                    Connect your LinkedIn account to post jobs to your company page
                                </p>
                                <div className="space-y-4">
                                    {/* OAuth Connection */}
                                    <div className="space-y-2">
                                        <Label>LinkedIn Account</Label>
                                        {linkedinConnected ? (
                                            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                    <span className="text-sm text-emerald-700">LinkedIn account connected</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={handleDisconnectLinkedIn}
                                                    className="text-emerald-700 hover:text-emerald-800"
                                                >
                                                    Disconnect
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={handleConnectLinkedIn}
                                                variant="outline"
                                                className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                            >
                                                <LinkIcon className="h-4 w-4 mr-2" />
                                                Connect LinkedIn Account
                                            </Button>
                                        )}
                                    </div>

                                    {/* Organization ID */}
                                    {linkedinConnected && (
                                        <>
                                            <div className="grid w-full items-center gap-1.5">
                                                <Label htmlFor="linkedinOrgId">LinkedIn Organization ID</Label>
                                                <Input
                                                    type="text"
                                                    id="linkedinOrgId"
                                                    value={linkedinOrgId || ""}
                                                    onChange={(e) => setLinkedinOrgId(e.target.value)}
                                                    placeholder="e.g., 123456789"
                                                />
                                                <p className="text-xs text-slate-500">
                                                    Enter your company&apos;s LinkedIn Organization ID to post jobs to your company page instead of your personal profile.{" "}
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <button className="text-primary hover:underline font-medium inline-block bg-transparent border-0 p-0 cursor-pointer focus:outline-none ml-1">
                                                                How to find it?
                                                            </button>
                                                        </DialogTrigger>
                                                        <DialogContent className="sm:max-w-md">
                                                            <DialogHeader>
                                                                <DialogTitle>Find your LinkedIn Organization ID</DialogTitle>
                                                                <DialogDescription>
                                                                    Follow these steps to locate your unique company identifier.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-4 pt-2">
                                                                <ol className="list-decimal list-inside space-y-3 text-sm text-slate-600">
                                                                    <li>Sign in to LinkedIn as an admin for your Company Page.</li>
                                                                    <li>Navigate to your company&apos;s page view.</li>
                                                                    <li>Look at the URL in your browser&apos;s address bar. It should look somewhat like this:</li>
                                                                </ol>
                                                                <div className="bg-slate-100 p-3 rounded-md text-xs font-mono break-all text-slate-800 border border-slate-200">
                                                                    https://www.linkedin.com/company/<span className="font-bold text-blue-600">12345678</span>/admin
                                                                </div>
                                                                <p className="text-sm text-slate-600">
                                                                    The numeric code (e.g., <span className="font-semibold">12345678</span>) in the URL is your Organization ID.
                                                                </p>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-end pt-2">
                                                <Button onClick={handleSaveLinkedIn}>Save LinkedIn Settings</Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </>
                )}
            </Accordion>
        </div>
    );
}

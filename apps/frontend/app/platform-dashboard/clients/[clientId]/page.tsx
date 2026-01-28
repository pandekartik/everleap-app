"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@everleap/design-system";
import { Loader2, ArrowLeft, Mail, Phone, Calendar, Shield, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Company {
    id: string;
    name: string;
    domain: string;
    subscription_tier: string;
    is_active: boolean;
    created_at: string;
    total_employees?: number;
    total_jobs?: number;
    api_credits_used?: number;
    api_credits_limit?: number;
}

interface User {
    id: string;
    full_name: string;
    email: string;
    roles: string[];
    is_active: boolean;
    created_at: string;
}

export default function ClientDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const clientId = params.clientId as string;

    const [company, setCompany] = useState<Company | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [companyRes, usersRes] = await Promise.all([
                    api.get(`/companies/${clientId}`),
                    api.get(`/companies/${clientId}/users`)
                ]);
                setCompany(companyRes.data);
                setUsers(usersRes.data.items || usersRes.data); // Handle paginated or list response
            } catch (error) {
                console.error("Failed to fetch details:", error);
                toast.error("Failed to load company details");
            } finally {
                setIsLoading(false);
            }
        };

        if (clientId) {
            fetchData();
        }
    }, [clientId]);

    const handleDeleteUser = async (userId: string) => {
        // Placeholder for delete functionality
        toast.error("User deletion is not yet implemented on the backend.");
    };

    const handleResetPassword = async (userId: string) => {
        // Placeholder for password reset functionality
        toast.success("Password reset email would be sent here.");
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!company) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <h2 className="text-xl font-semibold">Company not found</h2>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Button variant="ghost" size="sm" className="mb-4 pl-0 hover:bg-transparent hover:text-primary" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Clients
                </Button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{company.name}</h1>
                        <p className="text-slate-500 mt-1">{company.domain}</p>
                    </div>
                    <Badge className={company.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}>
                        {company.is_active ? "Active" : "Inactive"}
                    </Badge>
                </div>
            </div>

            {/* Company Details Card */}
            <div className="grid md:grid-cols-3 gap-6">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Organization Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Subscription Plan</p>
                            <p className="text-base font-medium capitalize">{company.subscription_tier}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">Member Since</p>
                            <p className="text-base font-medium flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-slate-400" />
                                {format(new Date(company.created_at), "MMMM d, yyyy")}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 mb-1">API Credits</p>
                            <p className="text-base font-medium">
                                {company.api_credits_used ?? 0} / {company.api_credits_limit ?? "Unlimited"}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats / Quick Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm">Total Users</span>
                            <span className="font-bold">{users.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 text-sm">Active Jobs</span>
                            <span className="font-bold">{company.total_jobs ?? "-"}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Users</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                                        No users found for this organization.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-slate-900">{user.full_name}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                    <Mail className="h-3 w-3" /> {user.email}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-1 flex-wrap">
                                                {user.roles.map((role) => (
                                                    <Badge key={role} variant="outline" className="text-xs">
                                                        {role}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.is_active ? "default" : "secondary"} className={user.is_active ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : ""}>
                                                {user.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {format(new Date(user.created_at), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-orange-600 hover:bg-orange-50"
                                                    onClick={() => handleResetPassword(user.id)}
                                                    title="Reset Password"
                                                >
                                                    <KeyRound className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

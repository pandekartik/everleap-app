"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import {
    Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
    Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@everleap/design-system";
import { Plus, Trash2, Key, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EmployeesPage() {
    const { user, requestPasswordReset } = useAuth();
    const [employees, setEmployees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showInviteDialog, setShowInviteDialog] = useState(false);
    const [inviteValues, setInviteValues] = useState({ fullName: "", email: "", role: "HR" });
    const [isInviting, setIsInviting] = useState(false);

    const handleInvite = async () => {
        if (!user?.company_id) return;

        setIsInviting(true);
        try {
            const payload = {
                full_name: inviteValues.fullName,
                email: inviteValues.email,
                role: inviteValues.role
            };

            const { data } = await api.post(`/companies/${user.company_id}/users`, payload);

            setEmployees(prev => [data, ...prev]);
            toast.success("Invitation sent successfully");
            setShowInviteDialog(false);
            setInviteValues({ fullName: "", email: "", role: "HR" });
        } catch (error: any) {
            console.error("Failed to invite user", error);
            const msg = error.response?.data?.detail || "Failed to invite user";
            toast.error(msg);
        } finally {
            setIsInviting(false);
        }
    };

    useEffect(() => {
        const fetchEmployees = async () => {
            if (user?.company_id) {
                try {
                    const { data } = await api.get(`/companies/${user.company_id}/users`);
                    setEmployees(data.items);
                } catch (error) {
                    console.error("Failed to fetch employees", error);
                    toast.error("Failed to load employees");
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchEmployees();
    }, [user?.company_id]);

    const handleResetPassword = async (email: string) => {
        try {
            await requestPasswordReset(email);
        } catch (error) {
            // Error handled in auth provider
        }
    };

    const handleDeleteClick = (employee: any) => {
        if (employee.roles.includes("ADMIN") || employee.roles.includes("ORG_ADMIN")) {
            toast.error("Cannot delete an Administrator.");
            return;
        }
        setDeleteId(employee.id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;

        // Placeholder for delete since endpoint doesn't exist yet
        toast.error("Delete feature is currently disabled.");
        setDeleteId(null);

        /* 
        // Future implementation when endpoint exists
        try {
            await api.delete(`/users/${deleteId}`);
            setEmployees(prev => prev.filter(e => e.id !== deleteId));
            toast.success("User deleted successfully");
        } catch (error) {
            toast.error("Failed to delete user");
        } finally {
            setDeleteId(null);
        }
        */
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Employees</h1>
                    <p className="text-slate-500">Manage access and roles for your organization.</p>
                </div>
                <Button onClick={() => setShowInviteDialog(true)}>
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
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                                </TableCell>
                            </TableRow>
                        ) : employees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                    No employees found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees.map((employee) => (
                                <EmployeeRow
                                    key={employee.id}
                                    employee={employee}
                                    onReset={() => handleResetPassword(employee.email)}
                                    onDelete={() => handleDeleteClick(employee)}
                                    isCurrentUser={user?.id === employee.id}
                                />
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure?</DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the user account.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Employee</DialogTitle>
                        <DialogDescription>
                            Send an invitation to a new team member. They will receive an email to set their password.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={inviteValues.fullName}
                                onChange={(e) => setInviteValues(prev => ({ ...prev, fullName: e.target.value }))}
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={inviteValues.email}
                                onChange={(e) => setInviteValues(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="e.g. john@example.com"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowInviteDialog(false)}>Cancel</Button>
                        <Button onClick={handleInvite} disabled={isInviting}>
                            {isInviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Send Invitation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
}

function EmployeeRow({ employee, onReset, onDelete, isCurrentUser }: any) {
    const isAdmin = employee.roles.includes("ADMIN") || employee.roles.includes("ORG_ADMIN");

    return (
        <TableRow className="border-slate-100">
            <TableCell>
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-medium text-xs">
                        {employee.full_name?.substring(0, 2).toUpperCase() || "U"}
                    </div>
                    <div>
                        <p className="font-medium text-slate-900">
                            {employee.full_name}
                            {isCurrentUser && <span className="ml-2 text-xs text-slate-400">(You)</span>}
                        </p>
                        <p className="text-xs text-slate-500">{employee.email}</p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="text-slate-700 text-sm">
                {employee.roles.map((r: string) => r.replace("_", " ")).join(", ")}
            </TableCell>
            <TableCell>
                {employee.is_active ? (
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                    </span>
                ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                        Inactive
                    </span>
                )}
            </TableCell>
            <TableCell className="text-slate-500 text-sm">
                {new Date(employee.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600" onClick={onReset}>
                                    <Key className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reset Password</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {!isAdmin && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={onDelete}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete User</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}

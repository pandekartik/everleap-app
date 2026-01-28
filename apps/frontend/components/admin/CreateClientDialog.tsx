"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Button,
    Input,
    Label,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@everleap/design-system";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const clientSchema = z.object({
    name: z.string().min(2, "Company name must be at least 2 characters"),
    domain: z.string().min(3, "Domain is required"),
    adminName: z.string().min(2, "Admin name is required"),
    adminEmail: z.string().email("Invalid email address"),
    plan: z.enum(["basic", "pro", "enterprise"]),
});

type ClientFormValues = z.infer<typeof clientSchema>;

interface CreateClientDialogProps {
    onSuccess?: () => void;
}

export function CreateClientDialog({ onSuccess }: CreateClientDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: "",
            domain: "",
            adminName: "",
            adminEmail: "",
            plan: "pro", // Default to middle tier or basic
        },
    });

    const onSubmit = async (data: ClientFormValues) => {
        setIsSubmitting(true);
        try {
            // 1. Create Company
            const companyResponse = await api.post("/companies", {
                name: data.name,
                domain: data.domain,
                subscription_tier: data.plan,
            });

            const companyId = companyResponse.data.id;

            // 2. Create Admin User
            await api.post(`/companies/${companyId}/users`, {
                email: data.adminEmail,
                full_name: data.adminName,
                role: "ADMIN",
            });

            toast.success(`Organization "${data.name}" created successfully`, {
                description: `Invitation sent to ${data.adminEmail}`
            });

            setOpen(false);
            form.reset();
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to create organization");
            form.setError("root", {
                message: error.response?.data?.detail || "An unexpected error occurred. Please try again."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Onboard New Client
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Onboard New Client</DialogTitle>
                    <DialogDescription>
                        Create a new organization tenant. The provided admin will receive an email to activate their account.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Organization Name</Label>
                            <Input
                                id="name"
                                placeholder="Acme Inc."
                                {...form.register("name")}
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="domain">Domain</Label>
                            <Input
                                id="domain"
                                placeholder="acme.com"
                                {...form.register("domain")}
                            />
                            {form.formState.errors.domain && (
                                <p className="text-sm text-red-500">{form.formState.errors.domain.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adminName">Admin Full Name</Label>
                        <Input
                            id="adminName"
                            placeholder="John Doe"
                            {...form.register("adminName")}
                        />
                        {form.formState.errors.adminName && (
                            <p className="text-sm text-red-500">{form.formState.errors.adminName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Admin Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="admin@company.com"
                            {...form.register("adminEmail")}
                        />
                        {form.formState.errors.adminEmail && (
                            <p className="text-sm text-red-500">{form.formState.errors.adminEmail.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="plan">Subscription Plan</Label>
                        <Select
                            onValueChange={(val) => form.setValue("plan", val as any)}
                            defaultValue={form.getValues("plan")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="basic">Basic (up to 3 jobs)</SelectItem>
                                <SelectItem value="pro">Pro (unlimited)</SelectItem>
                                <SelectItem value="enterprise">Enterprise (SSO + Custom)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {form.formState.errors.root && (
                        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
                            {form.formState.errors.root.message}
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Organization
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

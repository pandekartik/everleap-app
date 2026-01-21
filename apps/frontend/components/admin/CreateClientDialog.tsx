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

const clientSchema = z.object({
    name: z.string().min(2, "Company name must be at least 2 characters"),
    adminEmail: z.string().email("Invalid email address"),
    plan: z.enum(["STARTER", "GROWTH", "ENTERPRISE"]),
});

type ClientFormValues = z.infer<typeof clientSchema>;

export function CreateClientDialog() {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: "",
            adminEmail: "",
            plan: "GROWTH",
        },
    });

    const onSubmit = async (data: ClientFormValues) => {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        console.log("Creating client:", data);
        toast.success(`Organization "${data.name}" created successfully`, {
            description: `Invitation sent to ${data.adminEmail}`
        });

        setIsSubmitting(false);
        setOpen(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Onboard New Client
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Onboard New Client</DialogTitle>
                    <DialogDescription>
                        Create a new organization tenant. The admin will receive an email to set up their account.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                                <SelectItem value="STARTER">Starter (up to 3 jobs)</SelectItem>
                                <SelectItem value="GROWTH">Growth (unlimited)</SelectItem>
                                <SelectItem value="ENTERPRISE">Enterprise (SSO + Custom)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

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

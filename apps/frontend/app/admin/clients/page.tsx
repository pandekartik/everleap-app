import { Button } from "@everleap/design-system";
import { Plus } from "lucide-react";
import { ClientList } from "@/components/admin/ClientList";
import { CreateClientDialog } from "@/components/admin/CreateClientDialog";

export default function AdminClientsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clients</h1>
                    <p className="text-slate-500">Manage organizations and their subscriptions.</p>
                </div>
                <CreateClientDialog />
            </div>

            <ClientList />
        </div>
    );
}

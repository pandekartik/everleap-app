import { Badge } from "@everleap/design-system";
import { CheckCircle2, Clock, PauseCircle, FileEdit } from "lucide-react";
import { RoleStatus } from "@/lib/mock-data";

export function StatusBadge({ status }: { status: RoleStatus }) {
    switch (status) {
        case "OPEN":
            return (
                <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 gap-1.5 pl-1 pr-2.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Open
                </Badge>
            );
        case "CLOSED":
            return (
                <Badge variant="secondary" className="gap-1.5 pl-1 pr-2.5 text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Closed
                </Badge>
            );
        case "PAUSED":
            return (
                <Badge variant="outline" className="gap-1.5 pl-1 pr-2.5 border-amber-200 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400">
                    <PauseCircle className="h-3.5 w-3.5" />
                    In Progress
                </Badge>
            );
        case "DRAFT":
            return (
                <Badge variant="outline" className="gap-1.5 pl-1 pr-2.5 border-dashed">
                    <FileEdit className="h-3.5 w-3.5" />
                    Draft
                </Badge>
            );
        default:
            return <Badge>{status}</Badge>;
    }
}

import { Badge } from "@everleap/design-system";
import { CheckCircle2, Clock, PauseCircle, FileEdit } from "lucide-react";
import type { JobStatus } from "@/lib/types";

// Support both old mock status and new API status
type DisplayStatus = "OPEN" | "CLOSED" | "PAUSED" | "DRAFT" | "PUBLISHED";

function normalizeStatus(status: JobStatus | string): DisplayStatus {
    const statusUpper = status.toUpperCase();

    // Map API statuses to display statuses
    if (statusUpper === "PUBLISHED") return "OPEN";
    if (statusUpper === "DRAFT") return "DRAFT";
    if (statusUpper === "PAUSED") return "PAUSED";
    if (statusUpper === "CLOSED") return "CLOSED";
    if (statusUpper === "OPEN") return "OPEN";
    if (statusUpper === "DRAFT_ERROR") return "DRAFT";

    // Default to OPEN for unknown statuses
    return "OPEN";
}

export function StatusBadge({ status }: { status: JobStatus | string }) {
    const displayStatus = normalizeStatus(status);

    switch (displayStatus) {
        case "OPEN":
        case "PUBLISHED":
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
                    Paused
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
            return <Badge>{displayStatus}</Badge>;
    }
}

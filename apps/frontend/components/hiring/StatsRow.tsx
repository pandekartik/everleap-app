import { Card, CardContent, CardHeader, CardTitle } from "@everleap/design-system";
import { MOCK_ROLES } from "@/lib/mock-data";

export function StatsRow() {
    const totalRoles = 120; // Mock from design
    const openRoles = 120;
    const closedRoles = 120;

    // In a real app, calculate from data
    // const openRoles = MOCK_ROLES.filter(r => r.status === "OPEN").length;

    return (
        <div className="grid gap-4 md:grid-cols-4 mb-6">
            <StatCard title="Total Roles" value={totalRoles} />
            <StatCard title="Open Roles" value={openRoles} />
            <StatCard title="Closed Roles" value={closedRoles} />
            <StatCard title="Total Roles" value={totalRoles} />
        </div>
    );
}

function StatCard({ title, value }: { title: string, value: number }) {
    return (
        <Card className="rounded-none border-l-0 border-t-0 border-b-0 shadow-none first:border-l last:border-r border-r border-slate-100 h-24 flex flex-col justify-center">
            {/* The design has a specific look: white cards, simple text. 
                 The reference image actually shows them as a joined strip. 
                 Let's approximate that with a grid but styled cleaner. */}
            <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-2xl font-bold">{value}</div>
            </CardContent>
        </Card>
    );
}

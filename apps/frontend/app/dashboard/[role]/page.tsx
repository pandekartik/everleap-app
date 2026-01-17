import { Card, CardContent, CardHeader, CardTitle } from "@everleap/design-system";
import { Construction } from "lucide-react";

export default function DashboardPage() {
    return (
        <div className="flex flex-col gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Dashboard Overview</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                        <Construction className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Under Development</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        This dashboard is currently being built. Check back soon for updates on stats and metrics.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

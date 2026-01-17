"use client";

import Link from "next/link";
import { Button } from "@everleap/design-system";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <div className="container flex max-w-md flex-col items-center text-center">
                <div className="rounded-full bg-destructive/10 p-4 mb-6">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight mb-2">404</h1>
                <h2 className="text-xl font-semibold mb-4">Page Not Found</h2>
                <p className="text-muted-foreground mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Button asChild>
                    <Link href="/">
                        Go to Login
                    </Link>
                </Button>
            </div>
        </div>
    );
}

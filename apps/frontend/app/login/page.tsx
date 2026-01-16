import { Button } from "@everleap/design-system";
import { EverleapLogo } from "@everleap/design-system";
import Link from "next/link";
import { Input } from "@everleap/design-system";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30">
            <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-sm border">
                <div className="flex flex-col items-center mb-8">
                    <EverleapLogo className="h-10 w-10 mb-2" />
                    <h1 className="text-2xl font-bold">Welcome Back</h1>
                    <p className="text-sm text-muted-foreground">Sign in to your Everleap account</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input type="email" placeholder="name@company.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input type="password" placeholder="••••••••" />
                    </div>
                    <Button className="w-full">Sign In</Button>
                </div>

                <div className="mt-6 text-center text-sm">
                    <Link href="/" className="text-muted-foreground hover:text-primary">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

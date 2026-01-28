"use client";

import { Button, Input, Label } from "@everleap/design-system";
import { useAuth } from "@/lib/auth";
import { ShieldCheck, Users, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@everleap/design-system";

export default function LoginPage() {
    const { login, registerCandidate } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Login State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Register State
    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");
    const [regName, setRegName] = useState("");
    const [regPhone, setRegPhone] = useState("");

    // Password Visibility State
    const [showPassword, setShowPassword] = useState(false);
    const [showRegPassword, setShowRegPassword] = useState(false);

    const [validationError, setValidationError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        if (!email || !password) {
            setValidationError("Please enter both email and password");
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
        } catch (error: any) {
            // Error is handled in AuthProvider but re-thrown
            setValidationError(error.response?.data?.detail || "Invalid email or password");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regEmail || !regPassword || !regName) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsLoading(true);
        try {
            await registerCandidate({
                email: regEmail,
                password: regPassword,
                full_name: regName,
                phone: regPhone
            });
            setIsRegisterOpen(false);
            setEmail(regEmail); // Pre-fill login email for convenience
            toast.success("Account created successfully. Please log in with your email and password.");
        } catch (error) {
            // Error handled in provider
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 shadow-xl rounded-2xl overflow-hidden bg-card border">
                {/* Left Side: Brand & Context */}
                <div className="p-8 md:p-12 bg-zinc-900 text-white flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-8">
                            <img src="/Logo.svg" alt="Everleap" className="h-8 w-auto invert brightness-0" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            Autonomous hiring for modern teams.
                        </h1>
                        <p className="text-zinc-400 text-lg">
                            Experience how Everleap automates the grunt work while you keep the control.
                        </p>
                    </div>
                    <div className="mt-12 space-y-4">
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                <ShieldCheck className="h-4 w-4" />
                            </div>
                            <span>Enterprise-grade security</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-300">
                            <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                                <Users className="h-4 w-4" />
                            </div>
                            <span>Human-in-the-loop control</span>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Form */}
                <div className="p-8 md:p-12 flex flex-col justify-center">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
                        <p className="text-muted-foreground">Enter your credentials to access your account.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="name@company.com"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                                disabled={isLoading}
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <button type="button" className="text-xs text-primary hover:underline font-medium">
                                    Forgot password?
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    disabled={isLoading}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? "Signing in..." : "Sign in"}
                        </Button>

                        {validationError && (
                            <div className="p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-600">
                                {validationError}
                            </div>
                        )}

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    size="lg"
                                    type="button"
                                    disabled={isLoading}
                                >
                                    Register as Candidate
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create an Account</DialogTitle>
                                    <DialogDescription>
                                        Register as a candidate to apply for jobs and track your applications.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleRegister} className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-name">Full Name</Label>
                                        <Input
                                            id="reg-name"
                                            placeholder="John Doe"
                                            value={regName}
                                            onChange={(e) => setRegName(e.target.value)}
                                            autoComplete="name"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-email">Email</Label>
                                        <Input
                                            id="reg-email"
                                            placeholder="john@example.com"
                                            type="email"
                                            value={regEmail}
                                            onChange={(e) => setRegEmail(e.target.value)}
                                            autoComplete="email"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-phone">Phone (Optional)</Label>
                                        <Input
                                            id="reg-phone"
                                            placeholder="+1 (555) 000-0000"
                                            value={regPhone}
                                            onChange={(e) => setRegPhone(e.target.value)}
                                            autoComplete="tel"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="reg-password">Password</Label>
                                        <div className="relative">
                                            <Input
                                                id="reg-password"
                                                type={showRegPassword ? "text" : "password"}
                                                value={regPassword}
                                                onChange={(e) => setRegPassword(e.target.value)}
                                                autoComplete="new-password"
                                                required
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowRegPassword(!showRegPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            >
                                                {showRegPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? "Creating Account..." : "Create Account"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </form>
                </div>
            </div>
        </div>
    );
}

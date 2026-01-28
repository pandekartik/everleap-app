"use client";

import { Button, Input, Label } from "@everleap/design-system";
import { useAuth } from "@/lib/auth";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const { requestPasswordReset } = useAuth();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await requestPasswordReset(email);
            setIsSubmitted(true);
        } catch (error) {
            // Error handling is in auth provider (toast)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
            <div className="max-w-md w-full bg-card shadow-xl rounded-2xl overflow-hidden border p-8 md:p-12">
                <div className="flex justify-center mb-8">
                    <img src="/Logo.svg" alt="Everleap" className="h-8 w-auto invert brightness-0 dark:invert-0" />
                </div>

                {!isSubmitted ? (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold mb-2">Reset Password</h1>
                            <p className="text-muted-foreground text-sm">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>

                            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                                {isLoading ? "Sending Link..." : "Send Reset Link"}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold mb-2">Check your email</h2>
                        <p className="text-muted-foreground text-sm mb-8">
                            If an account exists for <strong>{email}</strong>, we have sent a password reset link to it.
                        </p>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link href="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-3 w-3 mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

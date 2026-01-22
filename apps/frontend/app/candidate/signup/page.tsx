"use client";

import { Button, Input, Label } from "@everleap/design-system";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/mock-auth";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export default function CandidateSignupPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        agreeToTerms: false
    });
    const [isLoading, setIsLoading] = useState(false);

    // Password strength indicator
    const getPasswordStrength = (password: string) => {
        if (!password) return { strength: 0, label: "" };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const labels = ["", "Weak", "Fair", "Good", "Strong"];
        return { strength, label: labels[strength] };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            toast.error("Please fill in all required fields");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }

        if (formData.password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        if (!formData.agreeToTerms) {
            toast.error("Please agree to the Terms and Privacy Policy");
            return;
        }

        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock signup success
        login("CANDIDATE");
        toast.success("Account created successfully!");

        // Check if came from job application (would be passed via URL param)
        const jobId = new URLSearchParams(window.location.search).get("jobId");
        if (jobId) {
            router.push(`/apply/${jobId}`);
        } else {
            router.push("/candidate/dashboard");
        }

        setIsLoading(false);
    };

    const handleSocialSignup = async (provider: string) => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        login("CANDIDATE");
        toast.success(`Account created with ${provider}`);
        router.push("/candidate/dashboard");
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/">
                        <h1 className="text-3xl font-bold text-slate-900">Everleap</h1>
                    </Link>
                    <p className="text-slate-600 mt-2">Create your candidate account</p>
                </div>

                {/* Signup Card */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
                    <form onSubmit={handleSignup} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => updateField("firstName", e.target.value)}
                                    placeholder="Sarah"
                                    className="mt-1.5"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => updateField("lastName", e.target.value)}
                                    placeholder="Chen"
                                    className="mt-1.5"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => updateField("email", e.target.value)}
                                placeholder="you@example.com"
                                className="mt-1.5"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="phone">Phone (Optional)</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => updateField("phone", e.target.value)}
                                placeholder="+1 (555) 123-4567"
                                className="mt-1.5"
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => updateField("password", e.target.value)}
                                placeholder="At least 8 characters"
                                className="mt-1.5"
                                required
                            />
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 w-full rounded-full ${level <= passwordStrength.strength
                                                        ? passwordStrength.strength === 1
                                                            ? "bg-red-500"
                                                            : passwordStrength.strength === 2
                                                                ? "bg-orange-500"
                                                                : passwordStrength.strength === 3
                                                                    ? "bg-yellow-500"
                                                                    : "bg-green-500"
                                                        : "bg-slate-200"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Password strength: {passwordStrength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => updateField("confirmPassword", e.target.value)}
                                placeholder="Re-enter your password"
                                className="mt-1.5"
                                required
                            />
                            {formData.confirmPassword && (
                                <div className="flex items-center gap-2 mt-2">
                                    {formData.password === formData.confirmPassword ? (
                                        <>
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span className="text-xs text-green-600">Passwords match</span>
                                        </>
                                    ) : (
                                        <>
                                            <X className="h-4 w-4 text-red-600" />
                                            <span className="text-xs text-red-600">Passwords don't match</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={(e) => updateField("agreeToTerms", e.target.checked)}
                                className="mt-1 rounded border-slate-300"
                                required
                            />
                            <label htmlFor="agreeToTerms" className="text-sm text-slate-600">
                                I agree to the{" "}
                                <Link href="/terms" className="text-primary hover:underline">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link href="/privacy" className="text-primary hover:underline">
                                    Privacy Policy
                                </Link>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? "Creating account..." : "Create account"}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-slate-500">Or sign up with</span>
                        </div>
                    </div>

                    {/* Social Signup */}
                    <div className="space-y-3">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleSocialSignup("LinkedIn")}
                            disabled={isLoading}
                        >
                            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                            Continue with LinkedIn
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleSocialSignup("Google")}
                            disabled={isLoading}
                        >
                            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </Button>
                    </div>

                    {/* Sign in link */}
                    <p className="text-center text-sm text-slate-600 mt-6">
                        Already have an account?{" "}
                        <Link
                            href="/candidate/login"
                            className="text-primary font-medium hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Additional links */}
                <div className="text-center mt-6 text-sm text-slate-500">
                    <Link href="/privacy" className="hover:text-slate-700">Privacy</Link>
                    <span className="mx-2">•</span>
                    <Link href="/terms" className="hover:text-slate-700">Terms</Link>
                    <span className="mx-2">•</span>
                    <Link href="/help" className="hover:text-slate-700">Help</Link>
                </div>
            </div>
        </div>
    );
}

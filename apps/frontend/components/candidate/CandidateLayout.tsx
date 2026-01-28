"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@everleap/design-system";
import { LogOut, User, Settings, HelpCircle } from "lucide-react";
import { useState } from "react";

interface CandidateLayoutProps {
    children: React.ReactNode;
}

export default function CandidateLayout({ children }: CandidateLayoutProps) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        router.push("/candidate/login");
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Nav */}
                        <div className="flex items-center gap-8">
                            {/* Mobile menu button */}
                            <button
                                className="md:hidden p-2 rounded-md hover:bg-slate-100"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <Link href="/candidate/dashboard">
                                <h1 className="text-xl font-bold text-slate-900">Everleap</h1>
                            </Link>

                            <nav className="hidden md:flex items-center gap-1">
                                <Link href="/candidate/dashboard">
                                    <Button variant="ghost" size="sm">
                                        Dashboard
                                    </Button>
                                </Link>
                            </nav>
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-100 transition-colors"
                            >
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-primary">
                                        {user?.full_name?.charAt(0) || "U"}
                                    </span>
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-sm font-medium text-slate-900">{user?.full_name || "User"}</p>
                                    <p className="text-xs text-slate-500">Candidate</p>
                                </div>
                                <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isUserMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-slate-200 shadow-lg z-20">
                                        <div className="p-3 border-b border-slate-100">
                                            <p className="text-sm font-medium text-slate-900">{user?.full_name}</p>
                                            <p className="text-xs text-slate-500">{user?.email}</p>
                                        </div>
                                        <div className="py-1">
                                            <Link
                                                href="/candidate/profile"
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <User className="h-4 w-4" />
                                                My Profile
                                            </Link>
                                            <Link
                                                href="/candidate/settings"
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <Settings className="h-4 w-4" />
                                                Settings
                                            </Link>
                                            <Link
                                                href="/help"
                                                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                <HelpCircle className="h-4 w-4" />
                                                Help & Support
                                            </Link>
                                        </div>
                                        <div className="border-t border-slate-100 py-1">
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 bg-white p-4">
                        <nav className="space-y-2">
                            <Link
                                href="/candidate/dashboard"
                                className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Dashboard
                            </Link>
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main>{children}</main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-white mt-auto">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-slate-500">
                            © 2026 Everleap. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm">
                            <Link href="/privacy" className="text-slate-500 hover:text-slate-700">
                                Privacy Policy
                            </Link>
                            <Link href="/terms" className="text-slate-500 hover:text-slate-700">
                                Terms of Service
                            </Link>
                            <Link href="/help" className="text-slate-500 hover:text-slate-700">
                                Contact Support
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

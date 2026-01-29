"use client";

import Link from "next/link";
import { Button } from "@everleap/design-system";
import { useEffect, useState } from "react";
import { List, X } from "@phosphor-icons/react";
import { DemoRequestModal } from "@/components/landing/DemoRequestModal";

export function LandingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-white/80 backdrop-blur-md border-b border-slate-200 py-3"
                : "bg-transparent py-5"
                }`}
        >
            <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <img src="/Logo.svg" alt="Everleap" className="h-8 w-auto" />
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/#features" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Features
                    </Link>
                    <Link href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        How it works
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        About
                    </Link>
                    <Link href="/contact" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                        Contact
                    </Link>
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="text-slate-600 hover:text-slate-900">
                            Login
                        </Button>
                    </Link>
                    <DemoRequestModal>
                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-5">
                            Request a demo
                        </Button>
                    </DemoRequestModal>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-slate-600"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X weight="bold" /> : <List weight="bold" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 p-4 flex flex-col gap-4 shadow-lg">
                    <Link
                        href="/#features"
                        className="text-sm font-medium text-slate-600 py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Features
                    </Link>
                    <Link
                        href="/#how-it-works"
                        className="text-sm font-medium text-slate-600 py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        How it works
                    </Link>
                    <Link
                        href="/about"
                        className="text-sm font-medium text-slate-600 py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        About
                    </Link>
                    <Link
                        href="/contact"
                        className="text-sm font-medium text-slate-600 py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Contact
                    </Link>
                    <div className="flex flex-col gap-2 mt-2">
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="ghost" className="w-full justify-start">Login</Button>
                        </Link>
                        <DemoRequestModal>
                            <Button className="w-full bg-primary text-white rounded-xl">Request a demo</Button>
                        </DemoRequestModal>
                    </div>
                </div>
            )}
        </header>
    );
}

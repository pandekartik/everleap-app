"use client";

import Link from "next/link";
import { LinkedinLogo, XLogo } from "@phosphor-icons/react";

export function LandingFooter() {
    return (
        <footer className="bg-white border-t border-slate-100 pt-20 pb-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-6">
                            <img src="/Logo.svg" alt="Everleap" className="h-6 w-auto" />
                        </Link>
                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                            Building the autonomous workforce of the future. Everleap agents help you hire better, faster, and fairer.
                        </p>
                    </div>

                    <div className="md:col-span-2"></div>

                    <div>
                        <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
                        <ul className="space-y-3 text-sm text-slate-600">
                            <li><Link href="/about" className="hover:text-teal-600 transition-colors">About</Link></li>
                            <li><Link href="/contact" className="hover:text-teal-600 transition-colors">Contact</Link></li>
                            <li><Link href="/privacy" className="hover:text-teal-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-teal-600 transition-colors">Terms and Conditions</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-slate-400">
                        © 2026 Everleap Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                            <span className="sr-only">LinkedIn</span>
                            <LinkedinLogo weight="fill" className="h-5 w-5" />
                        </Link>
                        <Link href="#" className="text-slate-400 hover:text-slate-600 transition-colors">
                            <span className="sr-only">X</span>
                            <XLogo weight="fill" className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

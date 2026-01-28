import Link from "next/link";
import { Button } from "@everleap/design-system";

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-4 font-sans">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-12 text-center">
                <div className="flex justify-center mb-8">
                    <img src="/Logo.svg" alt="Everleap" className="h-8 w-auto" />
                </div>

                <h1 className="text-6xl font-bold text-slate-900 mb-4 tracking-tight">404</h1>
                <h2 className="text-2xl font-semibold text-slate-800 mb-4">Page Not Found</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                </p>

                <Button asChild className="w-full" size="lg">
                    <Link href="/login">
                        Back to Login
                    </Link>
                </Button>

                <div className="mt-8 pt-8 border-t border-slate-100">
                    <p className="text-xs text-slate-400">
                        © 2026 Everleap. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}

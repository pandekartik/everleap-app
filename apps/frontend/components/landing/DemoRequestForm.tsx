"use client";

import { useState } from "react";
import { CircleNotch, CaretDown, CheckCircle } from "@phosphor-icons/react";
import { Button } from "@everleap/design-system";

export function DemoRequestForm() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setLoading(false);
        setSuccess(true);
    };

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="h-16 w-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle weight="duotone" className="h-8 w-8 text-teal-600" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-2">Thanks for reaching out!</h3>
                <p className="text-slate-500 mb-6">We've received your request and will get back to you shortly.</p>
                <Button
                    onClick={() => setSuccess(false)}
                    variant="outline"
                    className="w-full"
                >
                    Send another response
                </Button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        id="name"
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                        placeholder="John Doe"
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Work Email</label>
                    <input
                        type="email"
                        id="email"
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                        placeholder="john@company.com"
                    />
                </div>
                <div>
                    <label htmlFor="company" className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                    <input
                        type="text"
                        id="company"
                        required
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all"
                        placeholder="Acme Inc."
                    />
                </div>
                <div>
                    <label htmlFor="company-size" className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
                    <div className="relative">
                        <select
                            id="company-size"
                            required
                            defaultValue=""
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all appearance-none bg-white text-slate-600 invalid:text-slate-400"
                        >
                            <option value="" disabled>Select employee count</option>
                            <option value="1-10">1-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-200">51-200 employees</option>
                            <option value="201-500">201-500 employees</option>
                            <option value="500+">500+ employees</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <CaretDown weight="bold" className="h-4 w-4" />
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Message (Optional)</label>
                    <textarea
                        id="message"
                        rows={3}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none transition-all resize-none"
                        placeholder="Tell us about your hiring needs..."
                    />
                </div>
            </div>

            <div className="pt-2">
                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg h-10"
                >
                    {loading ? <CircleNotch weight="bold" className="h-4 w-4 animate-spin" /> : "Submit Request"}
                </Button>
            </div>
        </form>
    );
}

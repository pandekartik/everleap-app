"use client";

import { Target, ShieldCheck, Users } from "@phosphor-icons/react";

export function AboutValues() {
    return (
        <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600">
                    <Target weight="duotone" className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Speed & Precision</h3>
                <p className="text-sm text-slate-500">Accelerating time-to-hire without compromising on candidate quality.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600">
                    <ShieldCheck weight="duotone" className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Fairness First</h3>
                <p className="text-sm text-slate-500">Reducing unconscious bias through objective, data-driven screening.</p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="h-12 w-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 text-teal-600">
                    <Users weight="duotone" className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Human Centric</h3>
                <p className="text-sm text-slate-500">Automation that puts the candidate experience and human decision-making at the center.</p>
            </div>
        </div>
    );
}

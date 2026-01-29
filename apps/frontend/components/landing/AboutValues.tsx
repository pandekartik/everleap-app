"use client";

import { Target, Users, Sparkle } from "@phosphor-icons/react";

export function AboutValues() {
    return (
        <div className="grid md:grid-cols-3 gap-8 mb-20">
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <Target weight="duotone" className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Simplicity</h3>
                <p className="text-slate-600">Complex AI, simple experience. We hide the gear-work.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <Users weight="duotone" className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Human-Centric</h3>
                <p className="text-slate-600">AI supports the human, it doesn't replace the judgment.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 text-center">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    <Sparkle weight="duotone" className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Human Centric</h3>
                <p className="text-sm text-slate-500">Automation that puts the candidate experience and human decision-making at the center.</p>
            </div>
        </div>
    );
}

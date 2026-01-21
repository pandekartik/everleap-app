"use client";

import { Users, FileText, Question } from "@phosphor-icons/react";

const ICON_MAP: Record<string, React.ElementType> = {
    Users,
    FileText
};

interface PlaceholderBoxProps {
    icon: string;
    label: string;
    sublabel?: string;
    className?: string;
}

export function PlaceholderBox({ icon, label, sublabel = "Screenshot placeholder", className = "" }: PlaceholderBoxProps) {
    const Icon = ICON_MAP[icon] || Question;

    return (
        <div className={`bg-white border border-slate-100 rounded-3xl p-8 flex items-center justify-center min-h-[400px] shadow-2xl shadow-slate-200/50 ${className}`}>
            <div className="text-center text-slate-400">
                <div className="h-10 w-10 bg-teal-500/10 rounded-lg flex items-center justify-center mb-3">
                    <Icon weight="duotone" className="h-5 w-5 text-teal-500" />
                </div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-xs mt-2 opacity-60 uppercase tracking-widest">{sublabel}</p>
            </div>
        </div>
    );
}

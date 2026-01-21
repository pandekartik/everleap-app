"use client";
import { Target, Robot, UserCheck, FileText, Question } from "@phosphor-icons/react";

const ICON_MAP: Record<string, React.ElementType> = {
    Target,
    Robot,
    UserCheck,
    FileText
};

interface FeatureItem {
    icon: string;
    title: string;
    description: string;
}

interface FeatureGridProps {
    features: FeatureItem[];
    className?: string;
}

export function FeatureGrid({ features, className = "" }: FeatureGridProps) {
    return (
        <div className={`grid md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
            {features.map((feature, i) => {
                const Icon = ICON_MAP[feature.icon] || Question;
                return (
                    <div key={i} className="group p-6 rounded-2xl border border-slate-200 bg-white hover:border-teal-100 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300">
                        <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300">
                            <Icon weight="duotone" className="h-6 w-6 text-teal-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
                    </div>
                );
            })}
        </div>
    );
}

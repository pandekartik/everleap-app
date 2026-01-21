"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@everleap/design-system";
import {
    FileText,
    Sparkle,
    Globe,
    Users,
    GitMerge,
    CalendarBlank,
    PenNib,
    ChatCircle,
    Robot,
    Target,
    UserCheck,
    Check
} from "@phosphor-icons/react";

// Map for serialization safety (Server -> Client)
const ICON_MAP: Record<string, React.ElementType> = {
    FileText,
    Sparkles: Sparkle,
    Globe,
    Users,
    Workflow: GitMerge,
    Calendar: CalendarBlank,
    FileSignature: PenNib,
    MessageSquare: ChatCircle,
    Bot: Robot,
    Target,
    UserCheck
};

interface Step {
    id: string;
    badge: string;
    title: string;
    description: string;
    checklist: string[];
    icon: string; // Changed from LucideIcon to string key
    placeholderLabel: string;
}

interface ScrollStepperProps {
    steps: Step[];
    id?: string;
}

export function ScrollStepper({ steps, id }: ScrollStepperProps) {
    const [activeStep, setActiveStep] = useState(0);
    const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const observers: IntersectionObserver[] = [];

        stepRefs.current.forEach((ref, index) => {
            if (ref) {
                const observer = new IntersectionObserver(
                    (entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                setActiveStep(index);
                            }
                        });
                    },
                    {
                        rootMargin: "-45% 0px -45% 0px", // Trigger when element is in the middle of viewport
                        threshold: 0,
                    }
                );
                observer.observe(ref);
                observers.push(observer);
            }
        });

        return () => {
            observers.forEach((obs) => obs.disconnect());
        };
    }, [steps]);

    return (
        <section id={id} className="py-24 bg-white scroll-mt-24">
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

                    {/* Left: Scrollable Text Steps */}
                    <div className="space-y-40 py-20">
                        {steps.map((step, index) => (
                            <div
                                key={step.id}
                                ref={(el) => { if (el) stepRefs.current[index] = el; }}
                                className={`transition-all duration-500 ${activeStep === index ? "opacity-100 scale-100" : "opacity-40 scale-95 blur-sm"
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-6">
                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === index ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-400"
                                        }`}>
                                        {index + 1}
                                    </div>
                                    <Badge variant="outline" className={`text-xs uppercase tracking-wider ${activeStep === index ? "text-teal-700 border-teal-200" : "text-slate-400 border-slate-200"
                                        }`}>
                                        {step.badge}
                                    </Badge>
                                </div>

                                <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                                    {step.title}
                                </h3>

                                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                    {step.description}
                                </p>

                                {/* Mobile Visual (Visible only on small screens) */}
                                <div className="lg:hidden mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-6 flex items-center justify-center">
                                    <div className="text-center text-slate-400">
                                        {(() => {
                                            const StepIcon = ICON_MAP[step.icon] || FileText;
                                            return <StepIcon weight="duotone" className="h-12 w-12 mx-auto mb-4 text-teal-500 opacity-80" />;
                                        })()}
                                        <p className="text-base font-semibold text-slate-600 mb-1">{step.placeholderLabel}</p>
                                        <p className="text-xs text-slate-400 uppercase tracking-widest">Live Preview</p>
                                    </div>
                                </div>

                                <ul className="space-y-4">
                                    {step.checklist.map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className={`mt-1 h-5 w-5 rounded-full flex items-center justify-center shrink-0 ${activeStep === index ? "bg-teal-100" : "bg-slate-100"
                                                }`}>
                                                <Check weight="bold" className={`h-3 w-3 ${activeStep === index ? "text-teal-600" : "text-slate-400"}`} />
                                            </div>
                                            <span className={`font-medium ${activeStep === index ? "text-slate-700" : "text-slate-500"}`}>
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Right: Sticky Visual */}
                    <div className="hidden lg:block sticky top-32 h-[calc(100vh-8rem)] min-h-[500px] rounded-3xl overflow-hidden bg-slate-50 border border-slate-200 shadow-2xl transition-all duration-700">
                        {steps.map((step, index) => {
                            const StepIcon = ICON_MAP[step.icon] || FileText;

                            return (
                                <div
                                    key={step.id}
                                    className={`absolute inset-0 p-8 flex items-center justify-center transition-all duration-700 transform ${activeStep === index
                                        ? "opacity-100 translate-y-0 scale-100"
                                        : index < activeStep
                                            ? "opacity-0 -translate-y-10 scale-95"
                                            : "opacity-0 translate-y-10 scale-95"
                                        }`}
                                >
                                    <div className="w-full h-full bg-white rounded-2xl border border-slate-100 shadow-lg flex items-center justify-center">
                                        <div className="text-center text-slate-400">
                                            <StepIcon weight="duotone" className="h-16 w-16 mx-auto mb-6 text-teal-500 opacity-80" />
                                            <p className="text-lg font-semibold text-slate-600 mb-2">{step.placeholderLabel}</p>
                                            <p className="text-sm text-slate-400 uppercase tracking-widest">Live Preview</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                </div>
            </div>
        </section>
    );
}

import { Check } from "lucide-react";
import { Badge } from "@everleap/design-system";
import { cn } from "@everleap/design-system/lib/utils"; // Assuming utils exists here, or I'll just use template literals if fails.

// Fallback cn if import fails in actual usage context, but typically design system has it.
// Actually, let's just use standard class template literals to be safe and dependency-free here for now 
// or assume standard clsx/tailwind-merge usage if widely used.
// Checking previous page.tsx, it didn't use cn. I'll stick to template literals.

interface ContentBlockProps {
    badge?: string;
    step?: string;
    title: string;
    description: string;
    checklist?: string[];
    children: React.ReactNode; // The visual/image part
    align?: "left" | "right";
    className?: string;
}

export function ContentBlock({
    badge,
    step,
    title,
    description,
    checklist,
    children,
    align = "left",
    className = ""
}: ContentBlockProps) {
    return (
        <div className={`py-16 md:py-24 ${className}`}>
            <div className="container mx-auto px-4 max-w-6xl">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Text Column */}
                    <div className={`${align === "right" ? "lg:order-2" : "lg:order-1"}`}>
                        {(badge || step) && (
                            <div className="flex items-center gap-2 mb-6">
                                {step && <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-1 rounded uppercase tracking-wider border border-teal-100">{step}</span>}
                                {badge && <Badge variant="outline" className="text-xs font-medium uppercase tracking-wider">{badge}</Badge>}
                            </div>
                        )}

                        <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
                            {title}
                        </h3>

                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            {description}
                        </p>

                        {checklist && (
                            <ul className="space-y-4">
                                {checklist.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-1 h-5 w-5 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                                            <Check className="h-3 w-3 text-teal-600" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Visual Column */}
                    <div className={`${align === "right" ? "lg:order-1" : "lg:order-2"}`}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

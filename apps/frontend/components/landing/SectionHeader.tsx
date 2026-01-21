import { Badge } from "@everleap/design-system";

interface SectionHeaderProps {
    badge?: string;
    title: string | React.ReactNode;
    description?: string;
    centered?: boolean;
    dark?: boolean;
}

export function SectionHeader({ badge, title, description, centered = false, dark = false }: SectionHeaderProps) {
    return (
        <div className={`mb-12 ${centered ? "text-center" : ""} ${dark ? "text-white" : ""}`}>
            {badge && (
                <Badge
                    variant="outline"
                    className={`mb-6 px-4 py-1.5 rounded-full text-sm font-medium bg-transparent uppercase tracking-wider ${dark
                            ? "border-white/20 text-white"
                            : "border-slate-200 text-slate-600"
                        }`}
                >
                    {badge}
                </Badge>
            )}
            <h2 className={`text-3xl md:text-4xl font-bold tracking-tight mb-4 ${dark ? "text-white" : "text-slate-900"}`}>
                {title}
            </h2>
            {description && (
                <p className={`text-lg leading-relaxed max-w-2xl ${centered ? "mx-auto" : ""} ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    {description}
                </p>
            )}
        </div>
    );
}

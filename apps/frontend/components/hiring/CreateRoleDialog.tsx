"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Button,
    Input,
    Textarea,
    Card,
    CardContent
} from "@everleap/design-system";
import { Sparkles, BrainCircuit, Check, ArrowRight } from "lucide-react";
import { cn } from "@everleap/design-system/lib/utils";

type AgentState = "IDLE" | "THINKING" | "DRAFTING" | "REVIEW";

export function CreateRoleDialog() {
    const [open, setOpen] = useState(false);
    const [state, setState] = useState<AgentState>("IDLE");
    const [intent, setIntent] = useState("");
    const [thinkingStep, setThinkingStep] = useState(0);

    const THINKING_STEPS = [
        "Analyzing hiring market for this role...",
        "Identifying key skills and competencies...",
        "Drafting comprehensive Job Description...",
        "Preparing initial screening questions..."
    ];

    const startAgent = () => {
        if (!intent) return;
        setState("THINKING");
        setThinkingStep(0);
    };

    useEffect(() => {
        if (state === "THINKING") {
            if (thinkingStep < THINKING_STEPS.length) {
                const timeout = setTimeout(() => {
                    setThinkingStep(prev => prev + 1);
                }, 1000); // 1.5s per step
                return () => clearTimeout(timeout);
            } else {
                const timeout = setTimeout(() => {
                    setState("REVIEW");
                }, 800);
                return () => clearTimeout(timeout);
            }
        }
    }, [state, thinkingStep]);

    const reset = () => {
        // cleanup
        setTimeout(() => {
            setState("IDLE");
            setIntent("");
            setThinkingStep(0);
        }, 500);
    };

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:bg-primary/90">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Create Role
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] transition-all duration-300">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {state === "IDLE" ? (
                            <>Create new role</>
                        ) : (
                            <>
                                <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
                                <span className="text-primary">Everleap Agent Working</span>
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {state === "IDLE" && (
                    <div className="space-y-4 py-4">
                        <p className="text-muted-foreground">
                            Describe the role you want to hire for. Just give me the basics, and I'll handle the rest.
                        </p>
                        <Textarea
                            placeholder="e.g. looking for a Senior Product Designer in Berlin, needs to be good with Figma and Design Systems. Budget is 80k."
                            className="min-h-[120px] text-base resize-none"
                            value={intent}
                            onChange={(e) => setIntent(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <Button onClick={startAgent} disabled={!intent} className="w-full sm:w-auto">
                                Start Agent <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}

                {state === "THINKING" && (
                    <div className="space-y-6 py-8">
                        {THINKING_STEPS.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-3 transition-opacity duration-300" style={{ opacity: idx <= thinkingStep ? 1 : 0.3 }}>
                                <div className={cn(
                                    "h-6 w-6 rounded-full flex items-center justify-center border transition-colors",
                                    idx < thinkingStep ? "bg-primary border-primary text-white" :
                                        (idx === thinkingStep ? "border-primary animate-pulse" : "border-muted")
                                )}>
                                    {idx < thinkingStep && <Check className="h-3.5 w-3.5" />}
                                    {idx === thinkingStep && <div className="h-2 w-2 bg-primary rounded-full animate-ping" />}
                                </div>
                                <span className={cn(
                                    "text-sm font-medium",
                                    idx === thinkingStep ? "text-foreground" : "text-muted-foreground"
                                )}>{step}</span>
                            </div>
                        ))}
                    </div>
                )}

                {state === "REVIEW" && (
                    <div className="space-y-4 py-2">
                        <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-lg">Senior Product Designer</h3>
                                    <p className="text-sm text-muted-foreground">Berlin • €75k - €85k • Design System Focus</p>
                                </div>
                                <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs font-bold border border-emerald-200">
                                    High Confidence
                                </div>
                            </div>
                            <div className="text-sm text-foreground/80 leading-relaxed">
                                We are seeking a layout-obsessed Senior Product Designer to own our design system. You will work directly with engineering...
                            </div>
                            <div className="flex gap-2 pt-2">
                                <div className="text-xs bg-white border px-2 py-1 rounded">Figma</div>
                                <div className="text-xs bg-white border px-2 py-1 rounded">React Knowledge</div>
                                <div className="text-xs bg-white border px-2 py-1 rounded">English (Fluent)</div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setState("IDLE")}>Refine</Button>
                            <Button onClick={() => setOpen(false)}>Approve & Publish</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

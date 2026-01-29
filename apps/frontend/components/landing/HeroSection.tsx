"use client";

import { Button } from "@everleap/design-system";
import { ArrowRight } from "@phosphor-icons/react";
import Link from "next/link";
import { DemoRequestModal } from "@/components/landing/DemoRequestModal";

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
            {/* Salix-style Background: Clean with subtle gradients if needed, mostly white */}

            <div className="container mx-auto px-4 text-center max-w-5xl">
                {/* Salix-style Badge: Clean, outline, pill */}
                <div className="mb-8 flex justify-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm transition-transform hover:scale-105 cursor-default">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-sm font-medium text-slate-600">Now available in public beta</span>
                    </div>
                </div>

                {/* Salix-style Typography: Heavy, tight */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 mb-8 leading-[1.05] animate-in fade-in slide-in-from-bottom-8 duration-700">
                    Meet your autonomous <br />
                    <span className="text-primary">HR team.</span>
                </h1>

                <p className="text-xl md:text-2xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 fill-mode-both">
                    Everleap is an agentic AI system designed to run hiring end-to-end,
                    from job creation to onboarding, while you stay in control.
                </p>

                {/* Salix-style CTA: Pill, Glow */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300 fill-mode-both">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-400 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                        <DemoRequestModal>
                            <Button size="lg" className="relative h-14 px-10 text-lg rounded-full bg-primary hover:bg-primary/90 text-white shadow-xl">
                                Request a demo
                            </Button>
                        </DemoRequestModal>
                    </div>

                    <Link href="#how-it-works">
                        <Button variant="ghost" size="lg" className="h-14 px-8 text-lg rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-50">
                            See how it works <ArrowRight weight="bold" className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

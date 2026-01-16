import { Button } from "@everleap/design-system";
import { EverleapLogo } from "@everleap/design-system";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Navigation */}
            <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <EverleapLogo className="h-8 w-8" />
                        <span className="font-bold text-xl">Everleap</span>
                    </div>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <a href="#" className="hover:text-primary transition-colors">Home</a>
                        <a href="#" className="hover:text-primary transition-colors">About</a>
                        <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
                    </nav>
                    <div className="flex items-center gap-4">
                        <a href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">Login</a>
                        <Button>Sign Up</Button>
                    </div>
                </div>
            </header>

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 md:py-32 px-4 text-center">
                    <div className="container mx-auto max-w-4xl space-y-6">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                            Autonomous HR That <span className="text-primary">Actually Works</span>
                        </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Privacy-first AI agents that automate your entire HR department—from hiring to offboarding—at a fraction of the cost.
                        </p>
                        <div className="flex items-center justify-center gap-4 pt-4">
                            <Button size="lg">Start Free Trial</Button>
                            <Button size="lg" variant="outline">See How It Works</Button>
                        </div>

                        <div className="pt-12 flex flex-wrap justify-center gap-4 text-sm font-medium text-muted-foreground">
                            <span className="flex items-center gap-2">✓ DPDP Compliant</span>
                            <span className="flex items-center gap-2">✓ On-Prem Ready</span>
                            <span className="flex items-center gap-2">✓ SMB Optimized</span>
                        </div>
                    </div>
                </section>

                {/* Features Content Placeholder */}
                <section className="py-20 bg-muted/30">
                    <div className="container mx-auto px-4">
                        <div className="text-center max-w-2xl mx-auto mb-16">
                            <h2 className="text-3xl font-bold mb-4">End-to-End HR Automation</h2>
                            <p className="text-muted-foreground">Specialized AI agents handle every aspect of your HR operations with minimal human intervention</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Feature Cards will go here */}
                            <div className="p-6 bg-card rounded-lg shadow-sm border">
                                <h3 className="font-semibold text-lg mb-2">Smart Hiring Pipeline</h3>
                                <p className="text-sm text-muted-foreground">Automate sourcing and screening. Agentic matching ensures you find the right talent.</p>
                            </div>
                            <div className="p-6 bg-card rounded-lg shadow-sm border">
                                <h3 className="font-semibold text-lg mb-2">Budget Intelligence</h3>
                                <p className="text-sm text-muted-foreground">Agents monitor payroll and operational costs in real-time.</p>
                            </div>
                            <div className="p-6 bg-card rounded-lg shadow-sm border">
                                <h3 className="font-semibold text-lg mb-2">Privacy-First Design</h3>
                                <p className="text-sm text-muted-foreground">Built with data sovereignty in mind. On-prem deployment supported.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="py-8 border-t">
                <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
                    <div className="flex justify-center gap-6 mb-4">
                        <EverleapLogo className="h-6 w-6 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
                    </div>
                    <p>© 2024 Everleap. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { AboutValues } from "@/components/landing/AboutValues";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-teal-100 selection:text-teal-900">
            <LandingNavbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <SectionHeader
                        badge="Our Mission"
                        title="Hiring shouldn't be a bottleneck."
                        description="At Everleap, we believe that great teams are built when human judgment is amplified by intelligent automation."
                        centered
                    />

                    <div className="prose prose-slate lg:prose-lg mx-auto mb-20 text-slate-600">
                        <p>
                            Traditional hiring is broken. It's slow, biased, and overwhelmingly manual. Recruiters spend hours scheduling interviews and screening resumes instead of connecting with people.
                        </p>
                        <p>
                            Everleap changes that. We are building the autonomous workforce for recruitment—a system of AI agents that handle the heavy lifting of sourcing, screening, and coordination, empowering human teams to make the decisions that matter.
                        </p>
                    </div>

                    <AboutValues />
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}


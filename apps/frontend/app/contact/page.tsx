import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { ContactInfo } from "@/components/landing/ContactInfo";
import { DemoRequestForm } from "@/components/landing/DemoRequestForm";

export default function ContactPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-teal-100 selection:text-teal-900">
            <LandingNavbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-6xl">
                    <SectionHeader
                        badge="Get in Touch"
                        title="We'd love to hear from you."
                        description="Have questions about our platform, pricing, or just want to say hello? Drop us a line."
                        centered
                    />

                    <div className="grid lg:grid-cols-2 gap-12 items-start mb-20">
                        {/* Left: Contact Info */}
                        <ContactInfo />

                        {/* Right: Form */}
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-2xl font-bold text-slate-900 mb-6">Request a Demo</h3>
                            <DemoRequestForm />
                        </div>
                    </div>

                </div>
            </main>

            <LandingFooter />
        </div>
    );
}

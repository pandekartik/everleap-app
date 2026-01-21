import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-teal-100 selection:text-teal-900">
            <LandingNavbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-4xl font-bold text-slate-900 mb-8">Terms and Conditions</h1>
                    <p className="text-slate-500 mb-12">Last updated: January 21, 2026</p>

                    <div className="prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 max-w-none">
                        <h2>1. Introduction</h2>
                        <p>
                            Welcome to Everleap! These terms and conditions outline the rules and regulations for the use of Everleap's Website, located at <strong>everleap.in</strong>.
                        </p>
                        <p>
                            By accessing this website we assume you accept these terms and conditions. Do not continue to use Everleap if you do not agree to take all of the terms and conditions stated on this page.
                        </p>

                        <h2>2. License</h2>
                        <p>
                            Unless otherwise stated, Everleap and/or its licensors own the intellectual property rights for all material on Everleap. All intellectual property rights are reserved. You may access this from Everleap for your own personal use subjected to restrictions set in these terms and conditions.
                        </p>
                        <p>You must not:</p>
                        <ul>
                            <li>Republish material from Everleap</li>
                            <li>Sell, rent or sub-license material from Everleap</li>
                            <li>Reproduce, duplicate or copy material from Everleap</li>
                            <li>Redistribute content from Everleap</li>
                        </ul>

                        <h2>3. User Accounts</h2>
                        <p>
                            If you create an account on our website, you are responsible for maintaining the security of your account and you are fully responsible for all activities that occur under the account. You must immediately notify us of any unauthorized uses of your account or any other breaches of security.
                        </p>

                        <h2>4. Limitations</h2>
                        <p>
                            In no event shall Everleap or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Everleap's website.
                        </p>

                        <h2>5. Governing Law</h2>
                        <p>
                            These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                        </p>

                        <h2>6. Contact Us</h2>
                        <p>
                            If you have any questions about these Terms, please contact us at <a href="mailto:contact@everleap.in" className="text-teal-600 hover:underline">contact@everleap.in</a>.
                        </p>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}

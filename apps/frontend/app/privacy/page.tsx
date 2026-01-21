import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-teal-100 selection:text-teal-900">
            <LandingNavbar />

            <main className="pt-32 pb-20">
                <div className="container mx-auto px-4 max-w-3xl">
                    <h1 className="text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>
                    <p className="text-slate-500 mb-12">Last updated: January 21, 2026</p>

                    <div className="prose prose-slate prose-headings:text-slate-900 prose-p:text-slate-600 max-w-none">
                        <p>
                            At Everleap ("we", "us", or "our"), accesible from <strong>everleap.in</strong>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Everleap and how we use it.
                        </p>

                        <h2>1. Information We Collect</h2>
                        <p>
                            We collect information to provide better services to all our users. The types of information we collect include:
                        </p>
                        <ul>
                            <li><strong>Personal Information:</strong> Name, email address, phone number, company name, and other contact details when you register for an account or request a demo.</li>
                            <li><strong>Usage Data:</strong> Information about how you use our website and services, including IP address, browser type, and operating system.</li>
                            <li><strong>Candidate Data:</strong> If you are using our recruitment services, we may process data related to job applicants on your behalf.</li>
                        </ul>

                        <h2>2. How We Use Your Information</h2>
                        <p>
                            We use the information we collect in various ways, including to:
                        </p>
                        <ul>
                            <li>Provide, operate, and maintain our website and services</li>
                            <li>Improve, personalize, and expand our website</li>
                            <li>Understand and analyze how you use our website</li>
                            <li>Develop new products, services, features, and functionality</li>
                            <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
                            <li>Send you emails</li>
                            <li>Find and prevent fraud</li>
                        </ul>

                        <h2>3. Data Protection</h2>
                        <p>
                            We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information. However, no method of transmission over the Internet or method of electronic storage is 100% secure.
                        </p>

                        <h2>4. Third-Party Privacy Policies</h2>
                        <p>
                            Everleap's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information.
                        </p>

                        <h2>5. Contact Us</h2>
                        <p>
                            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us through email at <a href="mailto:contact@everleap.in" className="text-teal-600 hover:underline">contact@everleap.in</a>.
                        </p>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    );
}

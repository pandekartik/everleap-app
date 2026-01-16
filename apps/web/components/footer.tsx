import { EverleapLogo } from "@everleap/design-system";

export function Footer() {
    return (
        <footer className="border-t/20 bg-card/30 mt-20">
            <div className="container mx-auto max-w-5xl py-12 px-4">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="space-y-4">
                        <EverleapLogo />
                        <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                            A comprehensive product design system for building modern, consistent web applications.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-10">
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold">Resources</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Components</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Templates</a></li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h4 className="text-sm font-semibold">Support</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><a href="#" className="hover:text-primary transition-colors">Github</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
                                <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="border-t/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} Everleap. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}

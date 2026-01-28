import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as requested
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // Using local component
import { AuthProvider } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Everleap - Autonomous HR That Actually Works",
  description: "Privacy-first AI agents that automate your entire HR department at a fraction of the cost",
  icons: {
    icon: "/favicon.ico", // Updated to use the moved favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="data-mode" // Keeping data-mode for shared CSS compatibility
            defaultTheme="light" // Default to light for landing page look? Landing was Light. Frontend was Dark.
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

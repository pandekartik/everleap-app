import type { Metadata } from "next";
import { Montserrat } from "next/font/google"; // Using Montserrat from Landing
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"; // Using local component

const montserrat = Montserrat({ subsets: ["latin"] });

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
        className={`${montserrat.className} antialiased`}
      >
        <ThemeProvider
          attribute="data-mode" // Keeping data-mode for shared CSS compatibility
          defaultTheme="light" // Default to light for landing page look? Landing was Light. Frontend was Dark.
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

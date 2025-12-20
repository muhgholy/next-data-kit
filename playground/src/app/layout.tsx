import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const geistSans = Geist({
     variable: "--font-geist-sans",
     subsets: ["latin"],
});

const geistMono = Geist_Mono({
     variable: "--font-geist-mono",
     subsets: ["latin"],
});

export const metadata: Metadata = {
     title: "Next Data Kit - Playground",
     description: "Interactive playground for Next Data Kit - A powerful data fetching and management library for Next.js",
};

export default function RootLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     return (
          <html lang="en" suppressHydrationWarning>
               <body
                    className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
               >
                    <ThemeProvider defaultTheme="system" storageKey="next-data-kit-theme">
                         <Header />
                         <main className="flex-1">{children}</main>
                         <Footer />
                    </ThemeProvider>
               </body>
          </html>
     );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { PipelineProvider } from "@/context/PipelineContext";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ResolveML — Business Entity Resolution ML Platform",
  description:
    "Enterprise-grade Business Entity Resolution platform with blocking analytics, pairwise neural matching, cluster exploration, and validation benchmarks.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased dark:bg-slate-950 dark:text-slate-100">
        <Providers>
          <AuthProvider>
            <PipelineProvider>{children}</PipelineProvider>
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}

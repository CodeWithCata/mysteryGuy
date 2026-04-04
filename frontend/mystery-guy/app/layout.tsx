import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

// Import your custom providers
import { QueryProvider } from "@/app/providers/QueryProvider";
import { SocketProvider } from "@/app/providers/SocketProvider";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Guess The Impostor",
  description: "A real-time deduction game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <body className="min-h-full flex flex-col font-sans">
        {/* Wrap the app in your providers */}
        <QueryProvider>
          <SocketProvider>
            {children}
            <Toaster position="top-center" richColors />
          </SocketProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
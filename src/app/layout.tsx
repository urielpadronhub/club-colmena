import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "El Club de La Colmena - Unidos por la Educación",
  description: "Sistema de gestión de donantes y becas educativas. Maracaibo, Zulia, Venezuela.",
  keywords: ["Club Colmena", "Educación", "Becas", "Donantes", "Venezuela", "Maracaibo"],
  authors: [{ name: "El Club de La Colmena" }],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "El Club de La Colmena",
    description: "Unidos por la educación de nuestros niños",
    url: "https://club-colmena.vercel.app",
    siteName: "Club de La Colmena",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "El Club de La Colmena",
    description: "Unidos por la educación de nuestros niños",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

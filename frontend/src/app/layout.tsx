import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "Calculadora Inmobiliaria | Alexandra Marín Bienes Raíces";
const siteDescription =
  "Herramienta profesional para analizar inversiones inmobiliarias: ROI, Cap Rate, escenarios de remodelación y evaluación de zona.";

function getMetadataBase(): URL {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return new URL(fromEnv.endsWith("/") ? fromEnv.slice(0, -1) : fromEnv);
  if (process.env.VERCEL_URL) return new URL(`https://${process.env.VERCEL_URL}`);
  if (process.env.NODE_ENV === "development") return new URL("http://localhost:3000");
  return new URL("https://alexandramarin.co");
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Alexandra Marín Bienes Raíces",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/logo.png",
        width: 892,
        height: 600,
        alt: "Alexandra Marín Bienes Raíces",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/logo.png"],
  },
};

export const viewport = {
  themeColor: "#6D28D9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

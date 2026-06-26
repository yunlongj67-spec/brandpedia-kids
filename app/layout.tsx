import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BrandPedia Kids · AI Business Encyclopedia for Kids",
  description:
    "BrandPedia Kids is an AI-powered children's business encyclopedia. It turns everyday brands into stories kids understand — through podcasts and illustrated cards. For ages 6–14.",
  keywords: [
    "kids encyclopedia",
    "business literacy",
    "AI education",
    "brand stories",
    "BrandPedia Kids",
  ],
  openGraph: {
    title: "BrandPedia Kids · AI Business Encyclopedia for Kids",
    description:
      "Helping kids understand how the business world works — through stories.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#ff7a59",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

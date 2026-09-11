import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const metadataBase = host ? new URL(`${protocol}://${host}`) : undefined;

  return {
    metadataBase,
    title: "BrandPedia Kids · Big Brand Stories for Curious Kids",
    description:
      "Explore how everyday brands work through kid-friendly stories, mini podcasts, visual cards and quizzes. Made for curious minds ages 6–14.",
    keywords: [
      "kids encyclopedia",
      "business literacy",
      "AI education",
      "brand stories",
      "BrandPedia Kids",
    ],
    openGraph: {
      title: "BrandPedia Kids · Every Brand Hides a Good Question",
      description:
        "Kid-friendly brand stories, mini podcasts and quizzes for curious minds ages 6–14.",
      type: "website",
      images: [{ url: "/og.png", width: 1536, height: 1024, alt: "BrandPedia Kids" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "BrandPedia Kids · Every Brand Hides a Good Question",
      description: "Explore the business world hiding in everyday life.",
      images: ["/og.png"],
    },
  };
}

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
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}

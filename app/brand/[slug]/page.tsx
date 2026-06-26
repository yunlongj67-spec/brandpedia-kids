import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStore } from "@/lib/storage";
import { Branddetail } from "@/component/Branddetail";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await getStore().getBrandContent(slug);
  if (!content) return { title: "Brand not found · BrandPedia Kids" };
  return {
    title: `${content.brand.nameEn || content.brand.name} · BrandPedia Kids`,
    description: content.brand.descriptionEn || content.brand.description,
  };
}

export default async function BrandPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await getStore().getBrandContent(slug);
  if (!content) notFound();
  return <Branddetail content={content} />;
}

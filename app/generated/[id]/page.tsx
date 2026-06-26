import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStore } from "@/lib/storage";
import { Branddetail } from "@/component/Branddetail";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const content = await getStore().getBrandContent(id);
  if (!content) return { title: "Content not found · BrandPedia Kids" };
  return {
    title: `${content.brand.nameEn || content.brand.name} (AI-made) · BrandPedia Kids`,
    description: content.brand.descriptionEn || content.brand.description,
  };
}

export default async function GeneratedPage({ params }: PageProps) {
  const { id } = await params;
  const content = await getStore().getBrandContent(id);
  if (!content || !content.brand.generated) {
    // not a generated brand → send to the (not found) handler
    notFound();
  }
  return <Branddetail content={content} />;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Shelf · BrandPedia",
  description:
    "A simple study-reference organizer for students. Save your notes and let AI recognize the subject and sort them into files.",
};

export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

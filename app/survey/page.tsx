import { SiteHeader } from "@/component/SiteHeader";
import { Survey } from "@/component/Survey";

export default function SurveyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-16 pt-2">
        <Survey />
      </main>
    </>
  );
}

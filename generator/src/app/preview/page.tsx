import { redirect } from "next/navigation";
import { getFullSite } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PreviewIndex() {
  const full = await getFullSite();
  const first = full.pages.find((p) => p.enabled) ?? full.pages[0];
  redirect(`/preview/${first.slug}`);
}

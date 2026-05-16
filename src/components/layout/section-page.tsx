import { PageHeader } from "@/components/layout/page-header";
import { SectionPlaceholder } from "@/components/layout/section-placeholder";

export function SectionPage({
  title,
  description,
  hint
}: {
  title: string;
  description: string;
  hint?: string;
}) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <SectionPlaceholder title={title} description={description} hint={hint} />
    </>
  );
}

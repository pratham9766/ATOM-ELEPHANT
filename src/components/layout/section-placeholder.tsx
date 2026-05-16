import { FadeIn } from "@/components/animations/fade-in";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SectionPlaceholder({
  title,
  description,
  hint
}: {
  title: string;
  description: string;
  hint?: string;
}) {
  return (
    <FadeIn>
      <Card className="min-h-[420px]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid h-[280px] place-items-center rounded-lg border border-dashed border-white/15 bg-white/[0.03] px-6 text-center">
            <p className="max-w-md text-sm text-slate-400">
              {hint ?? "This module is scaffolded and ready to connect to the ELEPHANT API."}
            </p>
          </div>
        </CardContent>
      </Card>
    </FadeIn>
  );
}

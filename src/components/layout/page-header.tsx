import { FadeIn } from "@/components/animations/fade-in";

export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <FadeIn className="mb-4">
      <h1 className="text-2xl font-semibold tracking-tight text-white">{title}</h1>
      {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
    </FadeIn>
  );
}

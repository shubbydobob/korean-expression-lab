type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="max-w-2xl space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sage">{eyebrow}</p>
      <h2 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl">{title}</h2>
      <p className="text-sm leading-7 text-slate-600 md:text-base">{description}</p>
    </div>
  );
}

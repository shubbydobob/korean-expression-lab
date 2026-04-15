type SectionTitleProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionTitle({ eyebrow, title, description }: SectionTitleProps) {
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-black/45">{eyebrow}</p>
      <h2 className="font-display text-4xl leading-tight text-black md:text-5xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-8 text-black/68 md:text-base">{description}</p>
    </div>
  );
}

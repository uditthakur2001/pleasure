import { ReactNode } from "react";

export const PageHeader = ({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) => {
  return (
    <section className="bg-gradient-warm border-b border-border/60">
      <div className="container-prose py-16 md:py-24">
        {eyebrow && <span className="eyebrow mb-4">{eyebrow}</span>}
        <h1 className="max-w-3xl text-balance text-4xl md:text-5xl lg:text-6xl">{title}</h1>
        {description && (
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
    </section>
  );
};

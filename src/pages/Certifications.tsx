import { Award, BadgeCheck, FlaskConical, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import manufacturingImg from "@/assets/manufacturing.jpg";

const certs = [
  { code: "GMP", title: "Good Manufacturing Practices", text: "All manufacturing follows WHO-GMP aligned standards for consistency and safety." },
  { code: "ISO 9001", title: "Quality Management", text: "Documented quality systems across formulation, packaging and dispatch." },
  { code: "FSSAI", title: "Feed-Grade Compliance", text: "Nutritional supplements compliant with applicable feed-grade regulations." },
  { code: "DCGI", title: "Drug Licensing", text: "Veterinary products manufactured under valid drug licenses." },
];

const Certifications = () => (
  <>
    <PageHeader
      eyebrow="Certifications & Quality"
      title="Quality is non-negotiable in animal health."
      description="Every product carrying the Pleasure Pharmaceuticals name passes through stringent quality checks — from raw material sourcing to final packaging."
    />

    <section className="container-prose grid gap-12 py-20 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl shadow-card">
        <img src={manufacturingImg} alt="Quality-controlled pharmaceutical manufacturing" loading="lazy" width={1600} height={1024} className="h-full w-full object-cover" />
      </div>
      <div>
        <span className="eyebrow mb-4">Our Approach</span>
        <h2 className="text-4xl md:text-5xl">Engineered for safety, batch after batch.</h2>
        <ul className="mt-6 space-y-4 text-sm">
          {[
            { icon: ShieldCheck, t: "Validated raw-material sourcing from approved vendors" },
            { icon: FlaskConical, t: "In-process quality checks at every formulation step" },
            { icon: BadgeCheck, t: "Final batch testing before market release" },
            { icon: Award, t: "Stability studies and ongoing pharmacovigilance" },
          ].map(({ icon: Icon, t }) => (
            <li key={t} className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
              <span className="pt-1.5 text-muted-foreground">{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>

    <section className="bg-secondary/40 py-20">
      <div className="container-prose">
        <h2 className="mb-10 font-display text-4xl">Our certifications</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {certs.map((c) => (
            <div key={c.code} className="group rounded-xl border border-border bg-card p-6 text-center shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elevated">
              <div className="mx-auto grid aspect-square w-28 place-items-center rounded-full border-4 border-primary/20 bg-tan font-display text-2xl text-primary">
                {c.code}
              </div>
              <h3 className="mt-5 font-display text-xl text-primary">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.text}</p>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-xs uppercase tracking-wider text-muted-foreground">
          Certificate images shown are representative · Available on request
        </p>
      </div>
    </section>
  </>
);

export default Certifications;

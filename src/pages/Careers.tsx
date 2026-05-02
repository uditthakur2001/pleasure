import { useState } from "react";
import { z } from "zod";
import { Briefcase, Heart, Sprout } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(7).max(20),
  role: z.string().trim().min(2).max(120),
  message: z.string().trim().max(800).optional().or(z.literal("")),
});

const Careers = () => {
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast({ title: "Please check the form", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast({ title: "Application received", description: "Thank you — our HR team will review and revert." });
    }, 600);
  };

  return (
    <>
      <PageHeader
        eyebrow="Careers"
        title="Build a career in animal health."
        description="Join a team that combines scientific rigor, manufacturing excellence and a genuine love for India’s farming community."
      />

      <section className="container-prose grid gap-12 py-20 lg:grid-cols-[1fr,1.2fr]">
        <div>
          <h2 className="font-display text-3xl text-primary">Why work with us</h2>
          <ul className="mt-8 space-y-6">
            {[
              { icon: Heart, title: "Purpose-driven", text: "Work that improves livelihoods of Indian farmers." },
              { icon: Sprout, title: "Room to grow", text: "A flat structure where contributions are visible." },
              { icon: Briefcase, title: "Sales · QC · R&D · Marketing", text: "Open roles across multiple functions." },
            ].map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="h-6 w-6" /></span>
                <div>
                  <h3 className="font-display text-xl text-primary">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <h2 className="font-display text-3xl text-primary">Apply now</h2>
          <p className="mt-2 text-sm text-muted-foreground">Tell us about yourself — we’ll get back to you with relevant openings.</p>
          <div className="mt-6 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required maxLength={80} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" required maxLength={20} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required maxLength={160} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="role">Role you’re applying for</Label>
              <Input id="role" name="role" required maxLength={120} placeholder="e.g. Sales Executive — Punjab region" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="message">Cover note (optional)</Label>
              <Textarea id="message" name="message" rows={4} maxLength={800} className="mt-1.5" />
            </div>
            <Button type="submit" variant="hero" size="lg" disabled={submitting}>
              {submitting ? "Submitting…" : "Submit Application"}
            </Button>
          </div>
        </form>
      </section>
    </>
  );
};

export default Careers;

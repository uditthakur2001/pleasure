import { useState } from "react";
import { z } from "zod";
import { Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  phone: z.string().trim().min(7, "Please enter a valid phone").max(20),
  email: z.string().trim().email("Invalid email").max(160).optional().or(z.literal("")),
  message: z.string().trim().min(5, "Tell us a bit more").max(800),
});

const Contact = () => {
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"), phone: fd.get("phone"), email: fd.get("email"), message: fd.get("message"),
    });
    if (!parsed.success) {
      toast({ title: "Please check the form", description: parsed.error.errors[0].message, variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast({ title: "Message received", description: "Thank you — our team will be in touch shortly." });
    }, 600);
  };

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="We’d love to hear from you."
        description="For product enquiries, distributor opportunities or technical questions, reach out to our team in Delhi."
      />

      <section className="container-prose grid gap-12 py-20 lg:grid-cols-[1fr,1.2fr]">
        <div>
          <h2 className="font-display text-3xl text-primary">Reach the team</h2>
          <p className="mt-3 text-muted-foreground">Our office is open Monday–Saturday, 10:00 AM – 6:30 PM.</p>
          <ul className="mt-8 space-y-5 text-sm">
            <li className="flex gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><MapPin className="h-5 w-5" /></span>
              <div>
                <p className="font-semibold">Registered Office</p>
                <p className="text-muted-foreground">1/50, 2nd Floor, Ganga Apartment,<br />Lalita Park, Laxmi Nagar, Delhi – 110092</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Mail className="h-5 w-5" /></span>
              <div>
                <p className="font-semibold">Email</p>
                <a href="mailto:pleasurepharmaceuticals@gmail.com" className="break-all text-muted-foreground hover:text-primary">pleasurepharmaceuticals@gmail.com</a>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary"><Phone className="h-5 w-5" /></span>
              <div>
                <p className="font-semibold">Phone</p>
                <a href="tel:+91 9149216396" className="text-muted-foreground hover:text-primary">+91 9149216396</a>
              </div>
            </li>
          </ul>

          <div className="mt-8 overflow-hidden rounded-xl border border-border shadow-card">
            <iframe
              title="Pleasure Pharmaceuticals — Lalita Park, Laxmi Nagar, Delhi"
              src="https://www.google.com/maps?q=Lalita+Park+Laxmi+Nagar+Delhi&output=embed"
              width="100%" height="280" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              className="block"
            />
          </div>
        </div>

        <form onSubmit={onSubmit} className="rounded-2xl border border-border bg-card p-8 shadow-card">
          <h2 className="font-display text-3xl text-primary">Send us a message</h2>
          <p className="mt-2 text-sm text-muted-foreground">We typically respond within one business day.</p>
          <div className="mt-6 grid gap-5">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required maxLength={80} className="mt-1.5" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" type="tel" required maxLength={20} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" name="email" type="email" maxLength={160} className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" required maxLength={800} rows={5} className="mt-1.5" />
            </div>
            <Button type="submit" variant="hero" size="lg" disabled={submitting}>
              {submitting ? "Sending…" : "Send Message"}
            </Button>
          </div>
        </form>
      </section>
    </>
  );
};

export default Contact;

import { Link } from "react-router-dom";
import { ArrowRight, Award, ShieldCheck, Sprout, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/site/ProductCard";
import { products } from "@/data/products";
import heroImg from "@/assets/hero-farmer-cattle.webp";
// import cattleImg from "@/assets/cattle-field.jpg";
import storeImg  from "@/assets/store.webp";

const Home = () => {
  const highlights = products.slice(0, 6);
  const stats = [
    { icon: Award, label: "18+ Years", sub: "of trusted heritage" },
    { icon: Sprout, label: "Vet Expertise", sub: "formulations only" },
    { icon: ShieldCheck, label: "GMP Quality", sub: "manufacturing standards" },
    { icon: Users, label: "Trusted by Farmers", sub: "across India" },
  ];

  return (
    <>
      {/* HERO — split screen */}
<section className="relative overflow-hidden border-b border-border/60">

  <div className="grid items-center lg:grid-cols-2">

    {/* LEFT CONTENT */}
    <div className="bg-gradient-warm">

      <div className="mx-auto flex max-w-2xl flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 lg:py-14">

        <span className="eyebrow mb-4">
          Veterinary Pharmaceuticals · Est. 2006
        </span>

        <h1 className="text-balance text-4xl leading-[1.05] text-primary sm:text-5xl lg:text-6xl">
          Committed to{" "}
          <em className="not-italic text-accent">
            Better
          </em>{" "}
          Animal Health.
        </h1>

        <p className="mt-4 max-w-xl text-base text-muted-foreground">
          Veterinary pharmaceutical solutions engineered for healthier
          livestock, stronger farms and higher productivity.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">

          <Button asChild variant="hero" size="lg">
            <Link to="/products">
              View Products
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="warm" size="lg">
            <Link to="/distributor">
              Become a Distributor
            </Link>
          </Button>

        </div>

        <dl className="mt-8 grid max-w-lg grid-cols-3 gap-4 border-t border-border/70 pt-6">

          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Founded
            </dt>

            <dd className="mt-1 font-display text-2xl text-primary">
              2006
            </dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Products
            </dt>

            <dd className="mt-1 font-display text-2xl text-primary">
              {products.length}+
            </dd>
          </div>

          <div>
            <dt className="text-xs uppercase tracking-wider text-muted-foreground">
              Based in
            </dt>

            <dd className="mt-1 font-display text-2xl text-primary">
              Delhi
            </dd>
          </div>

        </dl>

      </div>
    </div>

    {/* RIGHT IMAGE */}
    <div className="relative h-[320px] lg:h-[500px]">

      <img
        src={heroImg}
        alt="Farmer caring for healthy cattle in a green pasture"
        width={1080}
        height={1920}
        // fetchPriority="high"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-transparent" />

    </div>

  </div>
</section>

      {/* ABOUT PREVIEW */}
      <section className="container-prose grid gap-12 py-20 lg:grid-cols-2 lg:py-28">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-tan shadow-card">
          <img src={storeImg} alt="Healthy cow and buffalo in green field" loading="lazy" width={1600} height={1024} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col justify-center">
          <span className="eyebrow mb-4">Our Story</span>
          <h2 className="text-balance text-4xl md:text-5xl">
            Two decades of veterinary care, made in India.
          </h2>
          <p className="mt-5 text-lg text-muted-foreground">
            Founded in 2006 and headquartered in Delhi, Pleasure Pharmaceuticals Pvt. Ltd. has grown into a trusted name in animal health — focused exclusively on veterinary formulations that improve livestock productivity and farmer livelihoods.
          </p>
          <ul className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            {["Veterinary-only formulations", "GMP-grade manufacturing", "Pan-India distribution", "Backed by field veterinarians"].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-accent" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <Button asChild variant="outline">
              <Link to="/about">More about us <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* PRODUCT HIGHLIGHTS */}
      <section className="bg-secondary/40 py-20 lg:py-28">
        <div className="container-prose">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="eyebrow mb-3">Our Range</span>
              <h2 className="text-balance text-4xl md:text-5xl">Trusted veterinary formulations</h2>
            </div>
            <Button asChild variant="ghost">
              <Link to="/products">View all products <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="container-prose py-20 lg:py-28">
        <div className="mb-12 text-center">
          <span className="eyebrow mb-3 justify-center">Why Choose Us</span>
          <h2 className="mx-auto max-w-2xl text-balance text-4xl md:text-5xl">A pharma partner farmers can rely on.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elevated">
              <span className="grid h-12 w-12 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-2xl text-primary">{label}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-prose pb-20 lg:pb-28">
        <div className="overflow-hidden rounded-3xl bg-gradient-hero px-8 py-16 text-primary-foreground shadow-elevated md:px-16 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr] lg:items-center">
            <div>
              <h2 className="text-balance text-4xl text-primary-foreground md:text-5xl">
                Partner with Pleasure Pharmaceuticals.
              </h2>
              <p className="mt-4 max-w-xl text-primary-foreground/80">
                Distributor opportunities open across India. Join a network that puts animal health, quality and farmer trust first.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild variant="warm" size="lg">
                <Link to="/distributor">Become Distributor</Link>
              </Button>
              <Button asChild variant="outlineLight" size="lg">
                <Link to="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;

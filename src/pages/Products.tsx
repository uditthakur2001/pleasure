import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/site/PageHeader";
import { ProductCard } from "@/components/site/ProductCard";
import { Input } from "@/components/ui/input";
import { categories, products } from "@/data/products";
import { cn } from "@/lib/utils";

const Products = () => {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCat = active === "All" || p.category === active;
      const matchesQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.composition.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [query, active]);

  const filters = ["All", ...categories];

  return (
    <>
      <PageHeader
        eyebrow="Our Products"
        title="Veterinary medicines, made with care."
        description="A complete range of injections, boluses, powders and syrups for cattle, buffalo and other livestock — formulated by experts and trusted by farmers."
      />

      <section className="container-prose py-12 md:py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-smooth",
                  active === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground/80 hover:border-primary/40 hover:text-primary",
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="pl-9"
              aria-label="Search products"
              maxLength={80}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            No products match your search.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => <ProductCard key={p.slug} product={p} />)}
          </div>
        )}
      </section>
    </>
  );
};

export default Products;

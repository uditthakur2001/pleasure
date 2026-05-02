import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProductBySlug, products } from "@/data/products";

const ProductDetail = () => {
  const { slug } = useParams();
  const product = slug ? getProductBySlug(slug) : undefined;
  if (!product) return <Navigate to="/products" replace />;

  const related = products.filter((p) => p.slug !== product.slug && p.category === product.category).slice(0, 3);

  return (
    <article>
      <div className="container-prose pt-10">
        <Link to="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
      </div>

      <section className="container-prose grid gap-12 py-12 lg:grid-cols-2 lg:py-16">
        <div className="overflow-hidden rounded-2xl border border-border bg-tan shadow-card">
          <img src={product.image} alt={`${product.name} — ${product.tagline}`} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover" />
        </div>
        <div>
          <span className="eyebrow mb-3">{product.category}</span>
          <h1 className="text-balance text-5xl text-primary md:text-6xl">{product.name}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{product.tagline}</p>

          <div className="mt-8 space-y-6">
            <div>
              <h2 className="font-display text-xl text-primary">Composition</h2>
              <p className="mt-2 text-muted-foreground">{product.composition}</p>
            </div>
            <div>
              <h2 className="font-display text-xl text-primary">Indications</h2>
              <ul className="mt-3 space-y-2">
                {product.indications.map((i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-display text-xl text-primary">Dosage</h2>
              <p className="mt-2 text-muted-foreground">{product.dosage}</p>
            </div>
            <div>
              <h2 className="font-display text-xl text-primary">Benefits</h2>
              <ul className="mt-3 space-y-2">
                {product.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            {product.packSize && (
              <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm">
                <span className="font-semibold text-primary">Pack size: </span>
                <span className="text-muted-foreground">{product.packSize}</span>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to={`/contact?product=${encodeURIComponent(product.name)}`}>Enquire Now</Link>
            </Button>
            <Button asChild variant="warm" size="lg">
              <a
                href={`https://wa.me/919999999999?text=${encodeURIComponent(`Hi, I am interested in ${product.name}.`)}`}
                target="_blank" rel="noopener noreferrer"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Enquiry
              </a>
            </Button>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-secondary/40 py-20">
          <div className="container-prose">
            <h2 className="mb-8 font-display text-3xl">Related products</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  to={`/products/${p.slug}`}
                  className="group flex gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
                >
                  <img src={p.image} alt={p.name} loading="lazy" width={120} height={120} className="h-20 w-20 rounded-md object-cover" />
                  <div>
                    <h3 className="font-display text-xl text-primary">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">{p.tagline}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
};

export default ProductDetail;

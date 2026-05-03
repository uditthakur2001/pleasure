import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getProductBySlug, products } from "@/data/products";
import { useState } from "react";
const ProductDetail = () => {
  const { slug } = useParams();
  const product = slug ? getProductBySlug(slug) : undefined;
  if (!product) return <Navigate to="/products" replace />;

  const related = products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, 3);
  const [selected, setSelected] = useState(0);
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };
  return (
    <article>
      <div className="container-prose pt-10">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Back to products
        </Link>
      </div>

      <section className="container-prose grid gap-12 py-12 lg:grid-cols-2 lg:py-16">
        {/* <div className="overflow-hidden rounded-2xl border border-border bg-tan shadow-card">
          <img src={product.image} alt={`${product.name} — ${product.tagline}`} loading="lazy" width={1024} height={1024} className="h-full w-full object-cover" />
        </div> */}
        <div className="relative flex flex-col lg:flex-row gap-8 items-start ">
          {/* LEFT IMAGE */}
          <div className="space-y-4">
            <div
              className="relative w-[300px] h-[300px] sm:h-[400px] overflow-hidden rounded-2xl border border-border bg-tan shadow-card"
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={product.images[selected]}
                alt={product.name}
                className="w-full h-full object-contain p-4"
              />

              {/* LENS */}
              {showZoom && (
                <div
                  className="hidden lg:block absolute w-20 h-20 border border-gray-400 bg-white/20 rounded-full pointer-events-none"
                  style={{
                    left: `${zoomPos.x}%`,
                    top: `${zoomPos.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  onClick={() => setSelected(i)}
                  className={`h-16 w-16 cursor-pointer rounded-md border object-contain p-1 ${
                    selected === i ? "border-primary" : "border-border"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* FLOATING ZOOM PANEL */}
          {showZoom && (
            <div className="absolute left-[420px] top-0 w-[450px] h-[450px] z-50 pointer-events-none">
              <div className="w-full h-full rounded-2xl border bg-white shadow-xl overflow-hidden">
                <img
                  src={product.images[selected]}
                  className="w-full h-full object-contain scale-[2.5]"
                  style={{
                    transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <div>
          <span className="eyebrow mb-3">{product.category}</span>
          <h1 className="text-balance text-5xl text-primary md:text-6xl">
            {product.name}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {product.tagline}
          </p>

          <div className="mt-8 space-y-6">
            <div>
              <h2 className="font-display text-xl text-primary">Composition</h2>
              <p className="mt-2 text-muted-foreground">
                {product.composition}
              </p>
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
                <span className="text-muted-foreground">
                  {product.packSize}
                </span>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to={`/contact?product=${encodeURIComponent(product.name)}`}>
                Enquire Now
              </Link>
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
                  <img
                    src={p.images[0]}
                    alt={p.name}
                    className="h-20 w-20 rounded-md object-contain p-1"
                  />{" "}
                  <div>
                    <h3 className="font-display text-xl text-primary">
                      {p.name}
                    </h3>
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

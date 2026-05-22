import {
  Link,
  Navigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import {
  useEffect,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";

import {
  fetchProducts,
  getProductBySlug,
} from "@/lib/productApi";

import Zoom from "yet-another-react-lightbox/plugins/zoom";

import "yet-another-react-lightbox/styles.css";

import "./lightbox.css";

const Lightbox = lazy(
  () =>
    import(
      "yet-another-react-lightbox"
    ),
);

const ProductDetail = () => {
  const { slug } =
    useParams();

  const [product, setProduct] =
    useState<any>(null);

  const [related, setRelated] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [selected, setSelected] =
    useState(0);

  const [showZoom, setShowZoom] =
    useState(false);

  const [openLightbox, setOpenLightbox] =
    useState(false);

  const zoomRef =
    useRef<HTMLImageElement | null>(
      null,
    );

  const lensRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const rectRef =
    useRef<DOMRect | null>(
      null,
    );

  const frameRef =
    useRef<number | null>(
      null,
    );

  const [
    selectedVariant,
    setSelectedVariant,
  ] = useState<any>(null);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const loadProduct =
    async () => {
      setLoading(true);

      const data =
        await getProductBySlug(
          slug!,
        );

      if (!data) {
        setLoading(false);

        return;
      }

      setProduct(data);

      setSelectedVariant(
        data.variants?.[0] ||
          null,
      );

      const allProducts =
        await fetchProducts();

      const relatedProducts =
        allProducts
          .filter(
            (p: any) =>
              p.slug !==
                data.slug &&
              p.category ===
                data.category,
          )
          .slice(0, 3);

      setRelated(
        relatedProducts,
      );

      setLoading(false);
    };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    rectRef.current =
      e.currentTarget.getBoundingClientRect();
  };

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
  ) => {
    if (
      frameRef.current
    ) {
      cancelAnimationFrame(
        frameRef.current,
      );
    }

    frameRef.current =
      requestAnimationFrame(
        () => {
          const rect =
            rectRef.current;

          if (!rect)
            return;

          const x =
            ((e.clientX -
              rect.left) /
              rect.width) *
            100;

          const y =
            ((e.clientY -
              rect.top) /
              rect.height) *
            100;

          if (
            zoomRef.current
          ) {
            zoomRef.current.style.transformOrigin = `${x}% ${y}%`;
          }

          if (
            lensRef.current
          ) {
            lensRef.current.style.left = `${x}%`;

            lensRef.current.style.top = `${y}%`;
          }
        },
      );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading product...
      </div>
    );
  }

  if (!product) {
    return (
      <Navigate
        to="/products"
        replace
      />
    );
  }
const currentImages =
  selectedVariant?.images
    ?.length
    ? selectedVariant.images
    : product.images ||
      [];

  return (
    <article>
      <div className="container-prose pt-10">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to products
        </Link>
      </div>

      <section className="container-prose grid gap-12 py-12 lg:grid-cols-2 lg:py-16">
        <div className="relative flex flex-col items-start gap-8 lg:flex-row">
          <div className="space-y-4">
            <div
              className="relative flex h-[300px] w-[300px] items-center justify-center overflow-hidden rounded-2xl border border-border bg-tan shadow-card sm:h-[400px] lg:h-[500px] lg:w-[500px]"
              onMouseEnter={(
                e,
              ) => {
                setShowZoom(
                  true,
                );

                handleMouseEnter(
                  e,
                );
              }}
              onMouseLeave={() =>
                setShowZoom(
                  false,
                )
              }
              onMouseMove={
                handleMouseMove
              }
            >
              <img
                src={
                  currentImages?.[
                    selected
                  ] ||
                  "/placeholder.webp"
                }
                alt={
                  product.name
                }
                className="max-h-full max-w-full cursor-zoom-in object-contain p-6"
                onClick={() =>
                  setOpenLightbox(
                    true,
                  )
                }
              />

              {showZoom && (
                <div
                  ref={
                    lensRef
                  }
                  className="pointer-events-none absolute hidden h-20 w-20 rounded-full border border-gray-400 bg-white/20 lg:block"
                  style={{
                    transform:
                      "translate(-50%, -50%)",
                  }}
                />
              )}
            </div>

            {/* THUMBNAILS */}
            <div className="mt-4 flex flex-wrap gap-3">
  {currentImages?.map(
    (
      img: string,
      i: number,
    ) => (
      <button
        key={i}
        onClick={() =>
          setSelected(i)
        }
        className={`overflow-hidden rounded-xl border-2 transition ${
          selected === i
            ? "border-primary"
            : "border-border"
        }`}
      >
        <img
          src={img}
          alt=""
          className="h-20 w-20 object-cover"
        />
      </button>
    ),
  )}
</div>

            {/* VARIANTS */}
            {product.variants
              ?.length >
              0 && (
              <div className="flex flex-wrap gap-3 pt-4">
                {product.variants.map(
                  (
                    variant: any,
                  ) => (
                    <button
                      key={
                        variant.size
                      }
                      onClick={() => {
                        setSelectedVariant(
                          variant,
                        );

                        setSelected(
                          0,
                        );
                      }}
                      className={cn(
                        "rounded-full border px-4 py-2 text-sm font-medium transition-smooth",

                        selectedVariant?.size ===
                          variant.size
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-[#F5E6CC] text-primary",
                      )}
                    >
                      {
                        variant.size
                      }
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          {/* ZOOM PANEL */}
          {showZoom && (
            <div className="pointer-events-none absolute left-[420px] top-0 z-50 hidden h-[450px] w-[450px] lg:block">
              <div className="h-full w-full overflow-hidden rounded-2xl border bg-tan shadow-xl">
                <img
                  ref={
                    zoomRef
                  }
                  src={
                    currentImages?.[
                      selected
                    ]
                  }
                  className="h-full w-full scale-[2.5] object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div>
          <span className="eyebrow mb-3">
            {
              product.category
            }
          </span>

          <h1 className="text-balance text-5xl text-primary md:text-6xl">
            {product.name}
          </h1>

          <p className="mt-3 text-lg text-muted-foreground">
            {
              product.tagline
            }
          </p>

          {product.description && (
            <div className="mt-6">
              <h2 className="font-display text-xl text-primary">
                Description
              </h2>

              <p className="mt-2 leading-7 text-muted-foreground">
                {
                  product.description
                }
              </p>
            </div>
          )}

          <div className="mt-8 space-y-6">
            <div>
              <h2 className="font-display text-xl text-primary">
                Composition
              </h2>

              <p className="mt-2 text-muted-foreground">
                {
                  product.composition
                }
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-primary">
                Indications
              </h2>

              <ul className="mt-3 space-y-2">
                {product.indications?.map(
                  (
                    i: string,
                  ) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />

                      <span>
                        {i}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div>
              <h2 className="font-display text-xl text-primary">
                Dosage
              </h2>

              <p className="mt-2 text-muted-foreground">
                {
                  product.dosage
                }
              </p>
            </div>

            <div>
              <h2 className="font-display text-xl text-primary">
                Benefits
              </h2>

              <ul className="mt-3 space-y-2">
                {product.benefits?.map(
                  (
                    b: string,
                  ) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />

                      <span>
                        {b}
                      </span>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {product.packSize && (
              <div className="rounded-lg border border-border bg-secondary/50 p-4 text-sm">
                <span className="font-semibold text-primary">
                  Pack size:
                </span>

                <span className="text-muted-foreground">
                  {
                    product.packSize
                  }
                </span>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              variant="hero"
              size="lg"
            >
              <Link
                to={`/contact?product=${encodeURIComponent(
                  product.name,
                )}`}
              >
                Enquire Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* RELATED */}
      {related.length >
        0 && (
        <section className="bg-secondary/40 py-20">
          <div className="container-prose">
            <h2 className="mb-8 font-display text-3xl">
              Related products
            </h2>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map(
                (
                  p,
                ) => (
                  <Link
                    key={
                      p.slug
                    }
                    to={`/products/${p.slug}`}
                    className="group flex gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-smooth hover:-translate-y-0.5 hover:shadow-elevated"
                  >
                    <img
                      src={
                        p.images?.[0] ||
                        "/placeholder.webp"
                      }
                      alt={
                        p.name
                      }
                      className="h-20 w-20 rounded-md bg-tan object-contain p-1"
                    />

                    <div>
                      <h3 className="font-display text-xl text-primary">
                        {
                          p.name
                        }
                      </h3>

                      <p className="text-xs text-muted-foreground">
                        {
                          p.tagline
                        }
                      </p>
                    </div>
                  </Link>
                ),
              )}
            </div>
          </div>
        </section>
      )}

      {/* LIGHTBOX */}
      <Suspense fallback={null}>
        {openLightbox && (
          <Lightbox
            open={
              openLightbox
            }
            close={() =>
              setOpenLightbox(
                false,
              )
            }
            slides={currentImages?.map(
              (
                img: string,
              ) => ({
                src: img,
              }),
            )}
            index={selected}
            plugins={[Zoom]}
            styles={{
              container: {
                backgroundColor:
                  "#EDDCC0",
              },
            }}
          />
        )}
      </Suspense>
    </article>
  );
};

export default ProductDetail;
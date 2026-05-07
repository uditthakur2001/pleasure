import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Product } from "@/data/products";

type ProductCardProps = {
  product: Product;
};

export const ProductCard = memo(
  ({ product }: ProductCardProps) => (
    <Link
      to={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-smooth hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-tan">
        <img
          src={product.images[0]}
          alt={`${product.name} — ${product.tagline}`}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-smooth group-hover:scale-105"
        />

        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {product.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-display text-2xl text-primary">
          {product.name}
        </h3>

        <p className="text-sm text-muted-foreground">
          {product.tagline}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3 text-sm font-medium text-primary">
          <span>View details</span>

          <ArrowUpRight className="h-4 w-4 transition-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  )
);

ProductCard.displayName = "ProductCard";
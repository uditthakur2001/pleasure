import { useEffect } from "react";

import { products } from "@/data/products";

import { supabase } from "@/lib/supabase";

export default function SeedProducts() {
  useEffect(() => {
    seedProducts();
  }, []);

  const seedProducts =
    async () => {
      for (const product of products) {
        await supabase
          .from("products")
          .upsert({
            slug: product.slug,

            name: product.name,

            tagline:
              product.tagline,

            category:
              product.category,

            composition:
              product.composition,

            dosage:
              product.dosage,

            pack_size:
              product.packSize,

            indications:
              product.indications,

            benefits:
              product.benefits,

            image_urls: [
  ...(product.images || []),

  ...(product.variants?.flatMap(
    (variant) =>
      variant.images,
  ) || []),
],
          });
      }

      alert(
        "Products Imported Successfully",
      );
    };

  return (
    <div className="p-10">
      Importing Products...
    </div>
  );
}
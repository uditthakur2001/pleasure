// import { supabase } from "@/lib/supabase";
const { supabase } = await import("@/lib/supabase");

export const fetchProducts = async () => {
  const { data, error } = await supabase.from("products").select("*");

  if (error || !data) {
    console.log(error);

    return [];
  }

  return data.map((product) => ({
    slug: product.slug,

    name: product.name,

    tagline: product.tagline,

    category: product.category,

images:
  Array.isArray(
    product.image_urls,
  )
    ? product.image_urls
    : [],
    composition: product.composition,

    indications: product.indications || [],

    dosage: product.dosage,

    benefits: product.benefits || [],

    packSize: product.pack_size,

    description: product.description,

    variants: product.variants || [],
  }));
};

export const getProductBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.log(error);

    return null;
  }

  return {
    slug: data.slug,

    name: data.name,

    tagline: data.tagline,

    category: data.category,

images:
  Array.isArray(
    data.image_urls,
  )
    ? data.image_urls
    : [],
    composition: data.composition,

    indications: data.indications || [],

    dosage: data.dosage,

    benefits: data.benefits || [],

    packSize: data.pack_size,

    description: data.description,

    variants: data.variants || [],
  };
};

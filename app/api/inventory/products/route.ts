import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type RawProduct = {
  product_id: number;
  warehouse_id: number;
  name: string;
  description: string;
  sku: string;
  category_id: number;
  brand: string;
  measure_unit: string;
  cost_price: number;
  sale_price: number;
  active: boolean;
  stock: number;
  suppliers?: { name: string }[];           // <-- explícitamente un arreglo
  warehouses?: { name: string } | { name: string }[]; // puede ser objeto o arreglo
  categories?: { name: string } | { name: string }[];
};

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
  .from("products")
  .select(`
    product_id,
    warehouse_id,
    name,
    description,
    sku,
    category_id,
    brand,
    measure_unit,
    cost_price,
    sale_price,
    active,
    stock,
    suppliers(name),
    warehouses(name),
    categories(name)
  `);

const products = data as RawProduct[];

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aplana el resultado
  const flatProducts = products.map((product) => {
  const supplier_name = Array.isArray(product.suppliers)
    ? product.suppliers[0]?.name ?? null
    : null;

  const warehouse_name = Array.isArray(product.warehouses)
    ? product.warehouses[0]?.name ?? null
    : product.warehouses?.name ?? null;

  const category_name = Array.isArray(product.categories)
    ? product.categories[0]?.name ?? null
    : product.categories?.name ?? null;

  return {
    ...product,
    supplier_name,
    warehouse_name,
    category_name,
  };
});

  return NextResponse.json(flatProducts);
}
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
  suppliers?: { supplier_id: number, name: string }[] | { supplier_id: number, name: string }[];
  warehouses?: { warehouse_id: number, name: string } | { warehouse_id: number, name: string }[]; // puede ser objeto o arreglo
  categories?: { category_id: number, name: string } | {  category_id: number, name: string }[];
};

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
  .from("products")
  .select(`
    product_id,
    name,
    description,
    sku,
    brand,
    measure_unit,
    cost_price,
    sale_price,
    active,
    stock,
    suppliers(supplier_id, name),
    warehouses(warehouse_id, name),
    categories(category_id, name)
  `);

const products = data as RawProduct[];

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aplana el resultado
  const flatProducts = products.map((product) => {
  const supplier_id = Array.isArray(product.suppliers)
    ? product.suppliers[0]?.supplier_id ?? null
    : null;  

  const supplier_name = Array.isArray(product.suppliers)
    ? product.suppliers[0]?.name ?? null
    : null;

  const warehouse_id = Array.isArray(product.warehouses)
    ? product.warehouses[0]?.warehouse_id ?? null
    : product.warehouses?.warehouse_id ?? null;

  const warehouse_name = Array.isArray(product.warehouses)
    ? product.warehouses[0]?.name ?? null
    : product.warehouses?.name ?? null;

  const category_id = Array.isArray(product.categories)
    ? product.categories[0]?.category_id ?? null
    : product.categories?.category_id ?? null;

  const category_name = Array.isArray(product.categories)
    ? product.categories[0]?.name ?? null
    : product.categories?.name ?? null;

  return {
    ...product,
    supplier_id,
    supplier_name,
    warehouse_id,
    warehouse_name,
    category_id,
    category_name,
  };
});

  return NextResponse.json(flatProducts);
}
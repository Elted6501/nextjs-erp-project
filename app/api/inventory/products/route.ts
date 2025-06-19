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
  try {
    const supabase = await createClient();
    
    // Verificar si las variables de entorno están definidas
    console.log('SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: products, error } = await supabase.from("products").select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(products || []);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
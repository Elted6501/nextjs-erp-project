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
  warehouses?: { warehouse_id: number, name: string } | { warehouse_id: number, name: string }[];
  categories?: { category_id: number, name: string } | { category_id: number, name: string }[];
};

type EntryData = {
  id: number;
  quantity: number;
}[];

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

export async function POST(request: Request) {
  const requestData = await request.json();
  
  // Si el request es un array, asumimos que es para crear entradas
  if (Array.isArray(requestData)) {
    return handleEntryCreation(requestData);
  }

  // Si no, es para crear un producto
  return handleProductCreation(requestData);
}

// Función para manejar la creación de productos
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleProductCreation(productData: any) {
  const supabase = await createClient();

  try {
    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: productData.name,
        description: productData.description,
        category_id: parseInt(productData.category_id),
        brand: productData.brand,
        measure_unit: productData.measure_unit,
        cost_price: parseFloat(productData.cost_price) || 0,
        sale_price: parseFloat(productData.sale_price) || 0,
        active: productData.active !== undefined ? productData.active : true,
        stock: parseInt(productData.stock) || 0,
        warehouse_id: parseInt(productData.warehouse_id),
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting product:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      product_id: product.product_id,
      message: 'Producto creado exitosamente'
    });

  } catch (error) {
    console.error('Error inesperado:', error);
    return NextResponse.json(
      { error: 'Ocurrió un error inesperado' },
      { status: 500 }
    );
  }
}

// Función para manejar la creación de entradas
async function handleEntryCreation(products: EntryData) {
  const supabase = await createClient();
  
  try {
    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: "Debe incluir al menos un producto" },
        { status: 400 }
      );
    }

    // Generar un folio automático con fecha y timestamp
    const now = new Date();
    const entryNumber = `ENT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;

    // Insertar cada producto de la entrada
    const entries = [];
    for (const product of products) {
      // Verificar que el producto existe
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('product_id, stock')
        .eq('product_id', product.id)
        .single();

      if (productError || !productData) {
        console.error(`Producto no encontrado: ${product.id}`, productError);
        continue; // Saltar este producto
      }

      // Insertar en entries
      const { data: entry, error: entryError } = await supabase
        .from('entries')
        .insert({
          entry_number: entryNumber,
          product_id: product.id,
          quantity: product.quantity
        })
        .select()
        .single();

      if (entryError) throw entryError;
      entries.push(entry);

      // Actualizar el stock del producto
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: (productData.stock || 0) + product.quantity })
        .eq('product_id', product.id);

      if (updateError) throw updateError;
    }

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No se pudo registrar ningún producto" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      entryNumber,
      message: `Se registraron ${entries.length} productos en la entrada ${entryNumber}`
    });

  } catch (error) {
    console.error('Error al registrar entrada:', error);
    return NextResponse.json(
      { error: "Error al procesar la entrada" },
      { status: 500 }
    );
  }
}
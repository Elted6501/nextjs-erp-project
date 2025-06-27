import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface SaleItem {
  product_id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Intentar parsear el body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    const {
      client_id,
      employee_id,
      payment_method,
      vat,
      notes,
      items
    } = body;

    // Validar datos requeridos
    if (!payment_method || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      // 1. Verificar stock disponible directamente desde products
      const productIds = items.map((item: SaleItem) => item.product_id);
      
      const { data: productsWithStock, error: productsError } = await supabase
        .from("products")
        .select("product_id, name, stock")
        .in("product_id", productIds);

      if (productsError) {
        throw new Error(`Error fetching products: ${productsError.message}`);
      }

      // Verificar stock para cada producto
      for (const item of items) {
        const product = productsWithStock?.find(p => p.product_id === item.product_id);
        const availableStock = product?.stock || 0;
        
        console.log(`Product ${item.product_id}: Available stock = ${availableStock}, Requested = ${item.quantity}`);
        
        if (availableStock < item.quantity) {
          return NextResponse.json(
            { 
              error: `Insufficient stock for ${product?.name || `Product ${item.product_id}`}. Available: ${availableStock}, Requested: ${item.quantity}` 
            },
            { status: 400 }
          );
        }
      }

      // 2. Crear las ventas - UN REGISTRO POR CADA PRODUCTO
      const createdSales = [];
      const saleDate = new Date().toISOString();
      
      // Generar un identificador único para agrupar todos los productos de esta venta
      const saleReference = `SALE-${Date.now()}`;
      
      for (const item of items) {
        const saleData: any = {
          client_id: client_id || null,
          employee_id: employee_id || null,
          product_id: item.product_id, // Cada registro tiene su product_id
          payment_method,
          vat: (vat || 0) * (item.totalPrice / items.reduce((sum: number, i: SaleItem) => sum + i.totalPrice, 0)), // Prorratear el IVA
          notes: notes ? `${notes} | Ref: ${saleReference}` : `Ref: ${saleReference}`, // Agregar referencia para agrupar
          status: true,
          sale_date: saleDate,
        };

        const { data: sale, error: saleError } = await supabase
          .from("sales")
          .insert(saleData)
          .select()
          .single();

        if (saleError) {
          console.error("Error creating sale:", saleError);
          
          // Manejar errores de foreign key
          if (saleError.message.includes("foreign key constraint")) {
            if (saleError.message.includes("employee")) {
              return NextResponse.json(
                { 
                  error: "Invalid employee ID", 
                  details: "The specified employee does not exist."
                },
                { status: 400 }
              );
            }
            if (saleError.message.includes("client")) {
              return NextResponse.json(
                { 
                  error: "Invalid client ID", 
                  details: "The specified client does not exist."
                },
                { status: 400 }
              );
            }
            if (saleError.message.includes("product")) {
              return NextResponse.json(
                { 
                  error: "Invalid product ID", 
                  details: `Product ${item.product_id} does not exist.`
                },
                { status: 400 }
              );
            }
          }
          
          return NextResponse.json(
            { error: "Failed to create sale", details: saleError.message },
            { status: 500 }
          );
        }

        createdSales.push({
          sale_id: sale.sale_id,
          product_id: item.product_id,
          quantity: item.quantity,
          total: item.totalPrice
        });
      }

      // 3. Actualizar el stock en la tabla products
      for (const item of items) {
        const product = productsWithStock?.find(p => p.product_id === item.product_id);
        if (!product) continue;

        const newStock = (product.stock || 0) - item.quantity;
        
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("product_id", item.product_id);

        if (updateError) {
          throw new Error(`Error updating stock for product ${item.product_id}: ${updateError.message}`);
        }

        // 4. Crear registro de movimiento de inventario
        const movementData: any = {
          product_id: item.product_id,
          movement_type: 'exit',
          quantity: item.quantity,
          movement_date: saleDate,
          reference: saleReference,
          user_id: employee_id || 1,
        };

        const { error: movementError } = await supabase
          .from("inventory_movements")
          .insert(movementData);

        if (movementError) {
          console.error(`Error creating inventory movement: ${movementError.message}`);
          // No interrumpir la venta por este error
        }
      }

      // Calcular el total general
      const totalAmount = items.reduce((sum: number, item: SaleItem) => sum + item.totalPrice, 0);
      const totalWithVat = totalAmount + (vat || 0);

      return NextResponse.json({
        success: true,
        sale_reference: saleReference,
        sales_created: createdSales,
        total_items: items.length,
        total_amount: totalWithVat,
        message: `Sale created successfully with ${items.length} products. Reference: ${saleReference}`
      });

    } catch (transactionError) {
      console.error("Transaction error:", transactionError);
      return NextResponse.json(
        { 
          error: "Failed to complete sale transaction", 
          details: transactionError instanceof Error ? transactionError.message : "Unknown error"
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface SaleItem {
  product_id: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  name?: string;
  sku?: string;
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
        .select("product_id, name, sku, stock, sale_price")
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

      // 2. Preparar el JSON de productos con información completa
      const productsJson = items.map((item: SaleItem) => {
        const product = productsWithStock?.find(p => p.product_id === item.product_id);
        return {
          product_id: item.product_id,
          name: product?.name || item.name || '',
          sku: product?.sku || item.sku || '',
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice
        };
      });

      // 3. Crear UNA SOLA venta con todos los productos en JSON
      const saleDate = new Date().toISOString();
      const totalAmount = items.reduce((sum: number, item: SaleItem) => sum + item.totalPrice, 0);
      
      // Preparar datos para insertar - NO incluir sale_id para que se auto-genere
      const saleData = {
        ...(client_id && { client_id }), // Solo incluir si no es null
        ...(employee_id && { employee_id }), // Solo incluir si no es null
        products: productsJson, // Almacenar todos los productos como JSON
        payment_method,
        vat: vat || 0,
        ...(notes && { notes }), // Solo incluir si tiene valor
        status: true,
        sale_date: saleDate,
      };

      console.log('Sale data to insert:', saleData);

      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([saleData]) // Usar array para ser más explícito
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
        }
        
        return NextResponse.json(
          { error: "Failed to create sale", details: saleError.message },
          { status: 500 }
        );
      }

      // 4. Actualizar el stock en la tabla products
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

        // 5. Crear registro de movimiento de inventario
        const movementData: any = {
          product_id: item.product_id,
          movement_type: 'exit',
          quantity: item.quantity,
          movement_date: saleDate,
          reference: `SALE-${sale.sale_id}`,
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

      const totalWithVat = totalAmount + (vat || 0);

      return NextResponse.json({
        success: true,
        sale_id: sale.sale_id,
        products: productsJson,
        total_items: items.length,
        total_amount: totalWithVat,
        message: `Sale created successfully with ${items.length} products. Sale ID: ${sale.sale_id}`
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

// GET para obtener ventas
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Parámetros de paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Filtros opcionales
    const clientId = searchParams.get('client_id');
    const employeeId = searchParams.get('employee_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');
    
    // Construir query base
    let query = supabase
      .from('sales')
      .select(`
        *,
        clients:client_id(
          client_id,
          business_name,
          first_name,
          last_name,
          email
        ),
        employees:employee_id(
          employee_id,
          first_name,
          last_name
        )
      `, { count: 'exact' });
    
    // Aplicar filtros
    if (clientId) {
      query = query.eq('client_id', parseInt(clientId));
    }
    
    if (employeeId) {
      query = query.eq('employee_id', parseInt(employeeId));
    }
    
    if (dateFrom) {
      query = query.gte('sale_date', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('sale_date', dateTo);
    }
    
    // Aplicar paginación y ordenamiento
    query = query
      .order('sale_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching sales:', error);
      return NextResponse.json(
        { error: 'Error fetching sales', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
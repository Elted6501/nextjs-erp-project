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
      employee_id = 1, // Hardcodeado como solicitaste
      payment_method,
      vat,
      notes,
      items
    } = body;

    // Validaciones más estrictas
    if (!payment_method) {
      return NextResponse.json(
        { error: "Payment method is required" },
        { status: 400 }
      );
    }

    if (!['Cash', 'Credit', 'Debit'].includes(payment_method)) {
      return NextResponse.json(
        { error: "Invalid payment method. Must be Cash, Credit, or Debit" },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "At least one item is required" },
        { status: 400 }
      );
    }

    // Validar cada item del carrito
    for (const [index, item] of items.entries()) {
      if (!item.product_id || typeof item.product_id !== 'number') {
        return NextResponse.json(
          { error: `Invalid product_id for item ${index + 1}` },
          { status: 400 }
        );
      }
      if (!item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: `Invalid quantity for item ${index + 1}` },
          { status: 400 }
        );
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        return NextResponse.json(
          { error: `Invalid unit price for item ${index + 1}` },
          { status: 400 }
        );
      }
    }

    // Validar cliente si se proporciona
    if (client_id) {
      const { data: clientExists, error: clientError } = await supabase
        .from('clients')
        .select('client_id, status')
        .eq('client_id', client_id)
        .single();

      if (clientError || !clientExists) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 400 }
        );
      }

      if (clientExists.status !== 'Active') {
        return NextResponse.json(
          { error: "Client is not active" },
          { status: 400 }
        );
      }
    }

    try {
      // 1. Verificar stock disponible y obtener información de productos
      const productIds = items.map((item: SaleItem) => item.product_id);
      
      const { data: productsWithStock, error: productsError } = await supabase
        .from("products")
        .select("product_id, name, sku, stock, sale_price, active")
        .in("product_id", productIds);

      if (productsError) {
        throw new Error(`Error fetching products: ${productsError.message}`);
      }

      // Verificar que todos los productos existen y están activos
      for (const item of items) {
        const product = productsWithStock?.find(p => p.product_id === item.product_id);
        
        if (!product) {
          return NextResponse.json(
            { error: `Product with ID ${item.product_id} not found` },
            { status: 400 }
          );
        }

        if (!product.active) {
          return NextResponse.json(
            { error: `Product ${product.name} is not active` },
            { status: 400 }
          );
        }

        const availableStock = product.stock || 0;
        
        console.log(`Product ${item.product_id}: Available stock = ${availableStock}, Requested = ${item.quantity}`);
        
        if (availableStock < item.quantity) {
          return NextResponse.json(
            { 
              error: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}` 
            },
            { status: 400 }
          );
        }

        // Validar que el precio unitario coincida (con tolerancia del 1%)
        const expectedPrice = Number(product.sale_price);
        const providedPrice = Number(item.unitPrice);
        const tolerance = expectedPrice * 0.01;

        if (Math.abs(expectedPrice - providedPrice) > tolerance) {
          return NextResponse.json(
            { 
              error: `Price mismatch for ${product.name}. Expected: ${expectedPrice}, Provided: ${providedPrice}` 
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
          unit_price: Number(item.unitPrice),
          total_price: Number(item.totalPrice)
        };
      });

      // 3. Validar totales
      const calculatedSubtotal = productsJson.reduce((sum, product) => sum + product.total_price, 0);
      const providedVat = Number(vat) || 0;
      const expectedVat = calculatedSubtotal * 0.16;
      
      // Verificar que el VAT esté dentro de un rango razonable (15-17% del subtotal)
      if (providedVat < calculatedSubtotal * 0.15 || providedVat > calculatedSubtotal * 0.17) {
        return NextResponse.json(
          { error: `Invalid VAT amount. Expected around ${expectedVat.toFixed(2)}, got ${providedVat.toFixed(2)}` },
          { status: 400 }
        );
      }

      // 4. Crear la venta
      const saleDate = new Date().toISOString();
      
      const saleData = {
        ...(client_id && { client_id }),
        employee_id,
        products: productsJson,
        payment_method,
        vat: providedVat,
        ...(notes && notes.trim() && { notes: notes.trim() }),
        status: true,
        sale_date: saleDate,
      };

      console.log('Sale data to insert:', saleData);

      const { data: sale, error: saleError } = await supabase
        .from("sales")
        .insert([saleData])
        .select()
        .single();

      if (saleError) {
        console.error("Error creating sale:", saleError);
        
        // Manejar errores específicos
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

      // 5. Actualizar stock de productos en lote
      const stockUpdatePromises = items.map(async (item: SaleItem) => {
        const product = productsWithStock?.find(p => p.product_id === item.product_id);
        if (!product) return;

        const newStock = (product.stock || 0) - item.quantity;
        
        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("product_id", item.product_id);

        if (updateError) {
          throw new Error(`Error updating stock for product ${item.product_id}: ${updateError.message}`);
        }

        // Crear movimiento de inventario
        const movementData = {
          product_id: item.product_id,
          movement_type: 'exit',
          quantity: item.quantity,
          movement_date: saleDate,
          reference: `SALE-${sale.sale_id}`,
          user_id: employee_id,
        };

        const { error: movementError } = await supabase
          .from("inventory_movements")
          .insert(movementData);

        if (movementError) {
          console.error(`Warning: Error creating inventory movement for product ${item.product_id}:`, movementError.message);
          // No interrumpir por este error, es informativo
        }
      });

      // Ejecutar todas las actualizaciones de stock
      await Promise.all(stockUpdatePromises);

      const totalWithVat = calculatedSubtotal + providedVat;

      return NextResponse.json({
        success: true,
        sale_id: sale.sale_id,
        products: productsJson,
        total_items: items.length,
        subtotal: calculatedSubtotal,
        vat: providedVat,
        total_amount: totalWithVat,
        payment_method,
        sale_date: saleDate,
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
    const status = searchParams.get('status');
    
    // Construir query base
    let query = supabase
      .from('sales')
      .select(`
        *,
        clients:client_id(
          client_id,
          client_type,
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
    if (clientId && !isNaN(parseInt(clientId))) {
      query = query.eq('client_id', parseInt(clientId));
    }
    
    if (employeeId && !isNaN(parseInt(employeeId))) {
      query = query.eq('employee_id', parseInt(employeeId));
    }
    
    if (dateFrom) {
      query = query.gte('sale_date', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('sale_date', dateTo);
    }

    if (status === 'active') {
      query = query.eq('status', true);
    } else if (status === 'returned') {
      query = query.eq('status', false);
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

    // Procesar datos para agregar totales calculados
    const processedData = data?.map(sale => {
      const products = sale.products || [];
      const subtotal = products.reduce((sum: number, product: any) => sum + (product.total_price || 0), 0);
      const total = subtotal + (sale.vat || 0);
      const totalItems = products.reduce((sum: number, product: any) => sum + (product.quantity || 0), 0);
      
      return {
        ...sale,
        subtotal,
        total,
        total_items: totalItems
      };
    }) || [];
    
    return NextResponse.json({
      data: processedData,
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
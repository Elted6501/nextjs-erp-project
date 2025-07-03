import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/sales/sales_returns - Obtener todas las ventas con paginación y filtros
export async function GET(request: NextRequest) {
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
    const status = searchParams.get('status'); // 'active', 'returned', 'all'
    const search = searchParams.get('search'); // Buscar por ID de venta
    
    // PASO 1: Obtener ventas básicas SIN joins problemáticos
    let query = supabase
      .from('sales')
      .select('*', { count: 'exact' });
    
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
    
    // Filtrar por estado
    if (status === 'active') {
      query = query.eq('status', true);
    } else if (status === 'returned') {
      query = query.eq('status', false);
    }
    // Si status es 'all' o no se especifica, mostrar todas
    
    // Buscar por ID de venta
    if (search && !isNaN(parseInt(search))) {
      query = query.eq('sale_id', parseInt(search));
    }
    
    // Aplicar paginación y ordenamiento
    query = query
      .order('sale_date', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data: salesData, error: salesError, count } = await query;
    
    if (salesError) {
      console.error('Error fetching sales:', salesError);
      return NextResponse.json(
        { error: 'Error fetching sales', details: salesError.message },
        { status: 500 }
      );
    }

    if (!salesData) {
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        }
      });
    }

    // PASO 2: Obtener información de clientes para las ventas que tienen client_id
    const clientIds = salesData
      .filter(sale => sale.client_id)
      .map(sale => sale.client_id);
    
    let clientsData: any[] = [];
    if (clientIds.length > 0) {
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('client_id, client_type, business_name, first_name, last_name, email, tax_id')
        .in('client_id', clientIds);
      
      if (!clientsError && clients) {
        clientsData = clients;
      }
    }

    // PASO 3: Obtener información de empleados
    const employeeIds = salesData
      .filter(sale => sale.employee_id)
      .map(sale => sale.employee_id);
    
    let employeesData: any[] = [];
    if (employeeIds.length > 0) {
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('employee_id, first_name, last_name')
        .in('employee_id', employeeIds);
      
      if (!employeesError && employees) {
        employeesData = employees;
      }
    }

    // PASO 4: Procesar datos para mostrar información calculada
    const processedData = salesData.map(sale => {
      // Buscar cliente asociado
      const client = clientsData.find(c => c.client_id === sale.client_id);
      
      // Buscar empleado asociado
      const employee = employeesData.find(e => e.employee_id === sale.employee_id);
      
      // Calcular totales desde los productos
      const products = sale.products || [];
      const totalItems = products.reduce((sum: number, product: any) => sum + (product.quantity || 0), 0);
      const subtotal = products.reduce((sum: number, product: any) => sum + (product.total_price || 0), 0);
      const total = subtotal + (sale.vat || 0);
      
      // Determinar nombre del cliente
      let client_name = 'Anonymous';
      if (client) {
        if (client.client_type === 'Business') {
          client_name = client.business_name || 'Unknown Business';
        } else {
          client_name = `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unknown Individual';
        }
      }
      
      // Determinar nombre del empleado
      const employee_name = employee ? 
        `${employee.first_name || ''} ${employee.last_name || ''}`.trim() : 
        'N/A';

      return {
        ...sale,
        total_items: totalItems,
        subtotal,
        total,
        client_name,
        employee_name,
        // Incluir objetos completos para compatibilidad con el frontend
        clients: client || null,
        employees: employee || null
      };
    });
    
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

// POST /api/sales/sales_returns - Procesar devolución de una venta completa
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { sale_id, reason, refound_method = 'Store Credit' } = body;
    
    // Validar datos requeridos
    if (!sale_id || !reason) {
      return NextResponse.json(
        { error: 'Sale ID and reason are required' },
        { status: 400 }
      );
    }
    
    // Validar método de reembolso
    const validRefoundMethods = ['Cash', 'Credit', 'Store Credit'];
    if (!validRefoundMethods.includes(refound_method)) {
      return NextResponse.json(
        { error: 'Invalid refound method. Must be Cash, Credit, or Store Credit' },
        { status: 400 }
      );
    }
    
    // Verificar que la venta existe y está activa
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('*')
      .eq('sale_id', sale_id)
      .single();
    
    if (saleError || !sale) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }
    
    if (!sale.status) {
      return NextResponse.json(
        { error: 'Sale has already been returned' },
        { status: 400 }
      );
    }
    
    if (!sale.products || !Array.isArray(sale.products)) {
      return NextResponse.json(
        { error: 'Invalid sale data: products not found' },
        { status: 400 }
      );
    }
    
    try {
      // Iniciar proceso de devolución
      const stockUpdates = [];
      const inventoryMovements = [];
      const returnDate = new Date().toISOString();
      const employee_id = 1; // Hardcodeado como solicitaste
      
      // PASO 1: Procesar cada producto de la venta para devolver stock
      for (const product of sale.products) {
        const { product_id, quantity } = product;
        
        if (!product_id || !quantity) {
          console.warn(`Skipping product with invalid data: ${JSON.stringify(product)}`);
          continue;
        }
        
        // Obtener información actual del producto
        const { data: currentProduct, error: productError } = await supabase
          .from('products')
          .select('product_id, name, stock')
          .eq('product_id', product_id)
          .single();
        
        if (productError) {
          console.error(`Error fetching product ${product_id}:`, productError);
          // Continuar con otros productos en lugar de fallar completamente
          continue;
        }
        
        // Calcular nuevo stock (devolver la cantidad vendida)
        const currentStock = currentProduct?.stock || 0;
        const newStock = currentStock + quantity;
        
        // Actualizar stock del producto
        const { error: updateError } = await supabase
          .from('products')
          .update({ stock: newStock })
          .eq('product_id', product_id);
        
        if (updateError) {
          throw new Error(`Error updating stock for product ${product_id}: ${updateError.message}`);
        }
        
        stockUpdates.push({
          product_id,
          name: currentProduct?.name || 'Unknown',
          quantity_returned: quantity,
          previous_stock: currentStock,
          new_stock: newStock
        });
        
        // Crear movimiento de inventario para la devolución
        const movementData = {
          product_id,
          movement_type: 'entry' as const,
          quantity: quantity,
          movement_date: returnDate,
          reference: `RETURN-${sale_id}`,
          user_id: employee_id,
        };
        
        const { error: movementError } = await supabase
          .from('inventory_movements')
          .insert(movementData);
        
        if (movementError) {
          console.error(`Error creating inventory movement for product ${product_id}:`, movementError.message);
          // No interrumpir el proceso por este error, es informativo
        } else {
          inventoryMovements.push(movementData);
        }
      }
      
      // PASO 2: Marcar la venta como devuelta (status = false)
      const updateNotes = sale.notes ? 
        `${sale.notes} | RETURNED: ${reason} (${new Date().toLocaleDateString()})` : 
        `RETURNED: ${reason} (${new Date().toLocaleDateString()})`;
      
      const { error: returnError } = await supabase
        .from('sales')
        .update({ 
          status: false,
          notes: updateNotes
        })
        .eq('sale_id', sale_id);
      
      if (returnError) {
        throw new Error(`Error marking sale as returned: ${returnError.message}`);
      }
      
      // PASO 3: Intentar crear registro en sales_returns (opcional)
      const returnData = {
        sale_id,
        employee_id,
        refound_method,
        status: 'Processed' as const,
        reason,
        return_date: returnDate
      };
      
      const { error: salesReturnError } = await supabase
        .from('sales_returns')
        .insert(returnData);
      
      if (salesReturnError) {
        console.error('Warning: Could not create sales_returns record:', salesReturnError.message);
        // No interrumpir el proceso - el registro principal ya se actualizó
      }
      
      // Calcular totales para la respuesta
      const totalItemsReturned = sale.products.reduce((sum: number, p: any) => sum + (p.quantity || 0), 0);
      const totalAmountReturned = sale.products.reduce((sum: number, p: any) => sum + (p.total_price || 0), 0) + (sale.vat || 0);
      
      return NextResponse.json({
        success: true,
        message: 'Sale returned successfully',
        data: {
          sale_id,
          return_date: returnDate,
          refound_method,
          stock_updates: stockUpdates,
          inventory_movements: inventoryMovements.length,
          total_items_returned: totalItemsReturned,
          total_amount_returned: totalAmountReturned,
          reason,
          products_processed: stockUpdates.length
        }
      });
      
    } catch (transactionError) {
      console.error('Transaction error:', transactionError);
      return NextResponse.json(
        { 
          error: 'Failed to process sale return', 
          details: transactionError instanceof Error ? transactionError.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
import { createClient } from "@/lib/supabase/server";
import { 
  Sale, 
  Client, 
  SaleReturn, 
  SalesQueryParams, 
  ClientsQueryParams,
  SaleCreateInput,
  SaleUpdateInput,
  ClientCreateInput,
  ClientUpdateInput,
  SaleReturnCreateInput,
  SaleReturnUpdateInput,
  PaginatedResponse 
} from "@/lib/types/sales";

export class SalesService {
  private static async getSupabaseClient() {
    return await createClient();
  }

  // SALES METHODS
  static async getAllSales(params: SalesQueryParams = {}) {
    const supabase = await this.getSupabaseClient();
    const { 
      page = 1, 
      limit = 10, 
      client_id, 
      employee_id, 
      status, 
      date_from, 
      date_to, 
      payment_method 
    } = params;

    let query = supabase
      .from("sales")
      .select(`
        *,
        clients:client_id(client_id, first_name, last_name, business_name),
        employees:employee_id(employee_id, first_name, last_name)
      `, { count: 'exact' });

    // Apply filters
    if (client_id) query = query.eq('client_id', client_id);
    if (employee_id) query = query.eq('employee_id', employee_id);
    if (typeof status === 'boolean') query = query.eq('status', status);
    if (payment_method) query = query.eq('payment_method', payment_method);
    if (date_from) query = query.gte('sale_date', date_from);
    if (date_to) query = query.lte('sale_date', date_to);

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: sales, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch sales: ${error.message}`);
    }

    return {
      data: sales || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } as PaginatedResponse<Sale>;
  }

  static async getSaleById(id: number) {
    const supabase = await this.getSupabaseClient();
    
    const { data: sale, error } = await supabase
      .from("sales")
      .select(`
        *,
        clients:client_id(*),
        employees:employee_id(employee_id, first_name, last_name),
        sales_returns(*)
      `)
      .eq('sale_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Sale not found');
      }
      throw new Error(`Failed to fetch sale: ${error.message}`);
    }

    return sale;
  }

  static async createSale(saleData: SaleCreateInput) {
    const supabase = await this.getSupabaseClient();
    
    const { data: sale, error } = await supabase
      .from("sales")
      .insert(saleData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create sale: ${error.message}`);
    }

    return sale;
  }

  static async updateSale(id: number, saleData: SaleUpdateInput) {
    const supabase = await this.getSupabaseClient();
    
    const { data: sale, error } = await supabase
      .from("sales")
      .update(saleData)
      .eq('sale_id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Sale not found');
      }
      throw new Error(`Failed to update sale: ${error.message}`);
    }

    return sale;
  }

  static async deleteSale(id: number) {
    const supabase = await this.getSupabaseClient();
    
    const { error } = await supabase
      .from("sales")
      .delete()
      .eq('sale_id', id);

    if (error) {
      throw new Error(`Failed to delete sale: ${error.message}`);
    }

    return { message: 'Sale deleted successfully' };
  }

  // CLIENTS METHODS
  static async getAllClients(params: ClientsQueryParams = {}) {
    const supabase = await this.getSupabaseClient();
    const { page = 1, limit = 10, client_type, status, search } = params;

    let query = supabase
      .from("clients")
      .select("*", { count: 'exact' });

    // Apply filters
    if (client_type) query = query.eq('client_type', client_type);
    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,business_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: clients, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    return {
      data: clients || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    } as PaginatedResponse<Client>;
  }

  static async getClientById(id: number) {
    const supabase = await this.getSupabaseClient();
    
    const { data: client, error } = await supabase
      .from("clients")
      .select(`
        *,
        sales(sale_id, sale_date, vat, status)
      `)
      .eq('client_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Client not found');
      }
      throw new Error(`Failed to fetch client: ${error.message}`);
    }

    return client;
  }

  static async createClient(clientData: ClientCreateInput) {
    const supabase = await this.getSupabaseClient();
    
    // Asegurarse de NO incluir client_id en los datos
    const { client_id, ...dataWithoutId } = clientData as any;
    
    // Limpiar datos - remover campos undefined, null o strings vacíos
    const cleanedData = Object.entries(dataWithoutId).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    // Asegurar que status tenga un valor por defecto si no se proporciona
    if (!cleanedData.status) {
      cleanedData.status = 'Active';
    }
    
    const { data: client, error } = await supabase
      .from("clients")
      .insert(cleanedData)
      .select()
      .single();

    if (error) {
      console.error('Create client error:', error);
      
      // Manejo específico de errores
      if (error.code === '23505') { // PostgreSQL unique violation
        if (error.message.includes('email')) {
          throw new Error('A client with this email already exists');
        }
        if (error.message.includes('tax_id')) {
          throw new Error('A client with this tax ID already exists');
        }
        if (error.message.includes('clients_pkey')) {
          throw new Error('Client ID conflict - please try again');
        }
        throw new Error('A client with these details already exists');
      }
      
      if (error.code === '23514') { // Check constraint violation
        throw new Error('Invalid data: please check all required fields');
      }
      
      throw new Error(`Failed to create client: ${error.message}`);
    }

    return client;
  }

  static async updateClient(id: number, clientData: ClientUpdateInput) {
    const supabase = await this.getSupabaseClient();
    
    // Asegurarse de NO incluir client_id en los datos de actualización
    const { client_id, ...dataWithoutId } = clientData as any;
    
    // Limpiar datos - remover campos undefined, null o strings vacíos
    const cleanedData = Object.entries(dataWithoutId).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {} as any);
    
    const { data: client, error } = await supabase
      .from("clients")
      .update(cleanedData)
      .eq('client_id', id)
      .select()
      .single();

    if (error) {
      console.error('Update client error:', error);
      
      if (error.code === 'PGRST116') {
        throw new Error('Client not found');
      }
      
      if (error.code === '23505') { // PostgreSQL unique violation
        if (error.message.includes('email')) {
          throw new Error('A client with this email already exists');
        }
        if (error.message.includes('tax_id')) {
          throw new Error('A client with this tax ID already exists');
        }
        throw new Error('A client with these details already exists');
      }
      
      throw new Error(`Failed to update client: ${error.message}`);
    }

    return client;
  }

  static async deleteClient(id: number) {
    const supabase = await this.getSupabaseClient();
    
    const { error } = await supabase
      .from("clients")
      .delete()
      .eq('client_id', id);

    if (error) {
      throw new Error(`Failed to delete client: ${error.message}`);
    }

    return { message: 'Client deleted successfully' };
  }

  // SALES RETURNS METHODS
  static async getAllSaleReturns(saleId?: number) {
    const supabase = await this.getSupabaseClient();
    
    let query = supabase
      .from("sales_returns")
      .select(`
        *,
        sales:sale_id(sale_id, sale_date),
        products:product_id(product_id, name),
        employees:employee_id(employee_id, first_name, last_name)
      `);

    if (saleId) {
      query = query.eq('sale_id', saleId);
    }

    const { data: returns, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch sale returns: ${error.message}`);
    }

    return returns || [];
  }

  static async getSaleReturnById(id: number) {
    const supabase = await this.getSupabaseClient();
    
    const { data: saleReturn, error } = await supabase
      .from("sales_returns")
      .select(`
        *,
        sales:sale_id(*),
        products:product_id(*),
        employees:employee_id(employee_id, first_name, last_name)
      `)
      .eq('return_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Sale return not found');
      }
      throw new Error(`Failed to fetch sale return: ${error.message}`);
    }

    return saleReturn;
  }

  static async createSaleReturn(returnData: SaleReturnCreateInput) {
    const supabase = await this.getSupabaseClient();
    
    const { data: saleReturn, error } = await supabase
      .from("sales_returns")
      .insert(returnData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create sale return: ${error.message}`);
    }

    return saleReturn;
  }

  static async updateSaleReturn(id: number, returnData: SaleReturnUpdateInput) {
    const supabase = await this.getSupabaseClient();
    
    const { data: saleReturn, error } = await supabase
      .from("sales_returns")
      .update(returnData)
      .eq('return_id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Sale return not found');
      }
      throw new Error(`Failed to update sale return: ${error.message}`);
    }

    return saleReturn;
  }

  static async deleteSaleReturn(id: number) {
    const supabase = await this.getSupabaseClient();
    
    const { error } = await supabase
      .from("sales_returns")
      .delete()
      .eq('return_id', id);

    if (error) {
      throw new Error(`Failed to delete sale return: ${error.message}`);
    }

    return { message: 'Sale return deleted successfully' };
  }

  // ANALYTICS METHODS
  static async getSalesStats(dateFrom?: string, dateTo?: string) {
    const supabase = await this.getSupabaseClient();
    
    let query = supabase
      .from("sales")
      .select("vat, sale_date, status");

    if (dateFrom) query = query.gte('sale_date', dateFrom);
    if (dateTo) query = query.lte('sale_date', dateTo);

    const { data: sales, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch sales stats: ${error.message}`);
    }

    const totalSales = sales?.length || 0;
    const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.vat || 0), 0) || 0;
    const activeSales = sales?.filter(sale => sale.status === true).length || 0;

    return {
      totalSales,
      totalRevenue,
      activeSales,
      averageOrderValue: totalSales > 0 ? totalRevenue / totalSales : 0
    };
  }
}
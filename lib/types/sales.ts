import { z } from 'zod';

// Base Types
export interface Sale {
  sale_id: number;
  client_id?: number;
  order_id?: number;
  employee_id?: number;
  payment_method?: string;
  vat?: number;
  notes?: string;
  status?: boolean;
  sale_date?: string;
}

export interface Client {
  client_id: number;
  client_type?: string;
  taxpayer_type?: string;
  business_name?: string;
  first_name?: string;
  last_name?: string;
  tax_id?: string;
  email?: string;
  phone?: string;
  mobile_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  notes?: string;
  status?: string;
}

export interface SaleReturn {
  return_id: number;
  sale_id?: number;
  product_id?: number;
  order_id?: number;
  employee_id?: number;
  refound_method?: string;
  status?: string;
  reason?: string;
  return_date?: string;
  product_condition?: string;
}

// Validation Schemas
export const SaleCreateSchema = z.object({
  client_id: z.number().optional(),
  order_id: z.number().optional(),
  employee_id: z.number().optional(),
  payment_method: z.string().optional(),
  vat: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  status: z.boolean().optional(),
  sale_date: z.string().datetime().optional(),
});

export const SaleUpdateSchema = SaleCreateSchema.partial();

export const ClientCreateSchema = z.object({
  client_type: z.enum(['individual', 'business']).optional(),
  taxpayer_type: z.string().optional(),
  business_name: z.string().min(1).optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  tax_id: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  mobile_phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
});

export const ClientUpdateSchema = ClientCreateSchema.partial();

export const SaleReturnCreateSchema = z.object({
  sale_id: z.number().positive(),
  product_id: z.number().positive().optional(),
  order_id: z.number().optional(),
  employee_id: z.number().optional(),
  refound_method: z.enum(['cash', 'card', 'transfer', 'store_credit']).optional(),
  status: z.enum(['pending', 'approved', 'rejected', 'processed']).optional(),
  reason: z.string().min(5, 'Reason must be at least 5 characters').optional(),
  return_date: z.string().datetime().optional(),
  product_condition: z.enum(['new', 'used', 'damaged']).optional(),
});

export const SaleReturnUpdateSchema = SaleReturnCreateSchema.partial();


// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query Parameters
export interface SalesQueryParams {
  page?: number;
  limit?: number;
  client_id?: number;
  employee_id?: number;
  status?: boolean;
  date_from?: string;
  date_to?: string;
  payment_method?: string;
}

export interface ClientsQueryParams {
  page?: number;
  limit?: number;
  client_type?: string;
  status?: string;
  search?: string;
}

export type SaleCreateInput = z.infer<typeof SaleCreateSchema>;
export type SaleUpdateInput = z.infer<typeof SaleUpdateSchema>;
export type ClientCreateInput = z.infer<typeof ClientCreateSchema>;
export type ClientUpdateInput = z.infer<typeof ClientUpdateSchema>;
export type SaleReturnCreateInput = z.infer<typeof SaleReturnCreateSchema>;
export type SaleReturnUpdateInput = z.infer<typeof SaleReturnUpdateSchema>;
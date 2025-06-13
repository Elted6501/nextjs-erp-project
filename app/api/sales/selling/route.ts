import { NextRequest } from "next/server";
import { SalesService } from "@/lib/services/salesService";
import { SaleCreateSchema } from "@/lib/types/sales";
import { 
  ApiErrorHandler, 
  ValidationHelper, 
  ResponseHelper, 
  AuthHelper, 
  RateLimiter 
} from "@/lib/utils/api";

// GET /api/sales - Get all sales with optional filters and pagination
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    if (!RateLimiter.check(clientIP)) {
      return ResponseHelper.error('Too many requests', 429);
    }

    // Auth check (optional - remove if not needed)
    // const { user, isAdmin } = await AuthHelper.checkAuth(request);

    const { searchParams } = new URL(request.url);
    const queryParams = ValidationHelper.validateQueryParams(searchParams, [
      'page', 'limit', 'client_id', 'employee_id', 'status', 
      'date_from', 'date_to', 'payment_method'
    ]);

    const result = await SalesService.getAllSales(queryParams);
    
    return ResponseHelper.paginated(result.data, result.pagination);
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

// POST /api/sales - Create a new sale
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    if (!RateLimiter.check(clientIP, 50)) { // More restrictive for POST
      return ResponseHelper.error('Too many requests', 429);
    }

    // Auth check - uncomment when auth is implemented
    // const { user, isAdmin } = await AuthHelper.checkAuth(request);

    const saleData = await ValidationHelper.validateBody(request, SaleCreateSchema);
    const sale = await SalesService.createSale(saleData);
    
    return ResponseHelper.success(sale, 'Sale created successfully');
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}




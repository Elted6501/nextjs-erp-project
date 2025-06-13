import { NextRequest } from "next/server";
import { SalesService } from "@/lib/services/salesService";
import { SaleReturnCreateSchema } from "@/lib/types/sales";
import { 
  ApiErrorHandler, 
  ValidationHelper, 
  ResponseHelper, 
  AuthHelper, 
  RateLimiter 
} from "@/lib/utils/api";

// GET /api/sales-returns - Get all sales returns, optionally filtered by sale_id
export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    if (!RateLimiter.check(clientIP)) {
      return ResponseHelper.error('Too many requests', 429);
    }

    const { searchParams } = new URL(request.url);
    const saleId = searchParams.get('sale_id');
    const saleIdNumber = saleId ? parseInt(saleId) : undefined;

    if (saleId && isNaN(saleIdNumber!)) {
      return ResponseHelper.error('Invalid sale_id parameter', 400);
    }

    const returns = await SalesService.getAllSaleReturns(saleIdNumber);
    
    return ResponseHelper.success(returns);
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

// POST /api/sales-returns - Create a new sales return
export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'anonymous';
    if (!RateLimiter.check(clientIP, 50)) {
      return ResponseHelper.error('Too many requests', 429);
    }

    // Auth check - uncomment when auth is implemented
    // const { user, isAdmin } = await AuthHelper.checkAuth(request);

    const returnData = await ValidationHelper.validateBody(request, SaleReturnCreateSchema);
    
    // Validate that the sale exists before creating return
    try {
      await SalesService.getSaleById(returnData.sale_id);
    } catch (error) {
      return ResponseHelper.error('Referenced sale does not exist', 400);
    }

    const saleReturn = await SalesService.createSaleReturn(returnData);
    
    return ResponseHelper.success(saleReturn, 'Sales return created successfully');
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
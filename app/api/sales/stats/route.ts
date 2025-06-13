import { NextRequest } from "next/server";
import { SalesService } from "@/lib/services/salesService";
import { 
  ApiErrorHandler, 
  ResponseHelper, 
  AuthHelper, 
  RateLimiter 
} from "@/lib/utils/api";

// GET /api/sales/stats - Get sales statistics
export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'anonymous';
    if (!RateLimiter.check(clientIP)) {
      return ResponseHelper.error('Too many requests', 429);
    }

    // Auth check - uncomment when auth is implemented
    // const { user, isAdmin } = await AuthHelper.checkAuth(request);

    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('date_from') || undefined;
    const dateTo = searchParams.get('date_to') || undefined;

    // Validate date formats if provided
    if (dateFrom && isNaN(Date.parse(dateFrom))) {
      return ResponseHelper.error('Invalid date_from format. Use ISO 8601 format.', 400);
    }
    
    if (dateTo && isNaN(Date.parse(dateTo))) {
      return ResponseHelper.error('Invalid date_to format. Use ISO 8601 format.', 400);
    }

    const stats = await SalesService.getSalesStats(dateFrom, dateTo);
    
    return ResponseHelper.success(stats);
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
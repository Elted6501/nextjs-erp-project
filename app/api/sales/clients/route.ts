import { NextRequest } from "next/server";
import { SalesService } from "@/lib/services/salesService";
import { ClientCreateSchema } from "@/lib/types/sales";
import { 
  ApiErrorHandler, 
  ValidationHelper, 
  ResponseHelper, 
  AuthHelper, 
  RateLimiter 
} from "@/lib/utils/api";

// GET /api/clients - Get all clients with optional filters and pagination
export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    if (!RateLimiter.check(clientIP)) {
      return ResponseHelper.error('Too many requests', 429);
    }

    const { searchParams } = new URL(request.url);
    const queryParams = ValidationHelper.validateQueryParams(searchParams, [
      'page', 'limit', 'client_type', 'status', 'search'
    ]);

    const result = await SalesService.getAllClients(queryParams);
    
    return ResponseHelper.paginated(result.data, result.pagination);
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}

// POST /api/clients - Create a new client
export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anonymous';
    if (!RateLimiter.check(clientIP, 50)) {
      return ResponseHelper.error('Too many requests', 429);
    }

    // Auth check - uncomment when auth is implemented
    // const { user, isAdmin } = await AuthHelper.checkAuth(request);

    const clientData = await ValidationHelper.validateBody(request, ClientCreateSchema);
    
    // Basic business validation
    if (!clientData.first_name && !clientData.business_name) {
      return ResponseHelper.error('Either first_name or business_name is required', 400);
    }

    const client = await SalesService.createClient(clientData);
    
    return ResponseHelper.success(client, 'Client created successfully');
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
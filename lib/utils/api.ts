import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';

export interface ApiError {
  message: string;
  status: number;
}

export class ApiErrorHandler {
  static handle(error: unknown): NextResponse {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
      
      if (error.message.includes('validation')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
      
      if (error.message.includes('unauthorized') || error.message.includes('permission')) {
        return NextResponse.json(
          { error: 'Unauthorized access' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export class ValidationHelper {
  static async validateBody<T>(
    request: NextRequest,
    schema: ZodSchema<T>
  ): Promise<T> {
    try {
      const body = await request.json();
      return schema.parse(body);
    } catch (error) {
      throw new Error(`Validation failed: ${error}`);
    }
  }
  
  static validateQueryParams(
    searchParams: URLSearchParams,
    allowedParams: string[]
  ): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {};
    
    for (const [key, value] of searchParams.entries()) {
      if (allowedParams.includes(key)) {
        // Convert common parameter types
        if (key === 'page' || key === 'limit' || key.includes('_id')) {
          const numValue = parseInt(value);
          if (!isNaN(numValue)) {
            params[key] = numValue;
          }
        } else if (key === 'status' && (value === 'true' || value === 'false')) {
          params[key] = value === 'true';
        } else {
          params[key] = value;
        }
      }
    }
    
    return params;
  }
}

export class ResponseHelper {
  static success<T>(data: T, message?: string) {
    return NextResponse.json({
      data,
      message,
      success: true
    });
  }
  
  static error(message: string, status: number = 400) {
    return NextResponse.json({
      error: message,
      success: false
    }, { status });
  }
  
  static paginated<T>(data: T[], pagination: any) {
    return NextResponse.json({
      data,
      pagination,
      success: true
    });
  }
}

// Simple auth check - you'll need to implement this based on your auth system
export class AuthHelper {
  static async checkAuth(request: NextRequest): Promise<{ user: any; isAdmin: boolean }> {
    // This is a placeholder - implement based on your auth system
    // For now, we'll assume all requests are authenticated
    // You should implement JWT verification or session checking here
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }
    
    // Placeholder logic - replace with actual auth verification
    return {
      user: { id: 1, email: 'user@example.com' },
      isAdmin: true // This should come from your auth system
    };
  }
  
  static requireAdmin(isAdmin: boolean) {
    if (!isAdmin) {
      throw new Error('Admin access required');
    }
  }
}

// Rate limiting helper (basic implementation)
export class RateLimiter {
  private static requests = new Map<string, { count: number; resetTime: number }>();
  
  static check(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now();
    const request = this.requests.get(identifier);
    
    if (!request || now > request.resetTime) {
      this.requests.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    if (request.count >= limit) {
      return false;
    }
    
    request.count++;
    return true;
  }
}
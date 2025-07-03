import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Interface for the expected JWT payload
interface JwtPayload {
  employee_id: string;
  // Add other fields here if your token includes them
}

// API route to get the employee_id from the JWT token in cookies
export async function GET(req: NextRequest) {
  // Get the token from cookies
  const token = req.cookies.get('token')?.value;
  if (!token) {
    // If no token, return 401 Unauthorized
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }
  try {
    // Verify and decode the JWT using the secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    // Return the employee_id from the token
    return NextResponse.json({ employee_id: decoded.employee_id });
  } catch {
    // If token is invalid, return 401 Unauthorized
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
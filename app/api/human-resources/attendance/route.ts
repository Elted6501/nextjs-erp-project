import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  employee_id: string;
  // agrega aquí otros campos si tu token los tiene
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'No token' }, { status: 401 });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    return NextResponse.json({ employee_id: decoded.employee_id });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
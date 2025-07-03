import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET: string = process.env.JWT_SECRET!;

async function verifyJWT(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  return await jwtVerify(token, secret);
}

export async function middleware(request: NextRequest) {
  const dataEmployee = [];
  const privPaths = [
    // "/finance",
    // "/inventory",
    // "/sales",
    // "/human-resources",
    "/maintenance",
    // "/api/finance",
    // "/api/inventory",
    // "/api/sales",
    // "/api/human-resources",
    // "/api/maintenance",
  ];

  if (privPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    const information = request.cookies.get("token")?.value;

    if (!information) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const { payload } = await verifyJWT(information);

      const { roles } = payload;

      return NextResponse.next();
    } catch (err) {
      console.error("Token verification failed", err);
      return NextResponse.redirect(new URL("/login", request.url));
    }

  }
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  // Get cookies from the request
  const cookieStore = await cookies();
  // Get the JWT token from cookies
  const token = cookieStore.get('token')?.value;

  // If no token, return empty permissions array
  if (!token) {
    return NextResponse.json([]);
  }

  try {
    // Decode the JWT to get the employee_id
    const decoded = jwt.verify(token, JWT_SECRET) as { employee_id: string };
    const { employee_id } = decoded;
    // Create a Supabase client instance
    const supabase = await createClient();

    // 1. Get all roles for the user
    const { data: rolesData, error: rolesError } = await supabase
      .from("employee_roles")
      .select("role_id")
      .eq("employee_id", employee_id);

    // If error or no roles, return empty permissions array
    if (rolesError || !rolesData || rolesData.length === 0) {
      return NextResponse.json([]);
    }

    // Extract role IDs
    const roleIds = rolesData.map(r => r.role_id);

    // If user is admin (role_id === 1), return all permissions
    if (roleIds.includes(1)) {
      const { data: allPermissions, error: allPermissionsError } = await supabase
        .from("permissions")
        .select("permission_key");

      if (allPermissionsError) {
        return NextResponse.json([]);
      }
      const permissionKeys = allPermissions.map(p => p.permission_key);
      return NextResponse.json(permissionKeys);
    }

    // 2. Get all permission_ids for these roles
    const { data: permissionIdsData, error: permissionIdsError } = await supabase
      .from("role_permissions")
      .select("permission_id")
      .in("role_id", roleIds);

    // If error or no permissions, return empty array
    if (permissionIdsError || !permissionIdsData || permissionIdsData.length === 0) {
      return NextResponse.json([]);
    }

    // Extract permission IDs
    const permissionIds = permissionIdsData.map(p => p.permission_id);

    if (permissionIds.length === 0) {
      return NextResponse.json([]);
    }

    // 3. Get permission_key for those permission_ids
    const { data: permissionsData, error: permissionsError } = await supabase
      .from("permissions")
      .select("permission_key")
      .in("permission_id", permissionIds);

    if (permissionsError) {
      return NextResponse.json([]);
    }

    // Extract permission keys
    const permissionKeys = permissionsData.map(p => p.permission_key);

    // Return the permission keys as JSON
    return NextResponse.json(permissionKeys);
  } catch {
    // If token is invalid or any error occurs, return empty array
    return NextResponse.json([]);
  }
}
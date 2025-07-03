import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json([]);
  }

  try {
    // Cambia aquí: decodifica el user_id del token
    const decoded = jwt.verify(token, JWT_SECRET) as { employee_id: string };
    const { employee_id } = decoded;
    const supabase = await createClient();

    // 1. Obtén todos los roles del usuario
    const { data: rolesData, error: rolesError } = await supabase
      .from("employee_roles")
      .select("role_id")
      .eq("employee_id", employee_id);

    if (rolesError || !rolesData || rolesData.length === 0) {
      return NextResponse.json([]);
    }

    const roleIds = rolesData.map(r => r.role_id);

    // Si es admin (role_id === 1), devuelve todos los permisos
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

    // 2. Obtén todos los permission_id para esos roles
    const { data: permissionIdsData, error: permissionIdsError } = await supabase
      .from("role_permissions")
      .select("permission_id")
      .in("role_id", roleIds);

    if (permissionIdsError || !permissionIdsData || permissionIdsData.length === 0) {
      return NextResponse.json([]);
    }

    const permissionIds = permissionIdsData.map(p => p.permission_id);

    if (permissionIds.length === 0) {
      return NextResponse.json([]);
    }

    // 3. Obtén los permission_key de esos permission_id
    const { data: permissionsData, error: permissionsError } = await supabase
      .from("permissions")
      .select("permission_key")
      .in("permission_id", permissionIds);

    if (permissionsError) {
      return NextResponse.json([]);
    }

    const permissionKeys = permissionsData.map(p => p.permission_key);

    return NextResponse.json(permissionKeys);
  } catch {
    return NextResponse.json([]);
  }
}
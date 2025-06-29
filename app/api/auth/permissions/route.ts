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
    const decoded = jwt.verify(token, JWT_SECRET) as { role_id: number };
    const { role_id } = decoded;
    const supabase = await createClient();

    if (role_id === 1) {
       // Admin role, return all permissions
       const { data: allPermissions, error: allPermissionsError } = await supabase
           .from("permissions")
           .select("permission_key");

       if (allPermissionsError) {
           return NextResponse.json([]);
       }
       const permissionKeys = allPermissions.map(p => p.permission_key);
       return NextResponse.json(permissionKeys);
   }

   // Get all permission IDs for the role
   const { data: permissionIdsData, error: permissionIdsError } = await supabase
       .from("role_permissions")
       .select("permission_id")
       .eq("role_id", role_id);

   if (permissionIdsError) {
       return NextResponse.json([]);
   }

   const permissionIds = permissionIdsData.map(p => p.permission_id);

   if (permissionIds.length === 0) {
       return NextResponse.json([]);
   }

   // Get permission keys from the permissions table
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
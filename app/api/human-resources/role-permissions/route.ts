import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Obtener todos los permisos asignados a roles
export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("permissions")
    .select(`
      permission_id,
      permission_key,
      description,
      role_permissions (
        role_id
      )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data ?? []);
}

// Asignar o actualizar permisos para un rol
export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { permission_id, role_ids } = await request.json();

    if (!permission_id || !Array.isArray(role_ids)) {
      return NextResponse.json(
        { error: "permission_id and an array of role_ids are required" },
        { status: 400 }
      );
    }

    // Delete existing assignments
    const { error: deleteError } = await supabase
      .from("role_permissions")
      .delete()
      .eq("permission_id", permission_id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert new assignments
    if (role_ids.length > 0) {
      const newLinks = role_ids.map((role_id) => ({ permission_id, role_id }));
      const { error: insertError } = await supabase
        .from("role_permissions")
        .insert(newLinks);

      if (insertError) {
        console.error("Insert error:", insertError);
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error in POST /role-permissions:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

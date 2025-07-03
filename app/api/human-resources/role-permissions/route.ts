import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Get all permissions assigned to roles
export async function GET() {
  // Create a Supabase client instance
  const supabase = await createClient();
  // Query permissions and their assigned roles
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

  // Handle errors from the database query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Return the permissions data (or empty array if none)
  return NextResponse.json(data ?? []);
}

// Assign or update permissions for a role
export async function POST(request: Request) {
  // Create a Supabase client instance
  const supabase = await createClient();

  try {
    // Parse permission_id and role_ids from the request body
    const { permission_id, role_ids } = await request.json();

    // Validate required fields
    if (!permission_id || !Array.isArray(role_ids)) {
      return NextResponse.json(
        { error: "permission_id and an array of role_ids are required" },
        { status: 400 }
      );
    }

    // Delete existing assignments for this permission
    const { error: deleteError } = await supabase
      .from("role_permissions")
      .delete()
      .eq("permission_id", permission_id);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Insert new assignments if any role_ids are provided
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

    // Return success response
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    // Handle unexpected errors
    console.error("Unexpected error in POST /role-permissions:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

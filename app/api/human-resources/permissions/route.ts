import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Fetch all permissions with their associated roles
export async function GET() {
  // Create a Supabase client instance
  const supabase = await createClient();
  // Query permissions and join with role_permissions and roles to get role names
  const { data, error } = await supabase
    .from("permissions")
    .select(`
      permission_id,
      permission_key,
      description,
      role_permissions!left (
        role_id,
        roles (
          role_name
        )
      )
    `);

  // Handle errors from the database query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the permissions data (or empty array if none)
  return NextResponse.json(data ?? []);
}

// POST: Create a new permission
export async function POST(request: Request) {
  // Create a Supabase client instance
  const supabase = await createClient();
  // Parse the request body
  const body = await request.json();

  // Insert the new permission into the database
  const { data, error } = await supabase
    .from("permissions")
    .insert(body)
    .select()
    .single();

  // Handle errors from the insert
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the created permission data with 201 status
  return NextResponse.json(data, { status: 201 });
}

// DELETE: Delete one or more permissions by IDs
export async function DELETE(request: Request) {
  // Create a Supabase client instance
  const supabase = await createClient();
  // Parse the IDs array from the request body
  const { ids } = await request.json();

  // Validate that IDs are provided
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  // Delete the permissions with the given IDs
  const { error } = await supabase.from("permissions").delete().in("permission_id", ids);

  // Handle errors from the delete
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return success response
  return NextResponse.json({ success: true });
}
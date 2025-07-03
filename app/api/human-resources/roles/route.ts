import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Fetch all roles
export async function GET() {
  // Create a Supabase client instance
  const supabase = await createClient();
  // Query all roles from the database
  const { data, error } = await supabase.from("roles").select("*");
  // Handle errors from the database query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Return the roles data (or empty array if none)
  return NextResponse.json(data ?? []);
}

// POST: Create a new role
export async function POST(request: Request) {
  // Create a Supabase client instance
  const supabase = await createClient();
  // Parse role_name and description from the request body
  const { role_name, description } = await request.json();

  // Insert the new role into the database
  const { data, error } = await supabase
    .from("roles")
    .insert([{ role_name, description }])
    .select()
    .single();

  // Handle errors from the insert
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the created role data with 201 status
  return NextResponse.json(data, { status: 201 });
}

// DELETE: Delete one or more roles by IDs
export async function DELETE(request: Request) {
  // Create a Supabase client instance
  const supabase = await createClient();
  // Parse the IDs array from the request body
  const { ids } = await request.json();

  // Validate that IDs are provided
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  // Delete the roles with the given IDs
  const { error } = await supabase.from("roles").delete().in("role_id", ids);

  // Handle errors from the delete
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return success response
  return NextResponse.json({ success: true });
}
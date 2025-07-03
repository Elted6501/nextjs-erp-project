import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// API route to update a role by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // Create a Supabase client instance
  const supabase = await createClient();
  // Extract role ID from route params
  const { id } = params;
  // Parse role_name and description from the request body
  const { role_name, description } = await request.json();

  // Update the role data in the database
  const { data, error } = await supabase
    .from("roles")
    .update({ role_name, description })
    .eq("role_id", id)
    .select()
    .single();

  // Handle errors from the update
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the updated role data
  return NextResponse.json(data);
}
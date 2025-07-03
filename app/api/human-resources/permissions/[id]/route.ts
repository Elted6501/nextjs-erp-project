import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// API route to update a permission by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  // Create a Supabase client instance
  const supabase = await createClient();
  // Extract permission ID from route params
  const { id } = params;
  // Parse request body
  const body = await request.json();

  // Update permission data in the database
  const { data, error } = await supabase
    .from("permissions")
    .update(body)
    .eq("permission_id", id)
    .select()
    .single();

  // Handle errors from the update
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Return the updated permission data
  return NextResponse.json(data);
}
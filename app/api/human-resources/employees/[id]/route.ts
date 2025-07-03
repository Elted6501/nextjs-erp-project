import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

// API route to update an employee by ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  // Create a Supabase client instance
  const supabase = await createClient();
  // Extract employee ID from route params
  const { id } = await params;
  // Parse request body
  const body = await request.json();

  // Extract roles from the body and remove from update object
  const role_ids = body.role_ids || [];
  delete body.role_ids;

  // If updating password, hash it and force must_change_password to true
  if (body.password) {
    body.password = await bcrypt.hash(body.password, 10);
    body.must_change_password = true;
  }

  // Update employee data in the database
  const { data, error } = await supabase
    .from("employees")
    .update(body)
    .eq("employee_id", id)
    .select()
    .single();

  // Handle errors from the update
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Delete all current roles for the employee
  await supabase.from("employee_roles").delete().eq("employee_id", id);

  // Insert the new selected roles (if any)
  for (const role_id of role_ids) {
    await supabase.from("employee_roles").insert({
      employee_id: id,
      role_id,
    });
  }

  // Return the updated employee data
  return NextResponse.json(data);
}
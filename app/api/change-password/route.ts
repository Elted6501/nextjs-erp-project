import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

// API route to handle password change requests
export async function POST(req: NextRequest) {
  // Create a Supabase client instance
  const supabase = await createClient();
  // Parse userId and password from the request body
  const { userId, password } = await req.json();

  // Validate required fields
  if (!userId || !password) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  // Hash the new password using bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update the employee's password and reset must_change_password flag
  const { error } = await supabase
    .from("employees")
    .update({ password: hashedPassword, must_change_password: false })
    .eq("employee_id", userId);

  // Handle errors from the database update
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Respond with success if password was updated
  return NextResponse.json({ success: true });
}
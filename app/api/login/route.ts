import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import bcrypt from "bcryptjs";

// Secret key for JWT signing
const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  // Create a Supabase client instance
  const supabase = await createClient();

  try {
    // Parse username and password from the request body
    const { username, password } = await req.json();

    // Query the employee by email (username)
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .eq("email", username)
      .single();

    // If user not found or error, return 401
    if (error || !data) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, data.password);

    if (!isMatch) {
      // If password does not match, return 401
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // If the user must change password, do not generate token
    if (data.must_change_password) {
      return NextResponse.json({ mustChangePassword: true, userId: data.employee_id });
    }

    // Get all roles for the user
    const { data: rolesData} = await supabase
      .from("employee_roles")
      .select("role_id")
      .eq("employee_id", data.employee_id);

    // Extract role IDs as an array
    const role_ids = rolesData ? rolesData.map(r => r.role_id) : [];

    // Generate JWT token with user info and roles
    const token = jwt.sign(
      {
        employee_id: data.employee_id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role_ids, // now an array
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Create the response and set the token as an HTTP-only cookie
    const res = NextResponse.json({ success: true, token });

    res.headers.set(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 2, // 2 hours
      })
    );

    return res;
  } catch (error) {
    // Handle unexpected errors
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

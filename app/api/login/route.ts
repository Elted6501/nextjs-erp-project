import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {

  const supabase = await createClient();

  try {
    const { username, password } = await req.json();

    const { data, error } = await supabase.from("employees").select("*").eq("email", username).single();

    if (error || !data) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (data.password !== password) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    const token = jwt.sign(
      {
        employee_id: data.employee_id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        role_id: data.role_id,
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    const res = NextResponse.json({ success: true, token });

    res.headers.set(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 2,
      })
    );

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

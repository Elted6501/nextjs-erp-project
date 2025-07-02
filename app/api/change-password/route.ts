import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { userId, password } = await req.json();

  if (!userId || !password) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { error } = await supabase
    .from("employees")
    .update({ password: hashedPassword, must_change_password: false })
    .eq("employee_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: payments_due, error } = await supabase.from("payments_due").select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(payments_due);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase.from("payments_due").insert(body);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
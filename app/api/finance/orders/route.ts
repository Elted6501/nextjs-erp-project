import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: orders, error } = await supabase.from("orders").select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase.from("orders").insert(body);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

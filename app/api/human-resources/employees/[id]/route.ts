import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("employees")
    .update(body)
    .eq("employee_id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
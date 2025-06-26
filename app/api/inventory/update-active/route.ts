import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = await createClient();

  const updates = body.map(({ id, active }: { id: string; active: boolean }) =>
    supabase.from('products').update({ active: active }).eq('product_id', id)
  );

  const results = await Promise.all(updates);

  const errors = results.filter(r => r.error);

  if (errors.length) {
    return NextResponse.json({ success: false, errors }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
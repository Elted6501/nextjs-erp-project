import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = await createClient();
  
  const employee_id = 101;

  const results = await Promise.all(
    body.map(async (id: string | number) => {
      const productId = typeof id === 'string' ? parseInt(id, 10) : id;
        const { error } = await supabase.rpc("remove_product", { p_product_id: productId, p_employee_id: employee_id });
        return error;
    })
  );

  const errors = results.filter(e => e != null);

  if (errors.length > 0) {
    return NextResponse.json({ success: false, errors }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: orders, error } = await supabase.from("view_orders_with_names").select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(orders);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const {id, status} = body;

  if(!id){
    return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
  }
  
  const allowedStatuses = ["Paid", "Cancelled"];

  if (status && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
  }

  const { data, error } = await supabase.from("orders").update({status}).eq("order_id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Order updated successfully",
    data,
   });
}

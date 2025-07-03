import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: pending_to_pay, error } = await supabase.from("view_pending_to_pay_with_product").select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(pending_to_pay);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const {id, status} = body;

  if(!id){
    return NextResponse.json({ error: "Payable ID is required" }, { status: 400 });
  }
  
  const allowedStatuses = ["Paid", "Expired"];

  if (status && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid payable status" }, { status: 400 });
  }

  const { data, error } = await supabase.from("pending_to_pay").update({status}).eq("payable_id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Payment updated successfully",
    data,
   });
}
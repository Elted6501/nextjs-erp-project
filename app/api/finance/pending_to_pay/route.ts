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
  const {payable_id, status} = body;

  if(!payable_id){
    return NextResponse.json({ error: "Payable ID is required" }, { status: 400 });
  }
  
  const allowedStatuses = ["Paid", "Expired"];

  if (status && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
  }

  const { error } = await supabase.rpc('update_pending_to_pay_status', {
    payable_id: payable_id,
    option: status
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Payment updated successfully",
   });
}
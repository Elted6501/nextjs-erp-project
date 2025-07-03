import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: quotations, error } = await supabase.from("view_invoices_with_details").select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(quotations);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const {id, status} = body;

  if(!id){
    return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
  }
  
  const allowedStatuses = ["Issued", "Expired"];

  if (status && !allowedStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid invoice status" }, { status: 400 });
  }

  const { data, error } = await supabase.from("invoices").update({status}).eq("invoice_id", body.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    message: "Invoice updated successfully",
    data,
   });
}
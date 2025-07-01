import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const folio = new URLSearchParams(new URL(req.url).searchParams).get("folio");

  if (typeof folio === "string") {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("maintenance")
      .select()
      .eq("maintenance_folio", folio);

    if (error) return NextResponse.json({ error }, { status: 500 });

    return NextResponse.json({ data }, { status: 200 });
  }

  return NextResponse.json({ error: "There was an error" }, { status: 500 });
}

export async function PUT(request: Request) {
  const req = await request.json();

  if (typeof req.status === "string" && typeof req.folio === "string") {
      const supabase = await createClient();

    const { error } = await supabase
      .from("maintenance")
      .update({ status: req.status.toString() })
      .eq("maintenance_folio", req.folio.toString());

      if(error){
         return NextResponse.json({ error }, { status: 500 });
      }

      return NextResponse.json({ status: 200 });
  }

  return NextResponse.json({error: 'There was a problem'},{ status: 500 });
}

export async function DELETE(request: Request){
   const folio = new URLSearchParams(new URL(request.url).searchParams).get("folio"); 

  if(typeof folio === 'string'){
    const supabase = await createClient();
    
    const {error} = await supabase.from('maintenance').delete().eq('maintenance_folio', folio.toString());

    if(error){
      return NextResponse.json({ error }, { status: 500 });
    }

      return NextResponse.json({ status: 200 });
  }

  return NextResponse.json({error: 'There was a problem'},{ status: 500 });
}
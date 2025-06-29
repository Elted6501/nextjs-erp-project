import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
 const { data, error } = await supabase
   .from("permissions")
   .select(`
     permission_id,
     permission_key,
     description,
     role_permissions!left (
       role_id,
       roles (
         role_name
       )
     )
   `);

 if (error) {
   return NextResponse.json({ error: error.message }, { status: 500 });
 }

 return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from("permissions")
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

export async function DELETE(request: Request) {
   const supabase = await createClient();
   const { ids } = await request.json();

   if (!Array.isArray(ids) || ids.length === 0) {
       return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
   }

   const { error } = await supabase.from("permissions").delete().in("permission_id", ids);

   if (error) {
       return NextResponse.json({ error: error.message }, { status: 500 });
   }

   return NextResponse.json({ success: true });
}
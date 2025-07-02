import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

export async function GET() {
  const supabase = await createClient();
  // Trae todos los empleados y el nombre del rol asociado
  const { data, error } = await supabase
    .from("employees")
    .select(`
      *,
      roles:role_id (
        role_id,
        role_name
      )
    `);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Aplana el role_name al nivel del empleado
  const mapped = (data ?? []).map((emp: any) => ({
    ...emp,
    role_name: emp.roles?.role_name ?? null,
    role_id: emp.role_id ?? emp.roles?.role_id ?? null,
  }));

  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  // Si el body incluye password, hashearla antes de guardar
  let insertData = { ...body };
  if (body.password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);
    insertData.password = hashedPassword;
  }

  const { data, error } = await supabase
    .from("employees")
    .insert(insertData)
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

  const { error } = await supabase.from("employees").delete().in("employee_id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const { updates } = await request.json();

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  const updatePromises = updates.map(u =>
    supabase.from('employees').update({ active: u.active }).eq('employee_id', u.id)
  );

  const results = await Promise.all(updatePromises);

  const errors = results.filter(res => res.error);

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.map(e => e.error!.message).join(', ') }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
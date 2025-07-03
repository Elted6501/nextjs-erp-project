import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

export async function PUT(request: Request, context: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = await context.params;
  const body = await request.json();

  // Extrae los roles del body y quítalos del objeto de actualización
  const role_ids = body.role_ids || [];
  delete body.role_ids;

  // Si se está actualizando la contraseña, hashea la contraseña y fuerza must_change_password a true
  if (body.password) {
    body.password = await bcrypt.hash(body.password, 10);
    body.must_change_password = true;
  }

  // Actualiza los datos del empleado
  const { data, error } = await supabase
    .from("employees")
    .update(body)
    .eq("employee_id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Actualiza los roles en la tabla intermedia
  // 1. Borra los roles actuales
  await supabase.from("employee_roles").delete().eq("employee_id", id);

  // 2. Inserta los nuevos roles
  for (const role_id of role_ids) {
    await supabase.from("employee_roles").insert({
      employee_id: id,
      role_id,
    });
  }

  return NextResponse.json(data);
}
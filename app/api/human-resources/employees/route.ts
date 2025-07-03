import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import bcrypt from "bcryptjs";

// Utilidad para obtener roles de un empleado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getEmployeeRoles(supabase: any, employee_id: number) {
  const { data, error } = await supabase
    .from("employee_roles")
    .select(`
      role_id,
      roles (
        role_name
      )
    `)
    .eq("employee_id", employee_id);

  if (error) return { role_ids: [], role_names: [] };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role_ids = data.map((r: any) => r.role_id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role_names = data.map((r: any) => r.roles?.role_name ?? null);
  return { role_ids, role_names };
}

export async function GET() {
  const supabase = await createClient();

  // Trae todos los empleados
  const { data: employees, error } = await supabase
    .from("employees")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Para cada empleado, trae sus roles (como arrays)
  const mapped = await Promise.all(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (employees ?? []).map(async (emp: any) => {
      const { role_ids, role_names } = await getEmployeeRoles(supabase, emp.employee_id);
      return {
        ...emp,
        role_ids,
        role_names,
      };
    })
  );

  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  // Si el body incluye password, hashearla antes de guardar
  const insertData = { ...body };
  if (body.password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);
    insertData.password = hashedPassword;
  }

  // Extrae roles y quítalos del insert
  const role_ids = insertData.role_ids || [];
  delete insertData.role_ids;

  // Inserta empleado
  const { data: employee, error } = await supabase
    .from("employees")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Inserta roles en tabla intermedia
  for (const role_id of role_ids) {
    await supabase.from("employee_roles").insert({
      employee_id: employee.employee_id,
      role_id,
    });
  }

  // Devuelve empleado con roles
  const { role_ids: new_role_ids, role_names } = await getEmployeeRoles(supabase, employee.employee_id);

  return NextResponse.json(
    {
      ...employee,
      role_ids: new_role_ids,
      role_names,
    },
    { status: 201 }
  );
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { ids } = await request.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  // Borra relaciones en tabla intermedia
  await supabase.from("employee_roles").delete().in("employee_id", ids);

  // Borra empleados
  const { error } = await supabase.from("employees").delete().in("employee_id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  // Create a Supabase client instance
  const supabase = await createClient();
  // Parse the updates array from the request body
  const { updates } = await request.json();

  // Validate that updates is a non-empty array
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  // For each update, update the employee's active status and roles if provided
  const updatePromises = updates.map(async (u) => {
    // Update the employee's active status
    await supabase.from("employees").update({ active: u.active }).eq("employee_id", u.id);

    // If role_ids are provided, update the employee_roles table
    if (u.role_ids) {
      // Delete current roles for the employee
      await supabase.from("employee_roles").delete().eq("employee_id", u.id);
      // Insert new roles for the employee
      for (const role_id of u.role_ids) {
        await supabase.from("employee_roles").insert({
          employee_id: u.id,
          role_id,
        });
      }
    }
  });

  // Wait for all updates to complete
  await Promise.all(updatePromises);

  // Respond with success
  return NextResponse.json({ success: true });
}
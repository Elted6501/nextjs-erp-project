import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  try {
    const { username, password } = await req.json();

    // 1. Obtener información básica del empleado
    const { data: employee, error: employeeError } = await supabase.from("employees").select("*").eq("email", username).single();

    if (employeeError || !employee) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    if (employee.password !== password) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // 2. Obtener los roles del empleado usando una subconsulta
    const { data: rolesData, error: rolesError } = await supabase
      .from("employee_roles")
      .select(
        `
        role_id,
        roles:roles(role_name)
      `
      )
      .eq("employee_id", employee.employee_id);

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
    }

    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    const roles = rolesData?.map((role: any) => role.roles.role_name) || [];

    const token = jwt.sign(
      {
        employee_id: employee.employee_id,
        email: employee.email,
        first_name: employee.first_name,
        last_name: employee.last_name,
        roles: roles,
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    // 5. Configurar respuesta con cookie
    const res = NextResponse.json({
      success: true,
      token,
      employee: {
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        roles: roles,
      },
    });

    res.headers.set(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 2,
      })
    );

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json({ error: 'Missing date range' }, { status: 400 });
  }

  const supabase = await createClient();

  // 1. Trae empleados y sus roles
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select(`
      employee_id,
      first_name,
      last_name,
      employee_roles (
        role_id,
        roles (
          hourly_rate
        )
      )
    `);

  if (empError) {
    console.error('Error fetching employees:', empError);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }

  // No excluir a ningún empleado
  const filteredEmployees = employees ?? [];

  // 2. Trae asistencias en el rango de fechas
  const { data: attendance, error: attError } = await supabase
    .from('attendance')
    .select('employee_id, clock_in, clock_out, date')
    .gte('date', from)
    .lte('date', to);

  if (attError) {
    console.error('Error fetching attendance:', attError);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }

  // 3. Procesa la nómina
  const result = filteredEmployees.map((emp: any) => {
    const empName = `${emp.first_name} ${emp.last_name}`;

    // Si el empleado tiene varios roles, toma el mayor rate
    const rates = (emp.employee_roles ?? [])
      .map((er: any) => Number(er.roles?.hourly_rate ?? 0))
      .filter((rate: number) => !isNaN(rate));
    const rate = rates.length > 0 ? Math.max(...rates) : 0;

    // Filtra asistencias del empleado
    const entries = (attendance ?? []).filter((a: any) => a.employee_id === emp.employee_id);

    let totalHours = 0;
    for (const entry of entries) {
      if (entry.clock_in && entry.clock_out) {
        const inTime = new Date(`1970-01-01T${entry.clock_in}`);
        const outTime = new Date(`1970-01-01T${entry.clock_out}`);
        const diffMs = outTime.getTime() - inTime.getTime();
        const diffHours = diffMs / 1000 / 60 / 60;
        totalHours += diffHours;
      }
    }

    const baseSalary = totalHours * rate;
    const isr = baseSalary * 0.16;
    const imss = baseSalary * 0.065;
    const deductions = isr + imss;

    return {
      employeeId: emp.employee_id,
      name: empName,
      baseSalary: baseSalary.toFixed(2),
      deductions: deductions.toFixed(2),
      workedHours: totalHours.toFixed(2),
    };
  });

  return NextResponse.json(result);
}

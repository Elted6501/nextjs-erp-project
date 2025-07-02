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

  // 1. Fetch all employees except administrators
  const { data: employees, error: empError } = await supabase
    .from('employees')
    .select('employee_id, first_name, last_name, role_id')
    .neq('role_id', 1);

  if (empError) {
    console.error('Error fetching employees:', empError);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }

  // 2. Fetch roles to get hourly rates
  const { data: roles, error: rolesError } = await supabase
    .from('roles')
    .select('role_id, hourly_rate');

  if (rolesError) {
    console.error('Error fetching roles:', rolesError);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }

  // 3. Fetch attendance records for the given date range
  const { data: attendance, error: attError } = await supabase
    .from('attendance')
    .select('employee_id, clock_in, clock_out, date')
    .gte('date', from)
    .lte('date', to);

  if (attError) {
    console.error('Error fetching attendance:', attError);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }

  // 4. Process payroll data for each employee
  const result = employees.map((emp) => {
    const empName = `${emp.first_name} ${emp.last_name}`;
    const role = roles.find((r) => r.role_id === emp.role_id);
    const rate = Number(role?.hourly_rate ?? 0);

    // Filter attendance entries for the employee
    const entries = attendance.filter((a) => a.employee_id === emp.employee_id);

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
      workedHours: totalHours.toFixed(2), // <-- Added workedHours
    };
  });

  return NextResponse.json(result);
}

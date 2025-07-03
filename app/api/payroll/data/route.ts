import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// API route to calculate payroll data for a given date range
export async function GET(req: NextRequest) {
  // Extract 'from' and 'to' date parameters from the query string
  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  // Validate that both dates are provided
  if (!from || !to) {
    return NextResponse.json({ error: 'Missing date range' }, { status: 400 });
  }

  // Create a Supabase client instance
  const supabase = await createClient();

  // 1. Fetch employees and their roles (including hourly rates)
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

  // Handle errors from the employee query
  if (empError) {
    console.error('Error fetching employees:', empError);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }

  // Use all employees (no exclusion)
  const filteredEmployees = employees ?? [];

  // 2. Fetch attendance records in the date range
  const { data: attendance, error: attError } = await supabase
    .from('attendance')
    .select('employee_id, clock_in, clock_out, date')
    .gte('date', from)
    .lte('date', to);

  // Handle errors from the attendance query
  if (attError) {
    console.error('Error fetching attendance:', attError);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }

  // 3. Process payroll for each employee
  const result = filteredEmployees.map((emp: any) => {
    const empName = `${emp.first_name} ${emp.last_name}`;

    // If the employee has multiple roles, use the highest hourly rate
    const rates = (emp.employee_roles ?? [])
      .map((er: any) => Number(er.roles?.hourly_rate ?? 0))
      .filter((rate: number) => !isNaN(rate));
    const rate = rates.length > 0 ? Math.max(...rates) : 0;

    // Filter attendance entries for this employee
    const entries = (attendance ?? []).filter((a: any) => a.employee_id === emp.employee_id);

    let totalHours = 0;
    for (const entry of entries) {
      if (entry.clock_in && entry.clock_out) {
        // Calculate the difference in hours between clock_in and clock_out
        const inTime = new Date(`1970-01-01T${entry.clock_in}`);
        const outTime = new Date(`1970-01-01T${entry.clock_out}`);
        const diffMs = outTime.getTime() - inTime.getTime();
        const diffHours = diffMs / 1000 / 60 / 60;
        totalHours += diffHours;
      }
    }

    // Calculate base salary and deductions
    const baseSalary = totalHours * rate;
    const isr = baseSalary * 0.16;   // ISR deduction (16%)
    const imss = baseSalary * 0.065; // IMSS deduction (6.5%)
    const deductions = isr + imss;

    // Return payroll data for this employee
    return {
      employeeId: emp.employee_id,
      name: empName,
      baseSalary: baseSalary.toFixed(2),
      deductions: deductions.toFixed(2),
      workedHours: totalHours.toFixed(2),
    };
  });

  // Return the payroll calculation result as JSON
  return NextResponse.json(result);
}

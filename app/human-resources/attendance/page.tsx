'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import DynamicTable from '@/components/DynamicTable';
import { createClient } from '@supabase/supabase-js';

// Configura tu cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const employees = [
  { label: 'Alice Johnson', value: '1' },
  { label: 'Bob Martinez', value: '2' },
  { label: 'Charlie Smith', value: '3' },
];

const columns = [
  { key: 'select', label: '', type: 'checkbox' },
  { key: 'date', label: 'Date', type: 'text' },
  { key: 'employeeName', label: 'Employee Name', type: 'text' },
  { key: 'clockIn', label: 'Clock In', type: 'text' },
  { key: 'clockOut', label: 'Clock Out', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'notes', label: 'Notes', type: 'text' },
  { key: 'actions', label: 'Actions', type: 'action' },
];

type AttendanceRecord = {
  id: string;
  date: string;
  employeeName: string;
  clockIn: string;
  clockOut: string;
  status: string;
  notes: string;
};

export default function AttendancePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const fetchAttendance = async () => {
      // Trae los registros de asistencia y los nombres de empleados
      const { data, error } = await supabase
  .from('attendance')
  .select(`
    attendance_id,
    date,
    clock_in,
    clock_out,
    status,
    notes,
    employee_id,
    employees (
      first_name,
      last_name
    )
  `);

      if (error) {
        console.error('Error fetching attendance:', error);
        setAttendance([]);
      } else {
setAttendance(
  (data as any[]).map((item) => ({
    id: String(item.attendance_id),
    date: item.date,
    employeeName: item.employees
      ? `${item.employees.first_name} ${item.employees.last_name}`
      : item.employee_id,
    clockIn: item.clock_in || '',
    clockOut: item.clock_out || '',
    status: item.status || '',
    notes: item.notes || '',
  }))
);
      }
    };
    fetchAttendance();
  }, []);

  const filteredAttendance = attendance.filter(
    item =>
      (!selectedEmployee || item.employeeName === employees.find(emp => emp.value === selectedEmployee)?.label) &&
      (!selectedDate || item.date === selectedDate)
  );

  // Render action buttons for each row
  const renderActions = (row: AttendanceRecord) => (
    <div className="flex gap-2">
      <Button
        label="Clock In/Out"
        onClick={() => alert(`Clock In/Out for: ${row.employeeName}`)}
        className="bg-green-600 text-white px-2 py-1 rounded"
      />
      <Button
        label="Edit"
        onClick={() => alert(`Edit attendance for: ${row.employeeName}`)}
        className="bg-yellow-500 text-white px-2 py-1 rounded"
      />
    </div>
  );

  // Adapt columns for DynamicTable
  const tableColumns = columns.map(col =>
    col.key === 'actions'
      ? { ...col, render: renderActions }
      : col
  );

  return (
    <div className="min-h-screen bg-[#ecebeb] p-6 space-y-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#a01217]">Attendance</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Dropdown
            options={employees}
            placeholder="Filter by employee"
            onSelect={val => setSelectedEmployee(val)}
          />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Filter by date"
          />
          <Button label="Import CSV" onClick={() => alert('Import CSV')} />
          <Button label="Export CSV" onClick={() => alert('Export CSV')} />
          <Button label="View Report" onClick={() => alert('View Attendance Report')} />
        </div>
      </div>

      <DynamicTable
        data={filteredAttendance}
        columns={tableColumns}
        onSelectedRowsChange={setSelectedIds}
      />

      {selectedIds.length > 0 && (
        <div className="flex justify-end">
          <Button
            label={`Edit Attendance (${selectedIds.length})`}
            className="bg-yellow-500 text-white"
            onClick={() => alert(`Edit attendance for: ${selectedIds.join(', ')}`)}
          />
        </div>
      )}
    </div>
  );
}
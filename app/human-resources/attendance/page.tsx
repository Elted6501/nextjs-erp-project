'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import DynamicTable from '@/components/DynamicTable';

const employees = [
  { label: 'Alice Johnson', value: '1' },
  { label: 'Bob Martinez', value: '2' },
  { label: 'Charlie Smith', value: '3' },
];


const dummyAttendance = [
  {
    id: '1',
    date: '2024-06-10',
    employeeName: 'Alice Johnson',
    clockIn: '08:00',
    clockOut: '17:00',
    status: 'Present',
    notes: '',
  },
  {
    id: '2',
    date: '2024-06-10',
    employeeName: 'Bob Martinez',
    clockIn: '08:20',
    clockOut: '17:05',
    status: 'Late',
    notes: 'Traffic delay',
  },
  {
    id: '3',
    date: '2024-06-10',
    employeeName: 'Charlie Smith',
    clockIn: '',
    clockOut: '',
    status: 'Absent',
    notes: '',
  },
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

export default function AttendancePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [attendance] = useState(dummyAttendance);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const filteredAttendance = attendance.filter(
  item =>
    (!selectedEmployee || item.employeeName === employees.find(emp => emp.value === selectedEmployee)?.label) &&
    (!selectedDate || item.date === selectedDate)
  );

  type AttendanceRecord = {
    id: string;
    date: string;
    employeeName: string;
    clockIn: string;
    clockOut: string;
    status: string;
    notes: string;
  };




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
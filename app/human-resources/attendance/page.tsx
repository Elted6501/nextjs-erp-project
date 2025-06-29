'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import DynamicTable from '@/components/DynamicTable';
import { createClient } from '@supabase/supabase-js';
import DynamicFormModal, {Field} from '@/components/DynamicFormModal';

// Configura tu cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const columns = [
  { key: 'select', label: '', type: 'checkbox' },
  { key: 'date', label: 'Date', type: 'text' },
  { key: 'employeeName', label: 'Employee Name', type: 'text' },
  { key: 'clockIn', label: 'Clock In', type: 'text' },
  { key: 'clockOut', label: 'Clock Out', type: 'text' },
  { key: 'status', label: 'Status', type: 'text' },
  { key: 'notes', label: 'Notes', type: 'text' },
];

type AttendanceRecord = {
  id: string;
  date: string;
  employeeName: string;
  clockIn: string;
  clockOut: string;
  status: string;
  notes: string;
  employeeId: string;
  first_name: string;
  last_name: string;
};

type EmployeeOption = {
  label: string;
  value: string;
};

export default function AttendancePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employeeOptions, setEmployeeOptions] = useState<EmployeeOption[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');


  const [showModal, setShowModal] = useState(false);
  const [fieldsData, setFieldsData] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  
  const fields: Field[] = fieldsData.map((item) => ({
    name: item.toLowerCase(),
    label: item,
    type: 'text',
  }));

  const addArray = ['Notes'];
  
  const handleOpenModal = (fieldArray: string[], title: string) => {
    setFieldsData(fieldArray); // actualizas los campos a mostrar
    setModalTitle(title);
    setShowModal(true); // abres el modal
  };

  const clearFilters = () => {
  setSelectedEmployee(null);
  setSelectedDate('');
  };

  useEffect(() => {
    const fetchAttendance = async () => {
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
        setEmployeeOptions([]);
      } else if (Array.isArray(data)) {
        const attendanceData = data.map((item) => {
          const employee = Array.isArray(item.employees) ? item.employees[0] : item.employees;

          return {
            id: String(item.attendance_id),
            date: item.date,
            employeeName: employee
              ? `${employee.first_name} ${employee.last_name}`
              : item.employee_id,
            clockIn: item.clock_in || '',
            clockOut: item.clock_out || '',
            status: item.status || '',
            notes: item.notes || '',
            employeeId: item.employee_id,
            first_name: employee?.first_name || '',
            last_name: employee?.last_name || '',
          };
        });

        setAttendance(attendanceData);

        // Extrae empleados únicos para el filtro
        const uniqueEmployees: { [key: string]: EmployeeOption } = {};
        attendanceData.forEach((item) => {
          uniqueEmployees[item.employeeId] = {
            label: item.employeeName,
            value: item.employeeId,
          };
        });
        setEmployeeOptions(Object.values(uniqueEmployees));
      } else {
        setAttendance([]);
        setEmployeeOptions([]);
      }
    };
    fetchAttendance();
  }, []);

  const filteredAttendance = attendance.filter(
    item =>
      (!selectedEmployee || item.employeeId === selectedEmployee) &&
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
        //onClick={() => alert(`Edit attendance for: ${row.employeeName}`)}
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
            options={employeeOptions}
            placeholder="Filter by employee"
            onSelect={val => setSelectedEmployee(val)}
          />
          <DynamicFormModal
            title={modalTitle}
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            fields={fields}
            onSubmit={() => alert('info submitted')}
          />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="border rounded px-2 py-1"
            placeholder="Filter by date"
          />
          <Button label="Clear Filters" onClick={() => clearFilters()} />
          <Button label="Export CSV" onClick={() => alert('Export CSV')} />
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
            onClick={() => handleOpenModal(addArray, 'Note')}
          />
        </div>
      )}
    </div>
  );
}
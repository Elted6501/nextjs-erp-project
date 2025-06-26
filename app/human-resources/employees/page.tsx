// app/employees/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import DynamicTable from '@/components/DynamicTable';
import DynamicFormModal, { Field } from '@/components/DynamicFormModal';

interface Employee {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  hireDate: string;
  scheduleStart: string;
  scheduleEnd: string;
  [key: string]: string;
}

const columnConfig = [
  { key: 'select', label: '', type: 'checkbox' },
  { key: 'fullName', label: 'Full Name', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },           // <-- Agregado
  { key: 'phoneNumber', label: 'Phone Number', type: 'text' }, // <-- Agregado
  { key: 'hireDate', label: 'Hire Date', type: 'text' },
  { key: 'scheduleStart', label: 'Schedule Start', type: 'text' },
  { key: 'scheduleEnd', label: 'Schedule End', type: 'text' },
];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [fieldsData, setFieldsData] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('');

  const fields: Field[] = fieldsData.map((item) => ({
    name: item.toLowerCase(),
    label: item,
    type: 'text',
  }));

  const handleOpenModal = (fieldArray: string[], title: string) => {
    setFieldsData(fieldArray); // actualizas los campos a mostrar
    setModalTitle(title);
    setShowModal(true); // abres el modal
  };

  const updateArray = ['Position', 'Department', 'Email', 'Phone', 'Password'];
  const addArray = ['Name', 'Lastname', 'Position', 'Department', 'Email', 'Phone', 'Password'];

  useEffect(() => {
    fetch('/api/human-resources/employees')
      .then((res) => res.json())
      .then((data: Employee[]) => {
        const mapped = data.map((emp) => ({
          id: emp.employee_id,
          fullName: `${emp.first_name} ${emp.last_name}`,
          email: emp.email,
          phoneNumber: emp.phone_number,
          hireDate: emp.hire_date,
          scheduleStart: emp.employee_schedule_start,
          scheduleEnd: emp.employee_schedule_end,
        }));
        setEmployees(mapped);
      });
  }, []);

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  return (
    <div className="min-h-screen bg-[#ecebeb] p-6 space-y-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#a01217]">Employees</h1>
        <div className="flex gap-2 items-center">
          {showModal && (
            <DynamicFormModal
              title={modalTitle}
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              fields={fields}
              onSubmit={() => alert('info submitted')}
            />
          )}
          <Dropdown
            options={[
              { label: 'All Departments', value: 'all' },
              { label: 'IT', value: 'it' },
              { label: 'HR', value: 'hr' },
            ]}
            placeholder="Filter by Department"
          />
          <Dropdown
            options={[
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ]}
            placeholder="Filter by Status"
          />
          <Button label="Add Employee" onClick={() => handleOpenModal(addArray, 'Add Employee')} />
        </div>
      </div>

      <DynamicTable
        data={employees}
        columns={columnConfig}
        onSelectedRowsChange={handleSelectionChange}
      />

      {selectedIds.length > 0 && (
        <div className="flex justify-end">
          <Button
            label={`Delete (${selectedIds.length})`}
            className="bg-black hover:opacity-80 text-white mx-2"
            onClick={() => alert(`Delete users: ${selectedIds.join(', ')}`)}
          />
          <Button
            label={`Update (${selectedIds.length})`}
            className="bg-black hover:opacity-80 text-white mx-2"
            onClick={() => {
              handleOpenModal(updateArray, 'Update Employee');
            }}
          />
        </div>
      )}
    </div>
  );
}
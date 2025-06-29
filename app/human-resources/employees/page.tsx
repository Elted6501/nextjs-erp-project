// app/employees/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import DynamicTable from '@/components/DynamicTable';
import DynamicFormModal, { Field } from '@/components/DynamicFormModal';
import AlertDialog from '@/components/AlertDialog';
import { PermissionsGate } from '@/app/components/PermissionsGate';

interface Employee {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  hireDate: string;
  scheduleStart: string;
  scheduleEnd: string;
  active: boolean;
  [key: string]: undefined | string | boolean;
}

interface RawEmployee {
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address?: string;
  hire_date: string;
  employee_schedule_start: string;
  employee_schedule_end: string;
  active?: boolean;
}

interface EmployeeFormData {
  [key: string]: string | boolean | undefined;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [fieldsData, setFieldsData] = useState<string[]>([]);
  const [modalTitle, setModalTitle] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const fields: Field[] = fieldsData.map((item) => {
    const lower = item.toLowerCase();
    if (lower === 'birth date' || lower === 'hire date') {
      return { name: lower, label: item, type: 'date' };
    }
    if (lower === 'schedule start' || lower === 'schedule end') {
      return { name: lower, label: item, type: 'time' };
    }
    return { name: lower, label: item, type: 'text' };
  });

  const updateArray = [
    'Email', 'Phone Number', 'Address', 'Schedule Start', 'Schedule End', 'Password'
  ];
  const addArray = [
    'First Name', 'Lastname', 'Email', 'Phone Number', 'Address', 'Birth Date', 'Hire Date', 'Password', 'Schedule Start', 'Schedule End'
  ];

  useEffect(() => {
    fetch('/api/human-resources/employees')
      .then((res) => res.json())
      .then((data: RawEmployee[]) => {
        const mapped = data.map((emp) => ({
          id: emp.employee_id,
          fullName: `${emp.first_name} ${emp.last_name}`,
          email: emp.email,
          phoneNumber: emp.phone_number,
          address: emp.address || '',
          hireDate: emp.hire_date,
          scheduleStart: emp.employee_schedule_start,
          scheduleEnd: emp.employee_schedule_end,
          active: !!emp.active,
        }));
        setEmployees(mapped);
      });
  }, []);

  const handleOpenModal = (fieldArray: string[], title: string, employee?: Employee) => {
    setFieldsData(fieldArray);
    setModalTitle(title);
    setShowModal(true);
    setEditingEmployee(employee || null);
  };

  const handleAddOrUpdateEmployee = async (formData: EmployeeFormData) => {
    const {
      'first name': first_name,
      'lastname': last_name,
      email,
      'phone number': phone_number,
      address,
      'birth date': birth_date,
      'hire date': hire_date,
      password,
      'schedule start': employee_schedule_start,
      'schedule end': employee_schedule_end,
    } = formData;

    if (editingEmployee) {
      const res = await fetch(`/api/human-resources/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          phone_number,
          address,
          employee_schedule_start,
          employee_schedule_end,
          password,
        }),
      });

      if (!res.ok) {
        alert('Error updating employee');
        return;
      }

      const updatedEmployee: RawEmployee = await res.json();
      setEmployees(prev =>
        prev.map(emp =>
          emp.id === editingEmployee.id
            ? {
                ...emp,
                ...updatedEmployee,
                fullName: `${updatedEmployee.first_name} ${updatedEmployee.last_name}`,
                phoneNumber: updatedEmployee.phone_number,
                scheduleStart: updatedEmployee.employee_schedule_start,
                scheduleEnd: updatedEmployee.employee_schedule_end,
              }
            : emp
        )
      );
      setEditingEmployee(null);
    } else {
      const res = await fetch('/api/human-resources/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          phone_number,
          address,
          birth_date,
          hire_date,
          password,
          employee_schedule_start,
          employee_schedule_end,
          active: true,
        }),
      });

      if (!res.ok) {
        alert('Error adding employee');
        return;
      }

      const newEmployee: RawEmployee = await res.json();
      setEmployees(prev => [
        ...prev,
        {
          id: newEmployee.employee_id,
          fullName: `${newEmployee.first_name} ${newEmployee.last_name}`,
          email: newEmployee.email,
          phoneNumber: newEmployee.phone_number,
          address: newEmployee.address || '',
          hireDate: newEmployee.hire_date,
          scheduleStart: newEmployee.employee_schedule_start,
          scheduleEnd: newEmployee.employee_schedule_end,
          active: !!newEmployee.active,
        },
      ]);
    }
    setShowModal(false);
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

    const res = await fetch('/api/human-resources/employees', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: selectedIds }),
    });

    if (!res.ok) {
      alert('Error deleting employees');
      return;
    }

    const updatedEmployees = employees.filter(emp => !selectedIds.includes(emp.id));
    setEmployees(updatedEmployees);
    setSelectedIds([]);
  };

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const handleActiveChange = async (activeStates: { id: string; active: boolean }[]) => {
    const res = await fetch('/api/human-resources/employees', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: activeStates }),
    });

    if (!res.ok) {
      alert('Error updating status');
      return;
    }

    setEmployees((prev) =>
      prev.map((emp) => {
        const found = activeStates.find((s) => s.id === emp.id);
        return found ? { ...emp, active: found.active } : emp;
      })
    );
  };

  const filteredEmployees = employees.filter(emp => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'active') return emp.active;
    if (selectedStatus === 'inactive') return !emp.active;
    return true;
  });

  const columnConfig = [
    { key: 'select', label: '', type: 'checkbox' },
    { key: 'fullName', label: 'Full Name', type: 'text' },
    { key: 'email', label: 'Email', type: 'text' },
    { key: 'phoneNumber', label: 'Phone Number', type: 'text' },
    { key: 'address', label: 'Address', type: 'text' },
    { key: 'hireDate', label: 'Hire Date', type: 'text' },
    { key: 'scheduleStart', label: 'Schedule Start', type: 'text' },
    { key: 'scheduleEnd', label: 'Schedule End', type: 'text' },
    { key: 'active', label: 'Status', type: 'switch' },
  ];

  return (
    <PermissionsGate requiredPermission="hr.view">
      <div className="min-h-screen bg-[#ecebeb] p-6 space-y-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-[#a01217]">Employees</h1>
          <div className="flex gap-2 items-center">
            {showModal && (
              <DynamicFormModal
                title={modalTitle}
                isOpen={showModal}
                onClose={() => {
                  setShowModal(false);
                  setEditingEmployee(null);
                }}
                fields={fields}
                onSubmit={handleAddOrUpdateEmployee}
                initialData={editingEmployee}
              />
            )}
            <Dropdown
              options={[
                { label: 'Filter by status', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
              ]}
              placeholder="Filter by Status"
              value={selectedStatus}
              onSelect={setSelectedStatus}
            />
            <Button
              label="Clear Filters"
              onClick={() => setSelectedStatus('all')}
            />
            <Button label="Add Employee" onClick={() => handleOpenModal(addArray, 'Add Employee')} />
          </div>
        </div>

        <DynamicTable
          data={filteredEmployees}
          columns={columnConfig}
          onSelectedRowsChange={handleSelectionChange}
          onActiveChange={handleActiveChange}
        />

        {showAlert && (
          <AlertDialog
            title="Confirmar eliminación"
            content={
              selectedIds.length === 1
                ? '¿Estás seguro de eliminar este empleado?'
                : `¿Estás seguro de eliminar estos ${selectedIds.length} empleados?`
            }
            onCancel={() => setShowAlert(false)}
            onSuccess={async () => {
              setShowAlert(false);
              await handleDelete();
            }}
            onSuccessLabel="Eliminar"
            onCancelLabel="Cancelar"
          />
        )}

        {selectedIds.length > 0 && (
          <div className="flex justify-end">
            <Button
              label={`Delete (${selectedIds.length})`}
              className="bg-black hover:opacity-80 text-white mx-2"
              onClick={() => setShowAlert(true)}
            />
            <Button
              label={`Update (${selectedIds.length})`}
              className="bg-black hover:opacity-80 text-white mx-2"
              onClick={() => {
                if (selectedIds.length === 1) {
                  const emp = employees.find(e => e.id === selectedIds[0]);
                  if (emp) {
                    handleOpenModal(updateArray, 'Update Employee', emp);
                  }
                } else {
                  alert('Selecciona solo un empleado para actualizar.');
                }
              }}
            />
          </div>
        )}
      </div>
    </PermissionsGate>
  );
}

// app/employees/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import DynamicTable from '@/components/DynamicTable';
import DynamicFormModal, { Field } from '@/components/DynamicFormModal';
import AlertDialog from '@/components/AlertDialog';
import { PermissionsGate } from '@/app/components/PermissionsGate';
import { FaSearch } from "react-icons/fa";

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
  roleIds?: string[];
  roleNames?: string[];
  [key: string]: undefined | string | boolean | string[];
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
  role_ids?: string[];
  role_names?: string[];
}

interface EmployeeFormData {
  [key: string]: string | boolean | undefined | string[];
}

interface RoleOption {
  label: string;
  value: string;
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
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [searchText, setSearchText] = useState('');

  // Nueva función para refrescar empleados
  const fetchEmployees = async () => {
    const res = await fetch('/api/human-resources/employees');
    const data: RawEmployee[] = await res.json();
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
      roleIds: emp.role_ids || [],
      roleNames: emp.role_names || [],
    }));
    setEmployees(mapped);
  };

  // Define form fields dynamically
  const fields: Field[] = fieldsData.map((item) => {
    const lower = item.toLowerCase();
    if (lower === 'birth date' || lower === 'hire date') {
      return { name: lower, label: item, type: 'date' };
    }
    if (lower === 'schedule start' || lower === 'schedule end') {
      return { name: lower, label: item, type: 'time' };
    }
    if (lower === 'role') {
      return { name: 'role', label: 'Roles', type: 'multiselect', options: roles };
    }
    return { name: lower, label: item, type: 'text' };
  });

  const updateArray = [
    'Email', 'Phone Number', 'Address', 'Schedule Start', 'Schedule End', 'Password', 'Role'
  ];
  const addArray = [
    'First Name', 'Lastname', 'Email', 'Phone Number', 'Address', 'Birth Date', 'Hire Date', 'Password', 'Schedule Start', 'Schedule End', 'Role'
  ];

  useEffect(() => {
    fetchEmployees();
    // Fetch roles
    fetch('/api/human-resources/roles')
      .then(res => res.json())
      .then((data: { role_id: string; role_name: string }[]) => {
        setRoles(data.map(r => ({ label: r.role_name, value: r.role_id })));
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
      role,
    } = formData;

    // Si es edición, mergea los roles actuales con los seleccionados si no se envió el campo role
    let role_ids: string[] = [];
    if (editingEmployee) {
      if (typeof role === "undefined") {
        role_ids = editingEmployee.roleIds || [];
      } else {
        role_ids = Array.isArray(role)
          ? role.filter((r): r is string => typeof r === 'string')
          : typeof role === 'string'
            ? [role]
            : [];
      }
    } else {
      role_ids = Array.isArray(role)
        ? role.filter((r): r is string => typeof r === 'string')
        : role
          ? [role].filter((r): r is string => typeof r === 'string')
          : [];
    }

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
          role_ids,
        }),
      });

      if (!res.ok) {
        alert('Error updating employee');
        return;
      }

      await fetchEmployees();
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
          role_ids,
        }),
      });

      if (!res.ok) {
        alert('Error adding employee');
        return;
      }

      await fetchEmployees();
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

    await fetchEmployees();
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

    await fetchEmployees();
  };

  // FILTER: status + search
  const filteredEmployees = employees.filter(emp => {
    // Status filter
    const statusOk =
      selectedStatus === 'all' ||
      (selectedStatus === 'active' && emp.active) ||
      (selectedStatus === 'inactive' && !emp.active);

    // Search filter
    const searchOk =
      searchText.trim() === '' ||
      emp.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.phoneNumber?.toLowerCase().includes(searchText.toLowerCase());

    return statusOk && searchOk;
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
    { key: 'roleNames', label: 'Roles', type: 'text' },
    { key: 'active', label: 'Status', type: 'switch' },
  ];

  return (
    <PermissionsGate requiredPermission="hr.view">
      <div className="min-h-screen bg-[#ecebeb] p-6 space-y-6">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-[#a01217]">Employees</h1>
          <div className="flex gap-2 items-center">
            {/* Searchbar */}
            <div className="flex items-center gap-2">
              <FaSearch className="w-4 h-4 text-[#a01217]" />
              <input
                type="text"
                placeholder="Search by name, email or phone"
                className="border border-gray-300 rounded px-2 py-1 w-64"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
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
              onClick={() => {
                setSelectedStatus('all');
                setSearchText('');
              }}
            />
            <Button label="Add Employee" onClick={() => handleOpenModal(addArray, 'Add Employee')} />
          </div>
        </div>

        {/* Modal outside the filter block */}
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

        <DynamicTable
          data={filteredEmployees.map(emp => {
            // Exclude roleIds to satisfy RowData type
            const { roleIds, ...rest } = emp;
            return {
              ...rest,
              roleNames: Array.isArray(emp.roleNames) ? emp.roleNames.join(', ') : emp.roleNames
            };
          })}
          columns={columnConfig}
          onSelectedRowsChange={handleSelectionChange}
          onActiveChange={handleActiveChange}
        />

        {showAlert && (
          <AlertDialog
            title="Confirm deletion"
            content={
              selectedIds.length === 1
                ? 'Are you sure you want to delete this employee?'
                : `Are you sure you want to delete these ${selectedIds.length} employees?`
            }
            onCancel={() => setShowAlert(false)}
            onSuccess={async () => {
              setShowAlert(false);
              await handleDelete();
            }}
            onSuccessLabel="Delete"
            onCancelLabel="Cancel"
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
                  alert('Select only one employee to update.');
                }
              }}
            />
          </div>
        )}
      </div>
    </PermissionsGate>
  );
}

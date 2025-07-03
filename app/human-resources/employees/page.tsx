// app/employees/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/Button';
import Dropdown from '@/components/Dropdown';
import DynamicTable from '@/components/DynamicTable';
import DynamicFormModal, { Field } from '@/components/DynamicFormModal';
import AlertDialog from '@/components/AlertDialog';
import { PermissionsGate } from '@/app/components/PermissionsGate';

// Force dynamic rendering to prevent static generation issues with Supabase
export const dynamic = 'force-dynamic';
import { FaSearch } from "react-icons/fa";

// Employee interface for table data
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
  roleIds?: (string | number)[];
  roleNames?: string[];
  firstName?: string;
  lastname?: string;
  birthDate?: string;
  [key: string]: undefined | string | boolean | (string | number)[];
}

// Raw employee interface as returned from API
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
  role_ids?: (string | number)[];
  role_names?: string[];
  birth_date?: string;
}

// Form data interface for employee modal
interface EmployeeFormData {
  [key: string]: string | boolean | undefined | (string | number)[];
}

// Role dropdown option interface
interface RoleOption {
  label: string;
  value: string;
}

export default function EmployeesPage() {
  // State for employees list
  const [employees, setEmployees] = useState<Employee[]>([]);
  // State for selected row IDs (checkboxes)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  // State for fields to show in modal
  const [fieldsData, setFieldsData] = useState<string[]>([]);
  // State for modal title
  const [modalTitle, setModalTitle] = useState('');
  // State for status filter
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  // State for role filter
  const [selectedRole, setSelectedRole] = useState<string>('all'); 
  // State for currently editing employee
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  // State for alert dialog visibility
  const [showAlert, setShowAlert] = useState(false);
  // State for available roles
  const [roles, setRoles] = useState<RoleOption[]>([]);
  // State for search text
  const [searchText, setSearchText] = useState('');

  // Ref for the select-all checkbox in the table header
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Fetch employees from API and map to Employee interface
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
      firstName: emp.first_name,
      lastname: emp.last_name,
      birthDate: emp.birth_date,
    }));
    setEmployees(mapped);
  };

  // Build the fields for the dynamic form modal based on the selected fields
  const fields: Field[] = fieldsData.map((item) => {
    const lower = item.toLowerCase();
    if (lower === 'birth date' || lower === 'hire date') {
      return { name: lower, label: item, type: 'date' };
    }
    if (lower === 'schedule start' || lower === 'schedule end') {
      return { name: lower, label: item, type: 'time' };
    }
    if (lower === 'role') {
      return { name: 'role', label: 'Roles', type: 'multiselect', options: roles as { label: string; value: string }[] };
    }
    return { name: lower, label: item, type: 'text' };
  });

  // Arrays for add/update modal fields
  const updateArray = [
    'First Name', 'Lastname', 'Email', 'Phone Number', 'Address', 'Birth Date', 'Hire Date', 'Schedule Start', 'Schedule End', 'Password', 'Role'
  ];
  const addArray = [
    'First Name', 'Lastname', 'Email', 'Phone Number', 'Address', 'Birth Date', 'Hire Date', 'Password', 'Schedule Start', 'Schedule End', 'Role'
  ];

  // Fetch employees and roles on mount
  useEffect(() => {
    fetchEmployees();
    // Fetch roles for dropdown
    fetch('/api/human-resources/roles')
      .then(res => res.json())
      .then((data: { role_id: string | number; role_name: string }[]) => {
        setRoles(data.map(r => ({ label: r.role_name, value: String(r.role_id) })));
      });
  }, []);

  // FILTER: status + search + role
  // Filter employees by status, search text, and role
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

    // Role filter
    const roleOk =
      selectedRole === 'all' ||
      (Array.isArray(emp.roleIds) && emp.roleIds.map(String).includes(selectedRole));

    return statusOk && searchOk && roleOk;
  });

  // Set indeterminate state for select-all checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedIds.length > 0 && selectedIds.length < filteredEmployees.length;
    }
  }, [selectedIds, filteredEmployees.length]);

  // Open modal for add or update employee
  const handleOpenModal = (fieldArray: string[], title: string, employee?: Employee) => {
    setFieldsData(fieldArray);
    setModalTitle(title);
    setShowModal(true);
    setEditingEmployee(employee || null);
  };

  // Handle add or update employee form submission
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

    // Build role_ids array from form data
    let role_ids: string[] = [];
    if (Array.isArray(role)) {
      role_ids = role
        .filter(r => typeof r === 'string' || typeof r === 'number')
        .map(r => String(r));
    } else if (
      role !== undefined &&
      role !== null &&
      (typeof role === 'string' || typeof role === 'number')
    ) {
      role_ids = [String(role)];
    }

    if (editingEmployee) {
      // Update employee
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateBody: any = {
        email,
        phone_number,
        address,
        employee_schedule_start,
        employee_schedule_end,
        role_ids,
      };
      // Only add password if provided
      if (typeof password === 'string' && password.trim() !== "") {
        updateBody.password = password;
      }

      const res = await fetch(`/api/human-resources/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody),
      });

      if (!res.ok) {
        alert('Error updating employee');
        return;
      }

      await fetchEmployees();
      setEditingEmployee(null);
    } else {
      // Add new employee
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

  // Handle delete employees
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

  // Handle row selection change
  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  // Handle active status change for employees
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

  // Table column configuration, including select-all checkbox in header
  const columnConfig = [
    {
      key: 'select',
      label: (
        <input
          ref={selectAllRef}
          type="checkbox"
          checked={filteredEmployees.length > 0 && selectedIds.length === filteredEmployees.length}
          onChange={e => {
            if (e.target.checked) {
              setSelectedIds(filteredEmployees.map(emp => emp.id));
            } else {
              setSelectedIds([]);
            }
          }}
          className="w-5 h-5 accent-red-600"
        />
      ),
      type: 'checkbox'
    },
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
        {/* Header and filter controls */}
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
            {/* Status filter dropdown */}
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
            {/* Role filter dropdown */}
            <Dropdown
              options={[
                { label: 'Filter by role', value: 'all' },
                ...roles
              ]}
              placeholder="Filter by Role"
              value={selectedRole}
              onSelect={setSelectedRole}
            />
            {/* Clear filters button */}
            <Button
              label="Clear Filters"
              onClick={() => {
                setSelectedStatus('all');
                setSelectedRole('all');
                setSearchText('');
              }}
            />
            {/* Add employee button */}
            <Button label="Add Employee" onClick={() => handleOpenModal(addArray, 'Add Employee')} />
          </div>
        </div>

        {/* Modal for add/update employee */}
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
            initialData={
              editingEmployee
                ? {
                    'first name': editingEmployee.firstName || editingEmployee.fullName?.split(' ')[0] || '',
                    'lastname': editingEmployee.lastname || editingEmployee.fullName?.split(' ')[1] || '',
                    'email': editingEmployee.email,
                    'phone number': editingEmployee.phoneNumber,
                    'address': editingEmployee.address,
                    'birth date': editingEmployee.birthDate,
                    'hire date': editingEmployee.hireDate,
                    'schedule start': editingEmployee.scheduleStart,
                    'schedule end': editingEmployee.scheduleEnd,
                    'password': '',
                    'role': (editingEmployee.roleIds || []).map(String),
                  }
                : undefined
            }
          />
        )}

        {/* Dynamic table with employees */}
        <DynamicTable
          data={filteredEmployees.map(emp => {
            // Only include fields compatible with RowData
            const {
              id,
              fullName,
              email,
              phoneNumber,
              address,
              hireDate,
              scheduleStart,
              scheduleEnd,
              active,
              roleNames
            } = emp;
            return {
              id,
              fullName,
              email,
              phoneNumber,
              address,
              hireDate,
              scheduleStart,
              scheduleEnd,
              active,
              roleNames: Array.isArray(roleNames) ? roleNames.join(', ') : roleNames
            };
          })}
          columns={columnConfig}
          onSelectedRowsChange={handleSelectionChange}
          onActiveChange={handleActiveChange}
          selectedRowIds={selectedIds}
        />

        {/* Alert dialog for delete confirmation */}
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

        {/* Action buttons for selected rows */}
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
                }
              }}
            />
          </div>
        )}
      </div>
    </PermissionsGate>
  );
}

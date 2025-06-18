'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import DynamicTable from '@/components/DynamicTable';

interface Role {
  [key: string]: string | number | boolean | undefined;
  id: string;
  roleName: string;
  description: string;
  permissions: string;
}

const dummyRoles: Role[] = [
  {
    id: '1',
    roleName: 'Admin',
    description: 'Full access to all features',
    permissions: 'Manage Users, Edit Settings, View Reports',
  },
  {
    id: '2',
    roleName: 'Manager',
    description: 'Can manage employees and payroll',
    permissions: 'View Reports, Approve Payroll',
  },
  {
    id: '3',
    roleName: 'Employee',
    description: 'Basic access to personal data',
    permissions: 'View Own Data',
  },
];

const columnConfig = [
  { key: 'select', label: '', type: 'checkbox' },
  { key: 'roleName', label: 'Role Name', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'permissions', label: 'Associated Permissions', type: 'text' },
  { key: 'actions', label: 'Actions', type: 'action' },
];

export default function RolesPage() {
  const [roles] = useState(dummyRoles);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  // Render action buttons, including Manage Access
  const renderActions = (row: Role) => (
    <div className="flex gap-2">
      <Button
        label="Edit"
        onClick={() => alert(`Edit role: ${row.roleName}`)}
        className="bg-yellow-500 text-white px-2 py-1 rounded"
      />
      <Button
        label="Delete"
        onClick={() => alert(`Delete role: ${row.roleName}`)}
        className="bg-red-600 text-white px-2 py-1 rounded"
      />
      <Button
        label="Manage Permissions"
        onClick={() => alert(`Manage permissions for: ${row.roleName}`)}
        className="bg-blue-600 text-white px-2 py-1 rounded"
      />
      <Button
        label="Manage Access"
        onClick={() => alert(`Show accessible views for: ${row.roleName}`)}
        className="bg-green-600 text-white px-2 py-1 rounded"
      />
    </div>
  );

  // Adapt columns for DynamicTable
  const tableColumns = columnConfig.map(col =>
    col.key === 'actions'
      ? { ...col, render: renderActions }
      : col
  );

  return (
    <div className="min-h-screen bg-[#ecebeb] p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#a01217]">Roles</h1>
        <Button label="Add Role" onClick={() => alert('Open create role modal')} />
      </div>

      <DynamicTable
        data={roles}
        columns={tableColumns}
        onSelectedRowsChange={handleSelectionChange}
      />

      {selectedIds.length > 0 && (
        <div className="flex justify-end">
          <Button
            label={`Delete (${selectedIds.length})`}
            className="bg-black hover:opacity-80 text-white"
            onClick={() => alert(`Delete roles: ${selectedIds.join(', ')}`)}
          />
        </div>
      )}
    </div>
  );
}
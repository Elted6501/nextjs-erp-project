'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import DynamicTable from '@/components/DynamicTable';

const dummyPermissions = [
  {
    id: '1',
    permissionName: 'View Employees',
    description: 'Allows viewing employee records',
    roles: 'Admin, Manager',
  },
  {
    id: '2',
    permissionName: 'Edit Payroll',
    description: 'Allows editing payroll information',
    roles: 'Admin, Manager',
  },
  {
    id: '3',
    permissionName: 'Manage Roles',
    description: 'Allows managing user roles',
    roles: 'Admin',
  },
];

const columns = [
  { key: 'select', label: '', type: 'checkbox' },
  { key: 'permissionName', label: 'Permission Name', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'roles', label: 'Used By Roles', type: 'text' },
  { key: 'actions', label: 'Actions', type: 'action' },
];

interface Permission {
  id: string;
  permissionName: string;
  description: string;
  roles: string;
}


export default function PermissionsPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [permissions] = useState(dummyPermissions);



  const renderActions = (row: Permission) => (
    <div className="flex gap-2">
      <Button
        label="Assign to Role"
        onClick={() => alert(`Assign permission to role: ${row.permissionName}`)}
        className="bg-blue-600 text-white px-2 py-1 rounded"
      />
      <Button
        label="Edit"
        onClick={() => alert(`Edit description for: ${row.permissionName}`)}
        className="bg-yellow-500 text-white px-2 py-1 rounded"
      />
      <Button
        label="Remove"
        onClick={() => alert(`Remove permission: ${row.permissionName}`)}
        className="bg-red-600 text-white px-2 py-1 rounded"
      />
    </div>
  );

  const tableColumns = columns.map(col =>
    col.key === 'actions'
      ? { ...col, render: renderActions }
      : col
  );

  return (
    <div className="min-h-screen bg-[#ecebeb] p-6 space-y-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-[#a01217]">Permissions</h1>
        <Button label="Add Permission" onClick={() => alert('Add Permission')} />
      </div>

      <DynamicTable
        data={permissions}
        columns={tableColumns}
        onSelectedRowsChange={setSelectedIds}
      />

      {selectedIds.length > 0 && (
        <div className="flex justify-end">
          <Button
            label={`Remove (${selectedIds.length})`}
            className="bg-red-600 text-white"
            onClick={() => alert(`Remove permissions: ${selectedIds.join(', ')}`)}
          />
        </div>
      )}
    </div>
  );
}
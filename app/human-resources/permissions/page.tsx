'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import DynamicTable from '@/components/DynamicTable';
import DynamicFormModal, {Field} from '@/components/DynamicFormModal';

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
];

interface Permission {
  id: string;
  permissionName: string;
  description: string;
  roles: string;
}


export default function PermissionsPage() {
  const [permissions] = useState(dummyPermissions);
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

  const addArray = ['Permission Name', 'Description', 'Role name',];



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
        <Button label="Add Permission" onClick={() => handleOpenModal(addArray,"Add Permission")} />
      </div>

      <DynamicTable
        data={permissions}
        columns={tableColumns}
        onSelectedRowsChange={setSelectedIds}
      />
      <DynamicFormModal
        title={modalTitle}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        fields={fields}
        onSubmit={() => alert('info submitted')}
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
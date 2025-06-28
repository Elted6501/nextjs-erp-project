'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import DynamicTable from '@/components/DynamicTable';
import DynamicFormModal, { Field } from '@/components/DynamicFormModal';

interface Role {
  role_id: string;
  role_name: string;
  description: string;
  // permissions?: string; // Si la agregas después en la base de datos
}

const columnConfig = [
  { key: 'select', label: '', type: 'checkbox' },
  { key: 'role_name', label: 'Role Name', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
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

  const addArray = ['Role name', 'Description'];

  



  useEffect(() => {
    fetch('/api/human-resources/roles')
      .then(res => res.json())
      .then(data => {
        console.log("Roles recibidos:", data);
        setRoles(data);
      });
  }, []);

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  const renderActions = (row: Role) => (
    <div className="flex gap-2">
      <Button
        label="Edit"
        onClick={() => alert(`Edit role: ${row.role_name}`)}
        className="bg-yellow-500 text-white px-2 py-1 rounded"
      />
      <Button
        label="Delete"
        onClick={() => alert(`Delete role: ${row.role_name}`)}
        className="bg-red-600 text-white px-2 py-1 rounded"
      />
    </div>
  );

  const tableColumns = columnConfig.map(col =>
    col.key === 'actions'
      ? { ...col, render: renderActions }
      : col
  );

  return (
    <div className="min-h-screen bg-[#ecebeb] p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#a01217]">Roles</h1>
        <Button label="Add Role" onClick={() => handleOpenModal(addArray, "Add Role")} />
      </div>

      <DynamicTable
        data={roles.map(role => ({ ...role, id: role.role_id }))}
        columns={tableColumns}
        onSelectedRowsChange={handleSelectionChange}
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
            label={`Delete (${selectedIds.length})`}
            className="bg-black hover:opacity-80 text-white"
            onClick={() => alert(`Delete roles: ${selectedIds.join(', ')}`)}
          />
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import DynamicTable from '@/components/DynamicTable';
import DynamicFormModal, { Field } from '@/components/DynamicFormModal';
import AlertDialog from '@/components/AlertDialog';
import { PermissionsGate } from '@/app/components/PermissionsGate';

interface Role {
  role_id: string;
  role_name: string;
  description: string;
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
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertIds, setAlertIds] = useState<string[]>([]);

  const fields: Field[] = fieldsData.map((item) => ({
    name: item.toLowerCase(),
    label: item,
    type: 'text',
  }));

  const addArray = ['Role name', 'Description'];

  useEffect(() => {
    fetch('/api/human-resources/roles')
      .then(res => res.json())
      .then(data => {
        setRoles(data);
      });
  }, []);

  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  // Abrir modal para agregar o editar
  const handleOpenModal = (fieldArray: string[], title: string, role?: Role) => {
    setFieldsData(fieldArray);
    setModalTitle(title);
    setShowModal(true);
    setEditingRole(role || null);

  };

  // Agregar o actualizar rol
  const handleAddOrUpdateRole = async (formData: { [key: string]: any }) => {
    const { 'role name': role_name, description } = formData;

    if (editingRole) {
      // UPDATE
      const res = await fetch(`/api/human-resources/roles/${editingRole.role_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_name, description }),
      });
      if (!res.ok) {
        alert('Error updating role');
        return;
      }
      const updatedRole = await res.json();
      setRoles(prev =>
        prev.map(role =>
          role.role_id === editingRole.role_id
            ? updatedRole
            : role
        )
      );
      setEditingRole(null);
    } else {
      // ADD
      const res = await fetch('/api/human-resources/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role_name, description }),
      });
      if (!res.ok) {
        alert('Error adding role');
        return;
      }
      const result = await res.json();
      const newRole = result.data ? result.data : result;
      setRoles(prev => [...prev, newRole]);
    }
    setShowModal(false);
  };

  // Eliminar uno o varios roles
  const handleDelete = async (ids: string[]) => {
    const res = await fetch('/api/human-resources/roles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) {
      alert('Error deleting roles');
      return;
    }
    setRoles(prev => prev.filter(role => !ids.includes(role.role_id)));
    setSelectedIds([]); // <--- Esto limpia la selección después de borrar
  };

  // Renderiza acciones por fila
  const renderActions = (row: Role) => (
    <div className="flex gap-2">
      <Button
        label="Edit"
        onClick={() => handleOpenModal(addArray, 'Update Role', row)}
        className="bg-yellow-500 text-white px-2 py-1 rounded"
      />
      <Button
        label="Delete"
        onClick={() => {
          setAlertIds([row.role_id]);
          setShowAlert(true);
        }}
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
   <PermissionsGate requiredPermission="hr.manage">
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
        onClose={() => {
          setShowModal(false);
          setEditingRole(null);
        }}
        fields={fields}
        onSubmit={handleAddOrUpdateRole}
        initialData={editingRole ? { 'role name': editingRole.role_name, description: editingRole.description } : null}
      />

      {showAlert && (
        <AlertDialog
          title="Confirmar eliminación"
          content={
            (alertIds.length === 1
              ? '¿Estás seguro de eliminar este rol?'
              : `¿Estás seguro de eliminar estos ${alertIds.length} roles?`)
          }
          onCancel={() => {
            setShowAlert(false);
            setAlertIds([]);
          }}
          onSuccess={async () => {
            setShowAlert(false);
            await handleDelete(alertIds.length > 0 ? alertIds : selectedIds);
            setAlertIds([]);
          }}
          onSuccessLabel="Eliminar"
          onCancelLabel="Cancelar"
        />
      )}

      {selectedIds.length > 0 && (
        <div className="flex justify-end">
          <Button
            label={`Delete (${selectedIds.length})`}
            className="bg-black hover:opacity-80 text-white"
            onClick={() => {
              setAlertIds(selectedIds);
              setShowAlert(true);
            }}
          />
          <Button
            label={`Update (${selectedIds.length})`}
            className="bg-black hover:opacity-80 text-white mx-2"
            onClick={() => {
              if (selectedIds.length === 1) {
                const role = roles.find(r => r.role_id === selectedIds[0]);
                if (role) handleOpenModal(addArray, 'Update Role', role);
              } else {
                alert('Selecciona solo un rol para actualizar.');
              }
            }}
          />
        </div>
      )}
    </div>
   </PermissionsGate>
  );
}
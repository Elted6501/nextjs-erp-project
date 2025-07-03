'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/Button';
import DynamicTable from '@/components/DynamicTable';
import DynamicFormModal, { Field } from '@/components/DynamicFormModal';
import AlertDialog from '@/components/AlertDialog';
import { PermissionsGate } from '@/app/components/PermissionsGate';

// Role interface for table data
interface Role {
  role_id: string;
  role_name: string;
  description: string;
}

// Table column configuration
const columnConfig = [
  {
    key: 'select',
    label: '', // The header checkbox will be added below
    type: 'checkbox'
  },
  { key: 'role_name', label: 'Role Name', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
];

export default function RolesPage() {
  // State for roles list
  const [roles, setRoles] = useState<Role[]>([]);
  // State for selected row IDs (checkboxes)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  // State for fields to show in modal
  const [fieldsData, setFieldsData] = useState<string[]>([]);
  // State for modal title
  const [modalTitle, setModalTitle] = useState('');
  // State for currently editing role
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  // State for alert dialog visibility
  const [showAlert, setShowAlert] = useState(false);
  // State for IDs to delete in alert dialog
  const [alertIds, setAlertIds] = useState<string[]>([]);

  // Ref for the select-all checkbox in the table header
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Build the fields for the dynamic form modal based on the selected fields
  const fields: Field[] = fieldsData.map((item) => ({
    name: item.toLowerCase(),
    label: item,
    type: 'text',
  }));

  // Array for add/update modal fields
  const addArray = ['Role name', 'Description'];

  // Fetch roles from API on mount
  useEffect(() => {
    fetch('/api/human-resources/roles')
      .then(res => res.json())
      .then(data => {
        setRoles(data);
      });
  }, []);

  // Set indeterminate state for select-all checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedIds.length > 0 && selectedIds.length < roles.length;
    }
  }, [selectedIds, roles.length]);

  // Handle row selection change
  const handleSelectionChange = (ids: string[]) => {
    setSelectedIds(ids);
  };

  // Open modal for add or update role
  const handleOpenModal = (fieldArray: string[], title: string, role?: Role) => {
    setFieldsData(fieldArray);
    setModalTitle(title);
    setShowModal(true);
    setEditingRole(role || null);
  };

  // Handle add or update role form submission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddOrUpdateRole = async (formData: { [key: string]: any }) => {
    const { 'role name': role_name, description } = formData;

    if (editingRole) {
      // Update role
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
      // Add new role
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

  // Handle delete roles
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
    setSelectedIds([]);
  };

  // Render action buttons for each row
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

  // Add the select-all checkbox to the column config
  const tableColumns = columnConfig.map(col =>
    col.key === 'select'
      ? {
          ...col,
          label: (
            <input
              ref={selectAllRef}
              type="checkbox"
              checked={roles.length > 0 && selectedIds.length === roles.length}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedIds(roles.map(role => role.role_id));
                } else {
                  setSelectedIds([]);
                }
              }}
              className="w-5 h-5 accent-red-600"
            />
          ),
        }
      : col.key === 'actions'
      ? { ...col, render: renderActions }
      : col
  );

  return (
    <PermissionsGate requiredPermission="hr.manage">
      <div className="min-h-screen bg-[#ecebeb] p-6 space-y-6">
        {/* Header and add button */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-[#a01217]">Roles</h1>
          <Button label="Add Role" onClick={() => handleOpenModal(addArray, "Add Role")} />
        </div>

        {/* Dynamic table with roles */}
        <DynamicTable
          data={roles.map(role => ({ ...role, id: role.role_id }))}
          columns={tableColumns}
          onSelectedRowsChange={handleSelectionChange}
          selectedRowIds={selectedIds}
        />

        {/* Modal for add/update role */}
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

        {/* Alert dialog for delete confirmation */}
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

        {/* Action buttons for selected rows */}
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
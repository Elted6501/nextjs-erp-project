'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/components/Button';
import DynamicTable from '@/components/DynamicTable';
import DynamicFormModal, { Field } from '@/components/DynamicFormModal';
import AssignRoleModal from '@/components/AssignRoleModal';
import { PermissionsGate } from '@/app/components/PermissionsGate';

// Permission interface for table data
interface Permission {
  permission_id: number;
  permission_key: string;
  description: string;
  roles: string;
  role_ids: string[];
}

// Role interface for dropdown and assignment
interface Role {
  role_id: string;
  role_name: string;
}

// RolePermission interface for permissions fetched from API
interface RolePermission {
  role_id: string;
  roles: {
    role_name: string;
  };
}

// Raw permission interface as returned from API
interface RawPermission {
  permission_id: number;
  permission_key: string;
  description: string;
  role_permissions?: RolePermission[];
}

export default function PermissionsPage() {
  // State for permissions list
  const [permissions, setPermissions] = useState<Permission[]>([]);
  // State for roles list
  const [roles, setRoles] = useState<Role[]>([]);
  // State for selected row IDs (checkboxes)
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // State for modal visibility
  const [showModal, setShowModal] = useState(false);
  // State for assign role modal visibility
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  // State for modal title
  const [modalTitle, setModalTitle] = useState('');
  // State for currently editing permission
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  // Ref for the select-all checkbox in the table header
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Table column configuration, including select-all checkbox in header
  const columns = [
    {
      key: 'select',
      label: (
        <input
          ref={selectAllRef}
          type="checkbox"
          checked={permissions.length > 0 && selectedIds.length === permissions.length}
          onChange={e => {
            if (e.target.checked) {
              setSelectedIds(permissions.map(p => p.permission_id));
            } else {
              setSelectedIds([]);
            }
          }}
          className="w-5 h-5 accent-red-600"
        />
      ),
      type: 'checkbox'
    },
    { key: 'permission_key', label: 'Permission Key', type: 'text' },
    { key: 'description', label: 'Description', type: 'text' },
    { key: 'roles', label: 'Used By Roles', type: 'text' },
  ];

  // Set indeterminate state for select-all checkbox
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedIds.length > 0 && selectedIds.length < permissions.length;
    }
  }, [selectedIds, permissions.length]);

  // Fetch permissions and roles from API on mount
  useEffect(() => {
    const fetchData = async () => {
      // Fetch permissions
      const permRes = await fetch('/api/human-resources/permissions');
      const permJson = await permRes.json();
      const permData = permJson as RawPermission[];

      if (Array.isArray(permData)) {
        const permissionsWithRoles: Permission[] = permData.map((perm) => ({
          permission_id: perm.permission_id,
          permission_key: perm.permission_key,
          description: perm.description,
          roles: perm.role_permissions?.map((rp) => rp.roles.role_name).join(', ') || '',
          role_ids: perm.role_permissions?.map((rp) => rp.role_id) || [],
        }));
        setPermissions(permissionsWithRoles);
      } else {
        alert((permJson as { error?: string }).error || 'Error fetching permissions');
      }

      // Fetch roles
      const roleRes = await fetch('/api/human-resources/roles');
      const roleJson = await roleRes.json();
      const roleData = roleJson as Role[];

      if (Array.isArray(roleData)) {
        setRoles(roleData);
      } else {
        alert((roleJson as { error?: string }).error || 'Error fetching roles');
      }
    };

    fetchData();
  }, []);

  // Fields for the dynamic form modal
  const fields: Field[] = [
    { name: 'permission_key', label: 'Permission Key', type: 'text' },
    { name: 'description', label: 'Description', type: 'text' },
  ];

  // Open modal for add or update permission
  const handleOpenModal = (title: string, permission?: Permission) => {
    setModalTitle(title);
    setEditingPermission(permission || null);
    setShowModal(true);
  };

  // Handle add or update permission form submission
  const handleSubmit = async (formData: Record<string, string>) => {
    if (editingPermission) {
      // Update permission
      const res = await fetch(`/api/human-resources/permissions/${editingPermission.permission_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert('Error updating permission');
        return;
      }

      const updated: Permission = await res.json();
      setPermissions((prev) =>
        prev.map((p) =>
          p.permission_id === updated.permission_id ? { ...p, ...updated } : p
        )
      );
    } else {
      // Add new permission
      const res = await fetch('/api/human-resources/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert('Error adding permission');
        return;
      }

      const added: Permission = await res.json();
      setPermissions((prev) => [
        ...prev,
        { ...added, roles: '', role_ids: [] },
      ]);
    }

    setShowModal(false);
    setEditingPermission(null);
  };

  // Handle delete permissions
  const handleRemove = async (ids: number[]) => {
    const res = await fetch('/api/human-resources/permissions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });

    if (!res.ok) {
      alert('Error deleting permissions');
      return;
    }

    setPermissions((prev) => prev.filter((p) => !ids.includes(p.permission_id)));
    setSelectedIds([]);
  };

  // Handle save role assignment for a permission
  const handleSaveRoleAssignment = async (permissionId: number, roleIds: string[]) => {
    const res = await fetch('/api/human-resources/role-permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permission_id: permissionId, role_ids: roleIds }),
    });

    if (!res.ok) {
      alert('Error assigning roles');
      return;
    }

    // Refresh permissions after assignment
    const permRes = await fetch('/api/human-resources/permissions');
    const permJson = await permRes.json();
    const permData = permJson as RawPermission[];

    if (Array.isArray(permData)) {
      const permissionsWithRoles: Permission[] = permData.map((perm) => ({
        permission_id: perm.permission_id,
        permission_key: perm.permission_key,
        description: perm.description,
        roles: perm.role_permissions?.map((rp) => rp.roles.role_name).join(', ') || '',
        role_ids: perm.role_permissions?.map((rp) => rp.role_id) || [],
      }));
      setPermissions(permissionsWithRoles);
    }

    setShowAssignRoleModal(false);
    setEditingPermission(null);
  };

  return (
    <PermissionsGate requiredPermission="system.admin">
      <div className="min-h-screen bg-[#ecebeb] p-6 space-y-6">
        {/* Header and add button */}
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-[#a01217]">Permissions</h1>
          <Button label="Add Permission" onClick={() => handleOpenModal('Add Permission')} />
        </div>

        {/* Dynamic table with permissions */}
        <DynamicTable
          data={permissions.map((perm) => ({
            permission_id: perm.permission_id,
            permission_key: perm.permission_key,
            description: perm.description,
            roles: perm.roles,
            id: String(perm.permission_id),
          }))}
          columns={columns}
          onSelectedRowsChange={(ids) => setSelectedIds((ids as string[]).map(Number))}
          selectedRowIds={selectedIds.map(String)}
        />

        {/* Modal for add/update permission */}
        <DynamicFormModal
          title={modalTitle}
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingPermission(null);
          }}
          fields={fields}
          onSubmit={handleSubmit}
          initialData={editingPermission}
        />

        {/* Modal for assigning roles to a permission */}
        {showAssignRoleModal && editingPermission && (
          <AssignRoleModal
            isOpen={showAssignRoleModal}
            onClose={() => setShowAssignRoleModal(false)}
            onSave={(roleIds) =>
              handleSaveRoleAssignment(editingPermission.permission_id, roleIds)
            }
            roles={roles}
            assignedRoleIds={editingPermission.role_ids}
            permissionKey={editingPermission.permission_key}
          />
        )}

        {/* Action buttons for selected rows */}
        {selectedIds.length > 0 && (
          <div className="flex justify-end gap-4">
            <Button
              label={`Edit Roles (${selectedIds.length})`}
              className="bg-blue-600 text-white"
              onClick={() => {
                if (selectedIds.length > 1) {
                  alert('Please select only one permission to edit roles.');
                  return;
                }
                const selectedPermission = permissions.find(
                  (p) => p.permission_id === selectedIds[0]
                );
                if (selectedPermission) {
                  setEditingPermission(selectedPermission);
                  setShowAssignRoleModal(true);
                }
              }}
            />

            <Button
              label={`Remove (${selectedIds.length})`}
              className="bg-red-600 text-white"
              onClick={() => handleRemove(selectedIds)}
            />
          </div>
        )}
      </div>
    </PermissionsGate>
  );
}

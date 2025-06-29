'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import DynamicTable from '@/components/DynamicTable';
import DynamicFormModal, { Field } from '@/components/DynamicFormModal';
import AssignRoleModal from '@/components/AssignRoleModal';
import { PermissionsGate } from '@/app/components/PermissionsGate';

interface Permission {
  permission_id: number;
  permission_key: string;
  description: string;
  roles: string;
  role_ids: string[];
}

interface Role {
  role_id: string;
  role_name: string;
}

interface RolePermission {
  role_id: string;
  roles: {
    role_name: string;
  };
}

interface RawPermission {
  permission_id: number;
  permission_key: string;
  description: string;
  role_permissions?: RolePermission[];
}

const columns = [
  { key: 'select', label: '', type: 'checkbox' },
  { key: 'permission_key', label: 'Permission Key', type: 'text' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'roles', label: 'Used By Roles', type: 'text' },
];

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showAssignRoleModal, setShowAssignRoleModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  // Fetch permissions and roles
  useEffect(() => {
    const fetchData = async () => {
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

  const fields: Field[] = [
    { name: 'permission_key', label: 'Permission Key', type: 'text' },
    { name: 'description', label: 'Description', type: 'text' },
  ];

  const handleOpenModal = (title: string, permission?: Permission) => {
    setModalTitle(title);
    setEditingPermission(permission || null);
    setShowModal(true);
  };

  const handleSubmit = async (formData: Record<string, string>) => {
    if (editingPermission) {
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
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-[#a01217]">Permissions</h1>
          <Button label="Add Permission" onClick={() => handleOpenModal('Add Permission')} />
        </div>

        <DynamicTable
          data={permissions.map((perm) => {
            const { role_ids: _, ...rest } = perm;
            return { ...rest, id: String(perm.permission_id) };
          })}
          columns={columns}
          onSelectedRowsChange={(ids) => setSelectedIds((ids as string[]).map(Number))}
        />

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

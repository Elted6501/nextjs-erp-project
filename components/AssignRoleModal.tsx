'use client';

import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';

interface AssignRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedRoleIds: string[]) => void;
  roles: { role_id: string; role_name: string }[];
  assignedRoleIds: string[];
  permissionKey: string;
}

export default function AssignRoleModal({
  isOpen,
  onClose,
  onSave,
  roles,
  assignedRoleIds,
  permissionKey,
}: AssignRoleModalProps) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelected(assignedRoleIds);
    }
  }, [isOpen, assignedRoleIds]);

  const handleToggle = (roleId: string) => {
    setSelected(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  if (typeof window === 'undefined' || !isOpen) return null;
  const container = document.getElementById('modal-root');
  if (!container) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.3)] backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold text-[#a01217] mb-4">
          Assign Roles to &quot;{permissionKey}&quot;
        </h2>
        <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {roles.map(role => (
            <div key={role.role_id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`role-${role.role_id}`}
                checked={selected.includes(role.role_id)}
                onChange={() => handleToggle(role.role_id)}
                className="w-5 h-5"
              />
              <label htmlFor={`role-${role.role_id}`}>{role.role_name}</label>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button label="Cancel" onClick={onClose} />
          <Button label="Save" onClick={handleSave} />
        </div>
      </div>
    </div>,
    container
  );
}
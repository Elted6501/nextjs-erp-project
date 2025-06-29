import { useState, useEffect } from 'react';

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const res = await fetch('/api/auth/permissions');
        if (!res.ok) {
          throw new Error('Failed to fetch permissions');
        }
        const data = await res.json();
        setPermissions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchPermissions();
  }, []);

  const hasPermission = (permissionKey: string) => {
    return permissions.includes(permissionKey);
  };

  return { permissions, hasPermission, isLoading, error };
}
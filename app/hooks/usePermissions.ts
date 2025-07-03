import { useState, useEffect } from 'react';

// Custom hook to fetch and manage user permissions
export function usePermissions() {
  // State for the list of permissions
  const [permissions, setPermissions] = useState<string[]>([]);
  // State for loading indicator
  const [isLoading, setIsLoading] = useState(true);
  // State for error message
  const [error, setError] = useState<string | null>(null);

  // Fetch permissions from API on mount
  useEffect(() => {
    async function fetchPermissions() {
      try {
        // Request permissions from the API endpoint
        const res = await fetch('/api/auth/permissions');
        if (!res.ok) {
          throw new Error('Failed to fetch permissions');
        }
        // Parse the response as JSON and update state
        const data = await res.json();
        setPermissions(data);
      } catch (err) {
        // Handle errors and set error state
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        // Always set loading to false when done
        setIsLoading(false);
      }
    }

    fetchPermissions();
  }, []);

  // Helper function to check if a permission exists
  const hasPermission = (permissionKey: string) => {
    return permissions.includes(permissionKey);
  };

  // Return permissions, helper, loading, and error state
  return { permissions, hasPermission, isLoading, error };
}
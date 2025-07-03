'use client';

import { usePermissions } from '@/app/hooks/usePermissions';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermission: string
) {
  const WithAuthComponent = (props: P) => {
    const { hasPermission, isLoading } = usePermissions();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !hasPermission(requiredPermission) && !hasPermission('system.admin')) {
        router.push('/'); // Redirect to home page if no permission
      }
    }, [isLoading, hasPermission, router]);

    if (isLoading) {
      return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-gray-900"></div></div>;
    }

    if (!hasPermission(requiredPermission) && !hasPermission('system.admin')) {
      return null; // Render nothing while redirecting
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
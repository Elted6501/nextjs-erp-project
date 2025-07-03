'use client';
import Link from 'next/link';
import { usePermissions } from '@/app/hooks/usePermissions';
import {
  FiUser,
  FiUserCheck,
  FiKey,
  FiClock,
  FiFileText,
} from 'react-icons/fi';

// Force dynamic rendering to prevent static generation issues with Supabase
export const dynamic = 'force-dynamic';

// List of all HR submodules with their metadata and required permissions
const allSubmodules = [
   {
       name: 'Employees',
       description: 'Manage employee records and information.',
       href: '/human-resources/employees',
       icon: FiUser,
       permission: 'hr.view',
   },
   {
       name: 'Roles',
       description: 'Define and assign roles within your organization.',
       href: '/human-resources/roles',
       icon: FiUserCheck,
       permission: 'hr.manage',
   },
   {
       name: 'Permissions',
       description: 'Control access and permissions for users.',
       href: '/human-resources/permissions',
       icon: FiKey,
       permission: 'system.admin',
   },
   {
       name: 'Attendance',
       description: 'Track employee attendance and punctuality.',
       href: '/human-resources/attendance',
       icon: FiClock,
       permission: 'hr.view',
   },
   {
       name: 'Payroll',
       description: 'Manage payroll and salary information.',
       href: '/human-resources/payroll',
       icon: FiFileText,
       permission: 'hr.manage',
   },
];

export default function HumanResourcesPage() {
   // Get permission helper and loading state from custom hook
   const { hasPermission, isLoading } = usePermissions();

   // Show loading spinner while permissions are loading
   if (isLoading) {
       return (
           <div className="flex justify-center items-center h-screen bg-[#ecebeb]">
               <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-[#a01217]"></div>
           </div>
       );
   }

   // Filter submodules by user permissions (or admin)
   const submodules = allSubmodules.filter(mod => hasPermission(mod.permission) || hasPermission('system.admin'));

  // Render the HR dashboard with available submodules
  return (
    <main className="min-h-screen bg-[#ecebeb] flex flex-col items-center pt-16 px-4">
      <h1 className="text-4xl font-bold text-[#a01217] mb-10 tracking-tight text-center">
        Human Resources
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-5xl">
        {submodules.map((mod) => (
          <Link
            key={mod.name}
            href={mod.href}
            className="group bg-[#ecebeb] border border-[#a01217] rounded-xl p-6 flex flex-col items-center text-center shadow-md hover:bg-[#a01217] hover:text-white transition-all duration-200"
          >
            <div className="mb-4 text-3xl text-[#a01217] group-hover:text-white transition-colors">
              <mod.icon />
            </div>
            <div className="text-xl font-semibold mb-2">{mod.name}</div>
            <div className="text-gray-600 group-hover:text-white text-sm transition-colors">{mod.description}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
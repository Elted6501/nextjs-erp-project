'use client';
import Link from 'next/link';
import {
  FiUser,
  FiUserCheck,
  FiKey,
  FiClock,
  FiFileText,
} from 'react-icons/fi';

const submodules = [
  {
    name: 'Employees',
    description: 'Manage employee records and information.',
    href: '/human-resources/employees',
    icon: FiUser,
  },
  {
    name: 'Roles',
    description: 'Define and assign roles within your organization.',
    href: '/human-resources/roles',
    icon: FiUserCheck,
  },
  {
    name: 'Permissions',
    description: 'Control access and permissions for users.',
    href: '/human-resources/permissions',
    icon: FiKey,
  },
  {
    name: 'Attendance',
    description: 'Track employee attendance and punctuality.',
    href: '/human-resources/attendance',
    icon: FiClock,
  },
  {
    name: 'Payroll',
    description: 'Manage payroll and salary information.',
    href: '/human-resources/payroll',
    icon: FiFileText,
  },
];

export default function HumanResourcesPage() {
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
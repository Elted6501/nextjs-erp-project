'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ClockButton from '@/app/human-resources/attendance/ClockButton';
import { useEffect, useState } from 'react';


export default function Navbar() {
  const pathname = usePathname();
  const paths = pathname.split('/').filter((segment) => segment);

  const [employeeId, setEmployeeId] = useState<string | null>(null);

useEffect(() => {
  fetch('/api/attendance')
    .then(res => res.ok ? res.json() : null)
    .then(data => {
      console.log('API /api/attendance response:', data);
      if (data && data.employee_id) {
        setEmployeeId(String(data.employee_id));
      } else {
        setEmployeeId(null);
      }
    })
    .catch(() => setEmployeeId(null));
}, []);

  return (
    <nav className="w-full px-6 py-5 bg-black shadow flex items-center justify-between">
      <div className="flex items-center space-x-2 text-lg text-white">
        <Link href="/" className="font-semibold hover:underline text-white">
          Home
        </Link>
        {paths.map((segment, index) => {
          const href = '/' + paths.slice(0, index + 1).join('/');
          const label = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <span key={index} className="flex items-center space-x-2">
              <span className="text-gray-300 mx-1">{'>'}</span>
              {index === paths.length - 1 ? (
                <span className="text-gray-300 mx-1">{label}</span>
              ) : (
                <Link href={href} className="hover:underline text-white">
                  {label}
                </Link>
              )}
            </span>
          );
        })}
      </div>
      <div>
        {employeeId && <ClockButton employeeId={employeeId} />}
      </div>
    </nav>
  );
}
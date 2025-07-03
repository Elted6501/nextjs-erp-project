'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const paths = pathname.split('/').filter((segment) => segment);


  const handleLogout = () => {
    // Limpia el token/cookie aquí si es necesario
    // Por ejemplo: localStorage.removeItem('token');
    // O haz un fetch a tu endpoint de logout si tienes uno
    router.push('/login');
  };

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
      <div className="flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="font-semibold hover:underline text-white bg-transparent border-none p-0 m-0 cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
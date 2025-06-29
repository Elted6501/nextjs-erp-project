'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePermissions } from '@/app/hooks/usePermissions';
import {
  FiBox,
  FiDollarSign,
  FiUsers,
  FiShoppingCart,
  FiTool,
  FiMenu,
  FiUser,
  FiKey,
  FiClock,
  FiFileText,
  FiUserCheck,
} from 'react-icons/fi';
import { FaHandHoldingUsd } from "react-icons/fa";
import { FaFileInvoiceDollar,FaClipboardCheck } from "react-icons/fa6";
import { BsHouse } from 'react-icons/bs';
import Image from 'next/image';
import styles from '../styles/Sidebar.module.css';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const { hasPermission, isLoading } = usePermissions();

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleSubmenu = (name: string) => {
    setOpenModule(openModule === name ? null : name);
  };

  const allModules = [
    { name: 'Home', icon: <BsHouse />, href: '/', permission: 'system.view' },
    { name: 'Inventory', icon: <FiBox />, href: '/inventory', permission: 'inventory.view' },
    {
      name: 'Finance',
      icon: <FiDollarSign />,
      permission: 'finance.view',
      submodules: [
        { name: 'Orders', href: '/finance/orders', icon: <FaClipboardCheck />, permission: 'finance.view' },
        { name: 'Invoices', href: '/finance/invoices', icon: <FaFileInvoiceDollar />, permission: 'finance.view' },
        { name: 'Pending to pay', href: '/finance/pending-to-pay', icon: <FaHandHoldingUsd />, permission: 'finance.view' },
      ],
    },
    { name: 'Sales', icon: <FiShoppingCart />, href: '/sales', permission: 'sales.view' },
    {
      name: 'Human Resources',
      icon: <FiUsers />,
      permission: 'hr.view',
      submodules: [
        { name: 'Employees', href: '/human-resources/employees', icon: <FiUser />, permission: 'hr.view' },
        { name: 'Roles', href: '/human-resources/roles', icon: <FiUserCheck />, permission: 'hr.manage' },
        { name: 'Permissions', href: '/human-resources/permissions', icon: <FiKey />, permission: 'system.admin' },
        { name: 'Attendance', href: '/human-resources/attendance', icon: <FiClock />, permission: 'hr.view' },
        { name: 'Payroll', href: '/human-resources/payroll', icon: <FiFileText />, permission: 'hr.manage' },
      ],
    },
    { name: 'Maintenance', icon: <FiTool />, href: '/maintenance', permission: 'maintenance.view' },
  ];

  if (isLoading) {
    return (
       <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
           <div className="flex justify-center items-center h-full">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white" />
           </div>
       </aside>
    );
  }

  const modules = allModules.filter(mod => hasPermission(mod.permission) || mod.name === 'Home' || hasPermission('system.admin'))
   .map(mod => {
       if (mod.submodules) {
           return {
               ...mod,
               submodules: mod.submodules.filter(sub => hasPermission(sub.permission) || hasPermission('system.admin'))
           };
       }
       return mod;
   })
   .filter(mod => !mod.submodules || mod.submodules.length > 0);

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      style={{ fontFamily: "'Orbitron', sans-serif" }}
    >
      <div
        className={styles.top}
        style={{
          justifyContent: isCollapsed ? 'center' : 'space-around',
        }}
      >
        <button
          onClick={toggleSidebar}
          className={styles.menuButton}
          style={{ alignSelf: isCollapsed ? 'center' : '200px' }}
        >
          <FiMenu />
        </button>

        <Link href="/">
          <Image
            src="/NitroDriveLogo4kpng.png"
            alt="NitroDrive Logo"
            width={isCollapsed ? 0 : 4096}
            height={1224}
            className={styles.logo}
          />
        </Link>
      </div>

      <nav className={styles.nav}>
        {modules.map((mod) => {
          const isExpandable = !!mod.submodules;
          const isOpen = openModule === mod.name;

          return (
            <div key={mod.name}>
              {isExpandable ? (
                <div
                  onClick={() => toggleSubmenu(mod.name)}
                  className={`${styles.navItem} ${isOpen ? styles.activeNavItem : ''}`}
                  style={{
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    cursor: 'pointer',
                    background: isOpen ? '#222' : undefined,
                    color: isOpen ? '#dc2626' : undefined,
                  }}
                >
                  <span className={styles.icon}>{mod.icon}</span>
                  {!isCollapsed && (
                    <>
                      <span>{mod.name}</span>
                      <span
                        style={{
                          display: 'inline-block',
                          marginLeft: 8,
                          transition: 'transform 0.2s',
                          transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        }}
                      >
                        ▼
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  href={mod.href!}
                  className={styles.navItem}
                  style={{
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                  }}
                >
                  <span className={styles.icon}>{mod.icon}</span>
                  {!isCollapsed && <span>{mod.name}</span>}
                </Link>
              )}

              {/* Submodules desplegables */}
              {isExpandable && isOpen && !isCollapsed && (
                <div className={styles.subNavList}>
                  {mod.submodules!.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={styles.subNavItem}
                    >
                      <span className={styles.subNavIcon}>{sub.icon}</span>
                      <span>{sub.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

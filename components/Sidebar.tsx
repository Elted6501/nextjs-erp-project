'use client';
import Link from 'next/link';
import { useState } from 'react';
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

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);
  const toggleSubmenu = (name: string) => {
    setOpenModule(openModule === name ? null : name);
  };

  const modules = [
    { name: 'Home', icon: <BsHouse />, href: '/' },
    { name: 'Inventory', icon: <FiBox />, href: '/inventory' },
    { name: 'Finance',
      icon: <FiDollarSign />, 
      submodules: [
        { name: 'Orders', href: '/finance/orders', icon: <FaClipboardCheck /> },
        { name: 'Invoices', href: '/finance/invoices', icon: <FaFileInvoiceDollar /> },
        { name: 'Pending to pay', href: '/finance/pending-to-pay', icon: <FaHandHoldingUsd /> },
      ],
    },
    { name: 'Sales', icon: <FiShoppingCart />, href: '/sales' },
    {
      name: 'Human Resources',
      icon: <FiUsers />,
      submodules: [
        { name: 'Employees', href: '/human-resources/employees', icon: <FiUser /> },
        { name: 'Roles', href: '/human-resources/roles', icon: <FiUserCheck /> },
        { name: 'Permissions', href: '/human-resources/permissions', icon: <FiKey /> },
        { name: 'Attendance', href: '/human-resources/attendance', icon: <FiClock /> },
        { name: 'Payroll', href: '/human-resources/payroll', icon: <FiFileText /> },
      ],
    },
    { name: 'Maintenance', icon: <FiTool />, href: '/maintenance' },
  ];

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

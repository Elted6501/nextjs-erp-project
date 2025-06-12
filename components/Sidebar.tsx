'use client';
import Link from 'next/link';
import { useState } from 'react';
import { FiBox, FiDollarSign, FiUsers, FiShoppingCart, FiTool, FiMenu } from 'react-icons/fi';
import { BsHouse } from 'react-icons/bs';
import Image from 'next/image';
import styles from '../styles/Sidebar.module.css';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const modules = [
    { name: 'Home', icon: <BsHouse />, href: '/' },
    { name: 'Inventory', icon: <FiBox />, href: '/inventory' },
    { name: 'Finance', icon: <FiDollarSign />, href: '/finance' },
    { name: 'Sales', icon: <FiShoppingCart />, href: '/sales' },
    { name: 'Human Resources', icon: <FiUsers />, href: '/human-resources' },
    { name: 'Maintenance', icon: <FiTool />, href: '/maintenance' },
  ];

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.top} style={{ justifyContent: isCollapsed ? 'center' : 'space-around' }}>
        <button onClick={toggleSidebar} className={styles.menuButton} style={{ alignSelf: isCollapsed ? 'center' : '200px' }}>
          <FiMenu />
        </button>

        <Link href="/">
          <Image
            src="/NitroDriveLogo.jpg"
            alt="NitroDrive Logo"
            width={isCollapsed ? 0 : 150}
            height={40}
            className={styles.logo}
          />
        </Link>
      </div>

      <nav className={styles.nav}>
        {modules.map((mod) => (
          <Link key={mod.name} href={mod.href} className={styles.navItem} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
            <span className={styles.icon}>{mod.icon}</span>
            {!isCollapsed && <span>{mod.name}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

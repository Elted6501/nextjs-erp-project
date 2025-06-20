'use client';

import React from 'react';
import styles from '../styles/Button.module.css';

interface ButtonProps {
  label: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export default function Button({ label, onClick, className = '' }: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${styles.button} ${className}`}
    >
      {label}
    </button>
  );
}

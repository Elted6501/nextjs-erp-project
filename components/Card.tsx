'use client';

import Button from './Button';
import { ReactNode } from 'react';

interface CardProps {
  label: string;
  icon?: ReactNode;
  buttonLabel: string | ReactNode;
  onButtonClick?: () => void;
  className?: string;
}

export default function Card({ label, icon, buttonLabel, onButtonClick, className = '' }: CardProps) {
  return (
    <div
      className={`flex flex-col p-6 w-full  transition cursor-pointer text-[#a01217] bg-[#a0121722] rounded-xl  ${className}`}
    >
      <div className='flex flex-row gap-6 items-center mb-4'>
      {icon && <div className="mb-4">{icon}</div>}
      <h2 className="text-xl font-popins font-bold mb-4">{label}</h2>
      </div>
      <Button
        label={buttonLabel}
        onClick={onButtonClick}
        className="bg-white text-[#a01217] px-4 py-2 rounded hover:bg-gray-100 transition self-end"
      />
    </div>
  );
}

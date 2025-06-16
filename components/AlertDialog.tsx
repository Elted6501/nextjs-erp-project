'use client';

import { useEffect, ReactNode, useRef } from 'react';
import ReactDOM from 'react-dom';
import Button from './Button';

interface AlertDialogProps {
  title?: string;
  icon?: ReactNode;
  content: string;
  onCancel?: () => void;
  onCancelLabel?: string;
  onNeutral?: () => void;
  onNeutralLabel?: string;
  onSuccess?: () => void;
  onSuccessLabel?: string;
}

export default function AlertDialog(props: AlertDialogProps) {
  const {
    title,
    icon,
    content,
    onCancel,
    onCancelLabel = 'Cancelar',
    onNeutral,
    onNeutralLabel,
    onSuccess,
    onSuccessLabel = 'Aceptar',
  } = props;

  const modalRef = useRef<HTMLDivElement>(null);

  // Bloquea scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onCancel) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Cerrar por clic fuera
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onCancel?.();
    }
  };

  // Portal target
  if (typeof window === 'undefined') return null;
  const container = document.getElementById('modal-root');
  if (!container) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.3)] backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()} // Evita que clics internos cierren el modal
      >
        {icon && <div className="flex justify-center text-[#a01217] mb-4">{icon}</div>}
        {title && (
          <h2 className="flex justify-center uppercase text-lg font-bold mb-4 text-[#a01217]">{title}</h2>
        )}
        <p className="mb-6">{content}</p>
        <div className="flex justify-end gap-2">
          {onCancel && <Button label={onCancelLabel} onClick={onCancel} />}
          {onNeutral && <Button label={onNeutralLabel!} onClick={onNeutral} />}
          {onSuccess && <Button label={onSuccessLabel} onClick={onSuccess} />}
        </div>
      </div>
    </div>,
    container
  );
}

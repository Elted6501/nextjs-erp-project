'use client';

import { useEffect } from 'react';
import ReactDOM from 'react-dom';
import Button from "./Button";

interface AlertDialogProps {
  title?: string;
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
    content,
    onCancel,
    onCancelLabel = 'Cancelar',
    onNeutral,
    onNeutralLabel,
    onSuccess,
    onSuccessLabel = 'Aceptar'
  } = props;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.3)] backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        <p className="mb-6">{content}</p>
        <div className="flex justify-end gap-2">
          {onCancel && <Button label={onCancelLabel} onClick={onCancel} />}
          {onNeutral && <Button label={onNeutralLabel!} onClick={onNeutral} />}
          {onSuccess && <Button label={onSuccessLabel} onClick={onSuccess} />}
        </div>
      </div>
    </div>
  );

  if (typeof window === 'undefined') return null;
  const container = document.getElementById('modal-root');
  return container ? ReactDOM.createPortal(modal, container) : null;
}
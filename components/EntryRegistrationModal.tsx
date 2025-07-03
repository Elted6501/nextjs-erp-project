'use client';

import { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

interface EntryRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (products: Array<{ id: number; quantity: number }>) => Promise<void>;
  products: Array<{ id: number; name: string }>;
  title?: string;
  submitLabel?: string;
}

export default function EntryRegistrationModal({ 
  isOpen, 
  onClose, 
  onSave, 
  products,
  title = "Registrar Entrada de Inventario",
  submitLabel = "Registrar Entrada"
}: EntryRegistrationModalProps) {
  const [selectedProducts, setSelectedProducts] = useState<Array<{ id: number; quantity: number; name: string }>>([]);
  const [currentProduct, setCurrentProduct] = useState<number | ''>('');
  const [currentQuantity, setCurrentQuantity] = useState<number | ''>('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Cerrar por clic fuera
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const handleAddProduct = () => {
    if (!currentProduct || !currentQuantity) return;
    
    const product = products.find(p => p.id === Number(currentProduct));
    if (!product) return;

    setSelectedProducts(prev => [
      ...prev,
      { 
        id: Number(currentProduct), 
        quantity: Number(currentQuantity),
        name: product.name
      }
    ]);
    setCurrentProduct('');
    setCurrentQuantity('');
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedProducts.length === 0) {
      alert('Por favor agrega al menos un producto');
      return;
    }

    try {
      await onSave(selectedProducts.map(({ id, quantity }) => ({ id, quantity })));
      setSelectedProducts([]);
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  // Portal root
  if (typeof window === 'undefined') return null;
  const container = document.getElementById('modal-root');
  if (!isOpen || !container) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.3)] backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-[#a01217] mb-4">{title}</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <select
              value={currentProduct}
              onChange={(e) => setCurrentProduct(Number(e.target.value))}
              className="flex-1 border rounded px-3 py-2"
            >
              <option value="">Seleccionar producto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            
            <input
              type="number"
              value={currentQuantity}
              onChange={(e) => setCurrentQuantity(Number(e.target.value))}
              min="1"
              className="w-24 border rounded px-3 py-2"
              placeholder="Cantidad"
            />
            
            <button
              type="button"
              onClick={handleAddProduct}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Agregar
            </button>
          </div>

          {selectedProducts.length > 0 && (
            <div className="border rounded">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="text-left p-2">Producto</th>
                    <th className="text-right p-2">Cantidad</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2 text-right">{item.quantity}</td>
                      <td className="p-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-[#a01217] text-white px-4 py-2 rounded hover:bg-[#8a1015]"
              disabled={selectedProducts.length === 0}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>,
    container
  );
}
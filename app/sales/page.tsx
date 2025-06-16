'use client';

import { useState, useEffect, useRef } from 'react';
import Button from '@/components/Button';
import styles from './sales.module.css';
import { Trash } from 'lucide-react';

const PRODUCTS_DB = [
  { id: 'P001', name: 'Lights', description: 'LED Front Lights', price: 450 },
  { id: 'P002', name: 'Mouse', description: 'Wireless ergonomic mouse', price: 50 },
  { id: 'P003', name: 'Keyboard', description: 'Mechanical keyboard', price: 120 },
];

export default function SalesPage() {
  const [rows, setRows] = useState([
    { id: 'P001', name: 'Lights', description: 'LED Front Lights', quantity: 2, price: 900, date: new Date('2025-06-13') },
    { id: 'P002', name: 'Mouse', description: 'Wireless ergonomic mouse', quantity: 1, price: 50, date: new Date('2025-06-12') },
    { id: 'P003', name: 'Keyboard', description: 'Mechanical keyboard', quantity: 3, price: 360, date: new Date('2025-06-13') },
  ]);

  const [inputId, setInputId] = useState('');
  const [inputQty, setInputQty] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'normal' | 'salesDay' | 'salesMonth'>('normal');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [menuOpen]);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const handleAddProduct = () => {
    const product = PRODUCTS_DB.find((p) => p.id === inputId.trim().toUpperCase());
    const qty = parseInt(inputQty);

    if (product && qty > 0) {
      const newRow = {
        id: product.id,
        name: product.name,
        description: product.description,
        quantity: qty,
        price: product.price * qty,
        date: new Date(),
      };
      setRows((prev) => [...prev, newRow]);
      setInputId('');
      setInputQty('');
    } else {
      setShowModal(true);
    }
  };

  const handleDelete = (indexToDelete: number) => {
    setRows((prevRows) => prevRows.filter((_, index) => index !== indexToDelete));
  };

  const filteredRows =
    viewMode === 'salesDay'
      ? rows.filter((row) => row.date.toISOString().split('T')[0] === todayStr)
      : viewMode === 'salesMonth'
        ? rows.filter((row) => row.date.getMonth() === currentMonth && row.date.getFullYear() === currentYear)
        : rows;

  const totalQuantity = filteredRows.reduce((sum, row) => sum + row.quantity, 0);
  const totalPrice = filteredRows.reduce((sum, row) => sum + row.price, 0);

  return (
    <div className="flex relative min-h-screen">
      {/* Employee Button */}
      <div className="absolute top-4 left-4 z-20">
        <div className="relative">
          <button className="bg-red-800 text-white px-4 py-2 rounded-md cursor-text">
            Employee 1
          </button>
        </div>
      </div>

      <div className={`flex flex-col flex-1 ${styles.contentBackground}`}>
        <div className="max-w-4xl mx-auto mt-12 px-4">
          <div className="flex justify-between items-center mb-4 min-h-[3rem]">
            <div className="flex gap-4 items-center">
              {viewMode === 'normal' ? (
                <h1 className="font-bold text-xl font-serif text-gray-800">
                  Add your product ID
                </h1>
              ) : (
                <button
                  onClick={() => setViewMode('normal')}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition cursor-pointer"
                >
                  ← Back to sales
                </button>
              )}
            </div>

            {/* OPTIONS with ref */}
            <div ref={menuRef} className="relative flex gap-2">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900 transition cursor-pointer"
              >
                Options ▾
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-[10rem] bg-white rounded-md shadow-lg z-10 px-2 py-1">
                  <ul className="text-sm text-gray-700">
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => {
                        setViewMode('salesDay');
                        setMenuOpen(false);
                      }}
                    >
                      Sales of the day
                    </li>
                    <li
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => {
                        setViewMode('salesMonth');
                        setMenuOpen(false);
                      }}
                    >
                      Sales of the month
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {viewMode === 'normal' && (
  <div className="flex gap-4 mb-4 items-end">
    <div>
      <label className="block text-sm font-medium text-gray-700 hover:text-red-800 transition">ID</label>
      <input
        type="text"
        value={inputId}
        onChange={(e) => setInputId(e.target.value)}
        placeholder="Product ID"
        className="border rounded px-2 py-1 w-40 focus:outline-none focus:ring-.8 focus:ring-red-500 focus:border-red-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 hover:text-red-800 transition">Quantity</label>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputQty}
        onChange={(e) => setInputQty(e.target.value)}
        placeholder="Qty"
        className="border rounded px-2 py-1 w-28 appearance-none focus:outline-none focus:ring-.8 focus:ring-red-500 focus:border-red-500"
      />
    </div>
    <div className="pt-6">
      <Button label="Enter" className="cursor-pointer" onClick={handleAddProduct} />
    </div>
  </div>
)}


          <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
            <thead className="bg-red-800 text-white text-sm font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Descriptions</th>
                <th className="px-6 py-3 text-right">Quantity</th>
                <th className="px-6 py-3 text-right">Price</th>
                {viewMode === 'normal' && <th className="px-6 py-3 text-center">Actions</th>}
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {filteredRows.map((row, index) => (
                <tr key={index} className="border-t">
                  <td className="px-6 py-4">{row.id}</td>
                  <td className="px-6 py-4">{row.date.toISOString().split('T')[0]}</td>
                  <td className="px-6 py-4 max-w-[8rem] break-words whitespace-pre-wrap">{row.name}</td>
                  <td className="px-6 py-4 max-w-[15rem] break-words whitespace-pre-wrap">{row.description}</td>
                  <td className="px-6 py-4 text-right">{row.quantity}</td>
                  <td className="px-6 py-4 text-right">${row.price.toFixed(2)}</td>
                  {viewMode === 'normal' && (
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-600 hover:text-red-800 transition cursor-pointer"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-bold text-gray-900 text-sm border-t">
              <tr>
                <td className="px-6 py-4" colSpan={3}>Totals</td>
                <td></td>
                <td className="px-6 py-4 text-right">{totalQuantity}</td>
                <td className="px-6 py-4 text-right">${totalPrice.toFixed(2)}</td>
                {viewMode === 'normal' && <td className="px-6 py-4"></td>}
              </tr>
            </tfoot>
          </table>

          {viewMode === 'normal' && (
            <div className="mt-4 flex flex-wrap gap-4">
              <Button label="Create sale" className="cursor-pointer" />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-bold text-red-700 mb-2">Warning</h2>
            <p className="text-gray-700 mb-4">Invalid product ID or quantity. Please check your input.</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

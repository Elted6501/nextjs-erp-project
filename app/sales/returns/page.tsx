'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import styles from "@/app/sales/sales.module.css";

const PRODUCTS_DB = [
  { id: 'P001', name: 'Lights', description: 'LED Front Lights', price: 450 },
  { id: 'P002', name: 'Mouse', description: 'Wireless ergonomic mouse', price: 50 },
  { id: 'P003', name: 'Keyboard', description: 'Mechanical keyboard', price: 120 },
];

export default function ReturnsPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [inputId, setInputId] = useState('');
  const [inputQty, setInputQty] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleAddReturn = async () => {
    const product = PRODUCTS_DB.find((p) => p.id === inputId.trim().toUpperCase());
    const qty = parseInt(inputQty);

    if (product && qty > 0) {
      const returnRow = {
        id: product.id,
        name: product.name + ' (Return)',
        description: product.description,
        quantity: -qty,
        price: -product.price * qty,
        date: new Date(),
      };

      setRows((prev) => [...prev, returnRow]);
      setInputId('');
      setInputQty('');

      try {
        await fetch('/api/returns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(returnRow),
        });
        console.log('Return saved.');
      } catch (error) {
        console.error('Error saving return:', error);
      }
    } else {
      setShowModal(true);
    }
  };

  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
  const totalPrice = rows.reduce((sum, row) => sum + row.price, 0);

  return (
    <div className="flex flex-col min-h-screen relative">
      <div className={`flex flex-col flex-1 ${styles.contentBackground}`}>
        <div className="max-w-4xl mx-auto mt-12 px-4">
          <div className="flex justify-between items-center mb-4 min-h-[3rem]">
            <h1 className="font-bold text-xl font-serif text-gray-800">Register a Return</h1>
          </div>

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
              <Button label="Register return" className="cursor-pointer" onClick={handleAddReturn} />
            </div>
          </div>

          <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
            <thead className="bg-red-800 text-white text-sm font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Descriptions</th>
                <th className="px-6 py-3 text-right">Quantity</th>
                <th className="px-6 py-3 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {rows.map((row, index) => (
                <tr key={index} className={`border-t ${row.quantity < 0 ? 'bg-red-50' : ''}`}>
                  <td className="px-6 py-4">{row.id}</td>
                  <td className="px-6 py-4">{row.date.toISOString().split('T')[0]}</td>
                  <td className="px-6 py-4">{row.name}</td>
                  <td className="px-6 py-4">{row.description}</td>
                  <td className="px-6 py-4 text-right">{row.quantity}</td>
                  <td className="px-6 py-4 text-right">${row.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-bold text-gray-900 text-sm border-t">
              <tr>
                <td className="px-6 py-4" colSpan={4}>Totals</td>
                <td className="px-6 py-4 text-right">{totalQuantity}</td>
                <td className="px-6 py-4 text-right">${totalPrice.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
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

'use client';

import { useState } from 'react';
import Button from '@/components/Button';
import styles from './sales.module.css';

const PRODUCTS_DB = [
  { id: 'P001', name: 'Lights', description: 'LED Front Lights', price: 450 },
  { id: 'P002', name: 'Mouse', description: 'Wireless ergonomic mouse', price: 50 },
  { id: 'P003', name: 'Keyboard', description: 'Mechanical keyboard', price: 120 },
];

export default function SalesPage() {
  const [rows, setRows] = useState([
    { id: 'P001', name: 'Lights', description: 'LED Front Lights', quantity: 2, price: 900 },
    { id: 'P002', name: 'Mouse', description: 'Wireless ergonomic mouse', quantity: 1, price: 50 },
    { id: 'P003', name: 'Keyboard', description: 'Mechanical keyboard', quantity: 3, price: 360 },
  ]);

  const [inputId, setInputId] = useState('');
  const [inputQty, setInputQty] = useState('');
  const [showModal, setShowModal] = useState(false); // modal control

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
      };
      setRows((prev) => [...prev, newRow]);
      setInputId('');
      setInputQty('');
    } else {
      setShowModal(true); // show modal instead of alert
    }
  };

  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
  const totalPrice = rows.reduce((sum, row) => sum + row.price, 0);

  return (
    <div className="flex">
      <div className={`flex flex-col flex-1 ${styles.contentBackground}`}>
        <div className="max-w-4xl mx-auto mt-12 px-4">

          <h1 className="font-bold text-xl font-serif text-gray-800 mb-2">
            Add your product ID
          </h1>

          <div className="flex gap-4 mb-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID</label>
              <input
                type="text"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="Product ID"
                className="border rounded px-2 py-1 w-40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={inputQty}
                onChange={(e) => setInputQty(e.target.value)}
                placeholder="Qty"
                className="border rounded px-2 py-1 w-28 appearance-none"
              />
            </div>
            <div className="pt-6">
              <Button label="Enter" className="cursor-pointer" onClick={handleAddProduct} />
            </div>
          </div>

          <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
            <thead className="bg-red-800 text-white text-sm font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">ID</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Descriptions</th>
                <th className="px-6 py-3 text-right">Quantity</th>
                <th className="px-6 py-3 text-right">Price</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {rows.map((row, index) => (
                <tr key={index} className="border-t">
                  <td className="px-6 py-4">{row.id}</td>
                  <td className="px-6 py-4">{row.name}</td>
                  <td className="px-6 py-4">{row.description}</td>
                  <td className="px-6 py-4 text-right">{row.quantity}</td>
                  <td className="px-6 py-4 text-right">${row.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold text-gray-900 text-sm border-t">
              <tr>
                <td className="px-6 py-4" colSpan={3}>Totals</td>
                <td className="px-6 py-4 text-right">{totalQuantity}</td>
                <td className="px-6 py-4 text-right">${totalPrice.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-4 flex flex-wrap gap-4">
            <Button label="Create sale" className="cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Modal de advertencia */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-bold text-red-700 mb-2">Warning</h2>
            <p className="text-gray-700 mb-4">Invalid product ID or quantity. Please check your input.</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

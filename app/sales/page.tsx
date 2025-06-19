'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import styles from './sales.module.css';
import { Trash } from 'lucide-react';

// Función para obtener la fecha actual en formato YYYY-MM-DD
const getCurrentDate = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

interface Product {
  product_id: number;
  name: string;
  description: string;
  sku: string;
  sale_price: number;
  brand: string;
  active: boolean;
}

interface CartItem {
  id: string;
  product_id: number;
  date: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function SalesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<CartItem[]>([]);
  const [inputId, setInputId] = useState('');
  const [inputQty, setInputQty] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar productos desde la base de datos
  useEffect(() => {
    fetch('/api/inventory/products')
      .then(res => res.json())
      .then((data: Product[]) => {
        // Filtrar solo productos activos
        const activeProducts = data.filter(product => product.active);
        setProducts(activeProducts);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading products:', error);
        setModalMessage('Error loading products from database');
        setShowModal(true);
        setLoading(false);
      });
  }, []);

  const handleAddProduct = () => {
    // Buscar por SKU o ID del producto
    const searchValue = inputId.trim().toUpperCase();
    const qty = parseInt(inputQty);

    // Buscar producto por SKU o por ID
    const product = products.find(p => 
      p.sku.toUpperCase() === searchValue || 
      p.product_id.toString() === searchValue
    );

    if (!product) {
      setModalMessage('Product not found. Please check the SKU or ID.');
      setShowModal(true);
      return;
    }

    if (!qty || qty <= 0) {
      setModalMessage('Please enter a valid quantity greater than 0.');
      setShowModal(true);
      return;
    }

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = rows.findIndex(row => row.product_id === product.product_id);
    
    if (existingItemIndex >= 0) {
      // Si existe, actualizar la cantidad
      const updatedRows = [...rows];
      updatedRows[existingItemIndex].quantity += qty;
      updatedRows[existingItemIndex].totalPrice = 
        updatedRows[existingItemIndex].quantity * updatedRows[existingItemIndex].unitPrice;
      setRows(updatedRows);
    } else {
      // Si no existe, agregar nuevo item
      const newRow: CartItem = {
        id: product.sku,
        product_id: product.product_id,
        date: getCurrentDate(),
        name: product.name,
        description: product.description || '',
        quantity: qty,
        unitPrice: Number(product.sale_price),
        totalPrice: Number(product.sale_price) * qty,
      };
      setRows(prev => [...prev, newRow]);
    }

    // Limpiar inputs
    setInputId('');
    setInputQty('');
  };

  const handleDelete = (indexToDelete: number) => {
    setRows(prevRows => prevRows.filter((_, index) => index !== indexToDelete));
  };

  const handleCreateSale = async () => {
    if (rows.length === 0) {
      setModalMessage('Please add products to the cart before creating a sale.');
      setShowModal(true);
      return;
    }

    try {
      // Preparar los datos de la venta
      const saleData = {
        client_id: 1, // Por ahora hardcodeado, después vendrá de un selector de cliente
        employee_id: 1, // Por ahora hardcodeado, después vendrá de la sesión
        payment_method: 'Cash', // Por ahora hardcodeado, después vendrá de un selector
        vat: totalPrice * 0.16, // Calculando 16% de IVA 
        notes: '', 
        items: rows.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      };

      // Hacer la petición al API
      const response = await fetch('/api/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create sale');
      }

      // Mostrar mensaje de éxito
      setModalMessage(`Sale created successfully! Sale ID: ${result.sale_id} - Total: ${result.total.toFixed(2)}`);
      setShowModal(true);
      
      // Limpiar el carrito después de crear la venta
      setTimeout(() => {
        setRows([]);
      }, 2000);

    } catch (error) {
      console.error('Error creating sale:', error);
      setModalMessage(`Error creating sale: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowModal(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddProduct();
    }
  };

  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
  const totalPrice = rows.reduce((sum, row) => sum + row.totalPrice, 0);

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${styles.contentBackground}`}>
        <div className="text-gray-600">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="flex relative">
      {/* Botón de Empleado */}
      <div className="absolute top-4 left-4 z-20">
        <div className="relative">
          <button className="bg-red-800 text-white px-4 py-2 rounded-md cursor-text">
            Employee 1
          </button>
        </div>
      </div>

      <div className={`flex flex-col flex-1 ${styles.contentBackground}`}>
        <div className="max-w-4xl mx-auto mt-12 px-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="font-bold text-xl font-serif text-gray-800">
              Add product by SKU or ID
            </h1>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="bg-red-800 text-white px-4 py-2 rounded-md hover:bg-red-900 transition cursor-pointer"
              >
                Options ▾
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-[10rem] bg-white rounded-md shadow-lg z-10 px-2 py-1">
                  <ul className="text-sm text-gray-700">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded">Sales of the day</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded">Sales of the month</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 mb-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700">SKU / ID</label>
              <input
                type="text"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Product SKU or ID"
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
                onKeyPress={handleKeyPress}
                placeholder="Qty"
                className="border rounded px-2 py-1 w-28 no-spinners"
              />
            </div>
            <div className="pt-6">
              <Button label="Add" className="cursor-pointer" onClick={handleAddProduct} />
            </div>
          </div>

          {/* Lista de productos disponibles (opcional - para referencia) */}
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              View available products ({products.length})
            </summary>
            <div className="mt-2 max-h-40 overflow-y-auto bg-gray-50 rounded p-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b">
                    <th className="p-1">SKU</th>
                    <th className="p-1">Name</th>
                    <th className="p-1">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.product_id} className="border-b">
                      <td className="p-1">{product.sku}</td>
                      <td className="p-1">{product.name}</td>
                      <td className="p-1">${Number(product.sale_price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>

          <table className="min-w-full bg-white rounded-xl shadow-md overflow-hidden">
            <thead className="bg-red-800 text-white text-sm font-semibold">
              <tr>
                <th className="px-6 py-3 text-left">SKU</th>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Description</th>
                <th className="px-6 py-3 text-right">Qty</th>
                <th className="px-6 py-3 text-right">Unit Price</th>
                <th className="px-6 py-3 text-right">Total</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 text-sm">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No products in cart. Add products to start a sale.
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4">{row.id}</td>
                    <td className="px-6 py-4">{row.date}</td>
                    <td className="px-6 py-4">{row.name}</td>
                    <td className="px-6 py-4">{row.description}</td>
                    <td className="px-6 py-4 text-right">{row.quantity}</td>
                    <td className="px-6 py-4 text-right">${row.unitPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right font-semibold">${row.totalPrice.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDelete(index)}
                        className="text-red-600 hover:text-red-800 transition cursor-pointer"
                      >
                        <Trash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold text-gray-900 text-sm border-t">
              <tr>
                <td className="px-6 py-4" colSpan={4}>Totals</td>
                <td className="px-6 py-4 text-right">{totalQuantity}</td>
                <td className="px-6 py-4"></td>
                <td className="px-6 py-4 text-right text-lg">${totalPrice.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div className="mt-4 flex flex-wrap gap-4">
            <Button 
              label="Create sale" 
              className={`cursor-pointer ${rows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={rows.length > 0 ? handleCreateSale : () => {}}
            />
            <Button 
              label="Clear cart" 
              className={`cursor-pointer ${rows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={rows.length > 0 ? () => setRows([]) : () => {}}
            />
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
            <h2 className="text-lg font-bold text-red-700 mb-2">
              {modalMessage.includes('successfully') ? 'Success' : 'Warning'}
            </h2>
            <p className="text-gray-700 mb-4">{modalMessage}</p>
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
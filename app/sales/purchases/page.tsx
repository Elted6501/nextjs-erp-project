'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import styles from "@/app/sales/sales.module.css";
import { Trash, ChevronDown, User, Users, Building, X } from 'lucide-react';

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
  stock?: number;
}

interface Client {
  client_id: number;
  client_type: 'Individual' | 'Business';
  business_name?: string;
  first_name?: string;
  last_name?: string;
  tax_id: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Blocked';
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
  const [clients, setClients] = useState<Client[]>([]);
  const [rows, setRows] = useState<CartItem[]>([]);
  const [inputId, setInputId] = useState('');
  const [inputQty, setInputQty] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Estados para la selección de cliente
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);
  const [showClientSelection, setShowClientSelection] = useState(false);

  // Cargar productos desde la base de datos
  useEffect(() => {
    fetch('/api/inventory/products')
      .then(res => res.json())
      .then((data: Product[]) => {
        console.log('Products from API:', data);
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

  // Cargar clientes cuando se muestra la selección
  const loadClients = async (search: string = '') => {
    setLoadingClients(true);
    try {
      const params = new URLSearchParams({
        limit: '50', // Límite para el dropdown
        status: 'Active', // Solo clientes activos
        ...(search && { search })
      });

      const response = await fetch(`/api/sales/clients?${params}`);
      const data = await response.json();

      if (response.ok) {
        setClients(data.data || []);
      } else {
        throw new Error(data.error || 'Error loading clients');
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      setModalMessage('Error loading clients');
      setShowModal(true);
    } finally {
      setLoadingClients(false);
    }
  };

  // Cargar clientes cuando se abre el dropdown
  useEffect(() => {
    if (showClientDropdown) {
      loadClients(clientSearch);
    }
  }, [showClientDropdown]);

  // Búsqueda de clientes con debounce
  useEffect(() => {
    if (showClientDropdown) {
      const timer = setTimeout(() => {
        loadClients(clientSearch);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [clientSearch]);

  const handleAddProduct = () => {
    const searchValue = inputId.trim().toUpperCase();
    const qty = parseInt(inputQty);

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

    const existingItemIndex = rows.findIndex(row => row.product_id === product.product_id);
    
    if (existingItemIndex >= 0) {
      const updatedRows = [...rows];
      updatedRows[existingItemIndex].quantity += qty;
      updatedRows[existingItemIndex].totalPrice = 
        updatedRows[existingItemIndex].quantity * updatedRows[existingItemIndex].unitPrice;
      setRows(updatedRows);
    } else {
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

    setInputId('');
    setInputQty('');
  };

  const handleDelete = (indexToDelete: number) => {
    setRows(prevRows => prevRows.filter((_, index) => index !== indexToDelete));
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowClientDropdown(false);
    setShowClientSelection(false);
  };

  const clearClientSelection = () => {
    setSelectedClient(null);
  };

  const getClientDisplayName = (client: Client) => {
    if (client.client_type === 'Business') {
      return client.business_name || 'Unknown Business';
    } else {
      return `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unknown Individual';
    }
  };

  const handleCreateSale = async () => {
    if (rows.length === 0) {
      setModalMessage('Please add products to the cart before creating a sale.');
      setShowModal(true);
      return;
    }

    // Mostrar selección de cliente si no hay uno seleccionado
    if (!selectedClient && !showClientSelection) {
      setShowClientSelection(true);
      return;
    }

    try {
      const saleData = {
        client_id: selectedClient?.client_id || null,
        employee_id: null,
        payment_method: 'Cash',
        vat: totalPrice * 0.16,
        notes: '', 
        items: rows.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        }))
      };

      console.log('Sending sale data:', saleData);
      
      const response = await fetch('/api/sales/selling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(saleData),
      });

      const result = await response.json();
      console.log('API Response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create sale');
      }

      const clientInfo = selectedClient 
        ? ` - Client: ${getClientDisplayName(selectedClient)}`
        : ' - No client assigned';

      setModalMessage(`Sale created successfully! Sale ID: ${result.sale_id} - Total: $${result.total.toFixed(2)}${clientInfo}`);
      setShowModal(true);
      
      setTimeout(() => {
        setRows([]);
        setSelectedClient(null);
        setShowClientSelection(false);
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

          {/* Client Selection Section */}
          <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User size={20} className="text-gray-600" />
                <span className="font-medium text-gray-700">Selected Client:</span>
                {selectedClient ? (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg">
                    {selectedClient.client_type === 'Business' ? 
                      <Building size={14} className="text-blue-600" /> : 
                      <Users size={14} className="text-blue-600" />
                    }
                    <span className="text-blue-800 font-medium">
                      {getClientDisplayName(selectedClient)}
                    </span>
                    <button
                      onClick={clearClientSelection}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <span className="text-gray-500 italic">No client selected</span>
                )}
              </div>
              <Button
                label="Select Client"
                onClick={() => {
                  setShowClientSelection(true);
                  setShowClientDropdown(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1"
              />
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

          {/* Lista de productos disponibles */}
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
                    <th className="p-1">Stock</th>
                    <th className="p-1">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.product_id} className="border-b">
                      <td className="p-1">{product.sku}</td>
                      <td className="p-1">{product.name}</td>
                      <td className={`p-1 font-semibold ${
                        (product.stock || 0) <= 0 ? 'text-red-600' : 
                        (product.stock || 0) < 10 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {product.stock || 0}
                      </td>
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

      {/* Client Selection Modal */}
      {showClientSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Select Client</h2>
              <button
                onClick={() => setShowClientSelection(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search clients..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <button
                onClick={() => {
                  setSelectedClient(null);
                  setShowClientSelection(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 border border-dashed border-gray-300"
              >
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-500" />
                  <span className="text-gray-600 italic">No client (Anonymous sale)</span>
                </div>
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {loadingClients ? (
                <div className="text-center py-4 text-gray-500">
                  Loading clients...
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  {clientSearch ? 'No clients found matching your search.' : 'No active clients found.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {clients.map(client => (
                    <button
                      key={client.client_id}
                      onClick={() => handleClientSelect(client)}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {client.client_type === 'Business' ? 
                          <Building size={16} className="text-blue-600" /> : 
                          <Users size={16} className="text-green-600" />
                        }
                        <div>
                          <div className="font-medium">
                            {getClientDisplayName(client)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {client.email} • {client.tax_id}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de mensajes */}
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
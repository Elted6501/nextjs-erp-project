'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import styles from "@/app/sales/sales.module.css";
import { 
  Trash, 
  User, 
  Users, 
  Building, 
  X, 
  Search,
  Plus,
  Minus,
  ShoppingCart,
  DollarSign,
  Package,
  Clock,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';

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
  const [showProductsList, setShowProductsList] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  
  // Estados para la selección de cliente
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [clientSearch, setClientSearch] = useState('');
  const [loadingClients, setLoadingClients] = useState(false);
  const [showClientSelection, setShowClientSelection] = useState(false);

  // Estado para prevenir doble ejecución
  const [isCreatingSale, setIsCreatingSale] = useState(false);

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
        limit: '50',
        status: 'Active',
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

  useEffect(() => {
    if (showClientDropdown) {
      loadClients(clientSearch);
    }
  }, [showClientDropdown]);

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
    const qty = parseInt(inputQty) || 1;

    const product = products.find(p => 
      p.sku.toUpperCase() === searchValue || 
      p.product_id.toString() === searchValue
    );

    if (!product) {
      setModalMessage('Product not found. Please check the SKU or ID.');
      setShowModal(true);
      return;
    }

    if (qty <= 0) {
      setModalMessage('Please enter a valid quantity greater than 0.');
      setShowModal(true);
      return;
    }

    addProductToCart(product, qty);
    setInputId('');
    setInputQty('');
  };

  const addProductToCart = (product: Product, qty: number = 1) => {
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
  };

  const updateQuantity = (index: number, change: number) => {
    const updatedRows = [...rows];
    const newQuantity = updatedRows[index].quantity + change;
    
    if (newQuantity <= 0) {
      setRows(prevRows => prevRows.filter((_, i) => i !== index));
    } else {
      updatedRows[index].quantity = newQuantity;
      updatedRows[index].totalPrice = newQuantity * updatedRows[index].unitPrice;
      setRows(updatedRows);
    }
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
    // Prevenir doble ejecución
    if (isCreatingSale) {
      return;
    }

    if (rows.length === 0) {
      setModalMessage('Please add products to the cart before creating a sale.');
      setShowModal(true);
      return;
    }

    if (!selectedClient && !showClientSelection) {
      setShowClientSelection(true);
      return;
    }

    setIsCreatingSale(true);

    try {
      // Determinar el product_id principal (primer producto del carrito)
      const mainProductId = rows.length > 0 ? rows[0].product_id : null;

      const saleData = {
        client_id: selectedClient?.client_id || null,
        employee_id: null,
        product_id: mainProductId, // Agregar product_id
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
    } finally {
      setIsCreatingSale(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddProduct();
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.brand.toLowerCase().includes(productSearch.toLowerCase())
  );

  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0);
  const totalPrice = rows.reduce((sum, row) => sum + row.totalPrice, 0);

  if (loading) {
    return (
      <div className={`flex justify-center items-center h-screen ${styles.contentBackground}`}>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mb-4"></div>
          <div className="text-gray-600 font-medium">Loading products...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex relative min-h-screen">
      {/* Employee Badge */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-gradient-to-r from-red-800 to-red-900 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <User size={18} />
            <span className="font-medium">Employee 1</span>
          </div>
        </div>
      </div>

      <div className={`flex flex-col flex-1 ${styles.contentBackground}`}>
        <div className="max-w-6xl mx-auto mt-16 px-4">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-red-800 p-2 rounded-lg">
                <ShoppingCart className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-2xl text-gray-800">Point of Sale</h1>
                <p className="text-gray-600 text-sm">Add products to cart and create sales</p>
              </div>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="bg-gradient-to-r from-red-800 to-red-900 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2"
              >
                <TrendingUp size={18} />
                <span>Reports</span>
                <span className="text-xs">▾</span>
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 min-w-[12rem] bg-white rounded-lg shadow-xl border z-10 py-2">
                  <ul className="text-sm text-gray-700">
                    <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2 transition-colors">
                      <Clock size={16} />
                      Sales of the day
                    </li>
                    <li className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center gap-2 transition-colors">
                      <TrendingUp size={16} />
                      Sales of the month
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Products Available</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
                <Package className="text-blue-500" size={32} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Items in Cart</p>
                  <p className="text-2xl font-bold text-gray-900">{totalQuantity}</p>
                </div>
                <ShoppingCart className="text-green-500" size={32} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cart Total</p>
                  <p className="text-2xl font-bold text-gray-900">${totalPrice.toFixed(2)}</p>
                </div>
                <DollarSign className="text-purple-500" size={32} />
              </div>
            </div>
          </div>

          {/* Client Selection Section */}
          <div className="mb-6 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User size={20} className="text-blue-600" />
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Customer</span>
                  {selectedClient ? (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                        {selectedClient.client_type === 'Business' ? 
                          <Building size={16} className="text-blue-600" /> : 
                          <Users size={16} className="text-blue-600" />
                        }
                        <span className="text-blue-800 font-medium">
                          {getClientDisplayName(selectedClient)}
                        </span>
                        <button
                          onClick={clearClientSelection}
                          className="text-red-500 hover:text-red-700 ml-2 p-1 hover:bg-red-50 rounded"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mt-1">No customer selected</p>
                  )}
                </div>
              </div>
              <Button
                label="Select Customer"
                onClick={() => {
                  setShowClientSelection(true);
                  setShowClientDropdown(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              />
            </div>
          </div>

          {/* Product Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search Product
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter SKU or Product ID"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
              <div className="w-32">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={inputQty}
                  onChange={(e) => setInputQty(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="1"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>
              <Button 
                label={
                  <div className="flex items-center gap-2">
                    <Plus size={18} />
                    <span>Add to Cart</span>
                  </div>
                }
                className="bg-red-800 hover:bg-red-900 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg"
                onClick={handleAddProduct}
              />
            </div>
          </div>

          {/* Products List Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowProductsList(!showProductsList)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              {showProductsList ? <EyeOff size={18} /> : <Eye size={18} />}
              {showProductsList ? 'Hide' : 'View'} Available Products ({products.length})
            </button>
            
            {showProductsList && (
              <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <th className="px-4 py-3">SKU</th>
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">Brand</th>
                        <th className="px-4 py-3">Stock</th>
                        <th className="px-4 py-3">Price</th>
                        <th className="px-4 py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredProducts.map(product => (
                        <tr key={product.product_id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-sm font-mono text-gray-900">{product.sku}</td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500 truncate max-w-xs">{product.description}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{product.brand}</td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-semibold ${
                              (product.stock || 0) <= 0 ? 'text-red-600' : 
                              (product.stock || 0) < 10 ? 'text-yellow-600' : 
                              'text-green-600'
                            }`}>
                              {product.stock || 0}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            ${Number(product.sale_price).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => addProductToCart(product, 1)}
                              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition-colors"
                              title="Add to cart"
                            >
                              <Plus size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Shopping Cart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-red-800 to-red-900 text-white px-6 py-4">
              <div className="flex items-center gap-3">
                <ShoppingCart size={24} />
                <h2 className="text-xl font-semibold">Shopping Cart</h2>
                <span className="bg-white text-red-800 px-2 py-1 rounded-full text-sm font-bold">
                  {rows.length}
                </span>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-center">Quantity</th>
                    <th className="px-6 py-4 text-right">Unit Price</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center">
                          <ShoppingCart size={48} className="text-gray-300 mb-4" />
                          <p className="text-gray-500 font-medium">Your cart is empty</p>
                          <p className="text-gray-400 text-sm">Add products to start a sale</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{row.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{row.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{row.date}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                          {row.description}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => updateQuantity(index, -1)}
                              className="bg-red-100 hover:bg-red-200 text-red-600 p-1 rounded-lg transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="font-semibold text-gray-900 min-w-[2rem] text-center">
                              {row.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(index, 1)}
                              className="bg-green-100 hover:bg-green-200 text-green-600 p-1 rounded-lg transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          ${row.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-gray-900">
                          ${row.totalPrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleDelete(index)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 p-2 rounded-lg transition-colors"
                            title="Remove from cart"
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {rows.length > 0 && (
                  <tfoot className="bg-gray-50">
                    <tr className="font-bold text-gray-900">
                      <td className="px-6 py-4" colSpan={3}>
                        <div className="flex items-center gap-2">
                          <DollarSign size={20} className="text-green-600" />
                          <span className="text-lg">Totals</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-lg">{totalQuantity}</td>
                      <td className="px-6 py-4"></td>
                      <td className="px-6 py-4 text-right text-xl text-green-600">
                        ${totalPrice.toFixed(2)}
                      </td>
                      <td className="px-6 py-4"></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              label={
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} />
                  <span>{isCreatingSale ? 'Creating...' : 'Create Sale'}</span>
                </div>
              }
              className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                rows.length === 0 || isCreatingSale
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 text-white hover:shadow-lg transform hover:scale-105'
              }`}
              onClick={(rows.length > 0 && !isCreatingSale) ? handleCreateSale : () => {}}
            />
            <Button 
              label={
                <div className="flex items-center gap-2">
                  <Trash size={18} />
                  <span>Clear Cart</span>
                </div>
              }
              className={`px-8 py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                rows.length === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-red-600 hover:bg-red-700 text-white hover:shadow-lg'
              }`}
              onClick={rows.length > 0 ? () => setRows([]) : () => {}}
            />
          </div>
        </div>
      </div>

      {/* Client Selection Modal */}
      {showClientSelection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Select Customer</h2>
              <button
                onClick={() => setShowClientSelection(false)}
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <button
                onClick={() => {
                  setSelectedClient(null);
                  setShowClientSelection(false);
                }}
                className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-100 border-2 border-dashed border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <User size={18} className="text-gray-500" />
                  <span className="text-gray-600 font-medium">Anonymous Sale (No Customer)</span>
                </div>
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {loadingClients ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading customers...</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {clientSearch ? 'No customers found matching your search.' : 'No active customers found.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {clients.map(client => (
                    <button
                      key={client.client_id}
                      onClick={() => handleClientSelect(client)}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-blue-50 border border-gray-200 hover:border-blue-300 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        {client.client_type === 'Business' ? 
                          <Building size={18} className="text-blue-600" /> : 
                          <Users size={18} className="text-green-600" />
                        }
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
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

      {/* Success/Error Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center mx-4">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
              modalMessage.includes('successfully') ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {modalMessage.includes('successfully') ? (
                <div className="text-green-600 text-2xl">✓</div>
              ) : (
                <div className="text-red-600 text-2xl">⚠</div>
              )}
            </div>
            <h2 className={`text-xl font-bold mb-2 ${
              modalMessage.includes('successfully') ? 'text-green-700' : 'text-red-700'
            }`}>
              {modalMessage.includes('successfully') ? 'Success!' : 'Warning'}
            </h2>
            <p className="text-gray-700 mb-6 leading-relaxed">{modalMessage}</p>
            <button
              onClick={() => setShowModal(false)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                modalMessage.includes('successfully') 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  RotateCcw, 
  Calendar, 
  User, 
  Users, 
  Building, 
  Package, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CreditCard,
  Banknote
} from 'lucide-react';

interface Product {
  product_id: number;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Sale {
  sale_id: number;
  client_id?: number;
  employee_id?: number;
  products: Product[];
  payment_method: string;
  vat: number;
  notes?: string;
  status: boolean;
  sale_date: string;
  total_items: number;
  subtotal: number;
  total: number;
  client_name: string;
  employee_name: string;
  clients?: {
    client_id: number;
    client_type: string;
    business_name?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    tax_id: string;
  };
  employees?: {
    employee_id: number;
    first_name?: string;
    last_name?: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'returned'>('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [refoundMethod, setRefoundMethod] = useState<'Cash' | 'Credit' | 'Store Credit'>('Store Credit');
  const [processingReturn, setProcessingReturn] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  
  // Cargar ventas
  const loadSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filter !== 'all' && { status: filter }),
        ...(search && { search }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      });

      const response = await fetch(`/api/sales/sales_returns?${params}`);
      const data = await response.json();

      if (response.ok) {
        setSales(data.data || []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
      } else {
        throw new Error(data.error || 'Error loading sales');
      }
    } catch (error) {
      console.error('Error loading sales:', error);
      setMessage({ type: 'error', text: 'Error loading sales' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, [pagination.page, filter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }));
      loadSales();
    }, 500);
    return () => clearTimeout(timer);
  }, [search, dateFrom, dateTo]);

  const handleReturnSale = async () => {
    if (!selectedSale || !returnReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason for the return' });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    if (returnReason.trim().length < 10) {
      setMessage({ type: 'error', text: 'Return reason must be at least 10 characters long' });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    setProcessingReturn(true);
    try {
      const response = await fetch('/api/sales/sales_returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sale_id: selectedSale.sale_id,
          reason: returnReason.trim(),
          refound_method: refoundMethod
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: `Sale returned successfully! ${result.data?.total_items_returned || 0} items returned to inventory. Total refund: $${result.data?.total_amount_returned?.toFixed(2) || '0.00'}` 
        });
        setShowReturnModal(false);
        setSelectedSale(null);
        setReturnReason('');
        setRefoundMethod('Store Credit');
        await loadSales(); // Recargar la lista
      } else {
        throw new Error(result.error || 'Failed to process return');
      }
    } catch (error) {
      console.error('Error processing return:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error processing return' 
      });
    } finally {
      setProcessingReturn(false);
      setTimeout(() => setMessage(null), 6000);
    }
  };

  const getStatusBadge = (status: boolean) => {
    if (status) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle size={14} />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle size={14} />
          Returned
        </span>
      );
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return <Banknote size={14} />;
      case 'Credit':
      case 'Debit':
        return <CreditCard size={14} />;
      default:
        return <DollarSign size={14} />;
    }
  };

  const getRefoundIcon = (method: string) => {
    switch (method) {
      case 'Cash':
        return <Banknote size={16} className="text-green-600" />;
      case 'Credit':
        return <CreditCard size={16} className="text-blue-600" />;
      case 'Store Credit':
        return <Package size={16} className="text-purple-600" />;
      default:
        return <DollarSign size={16} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const validateReturnForm = () => {
    if (!returnReason.trim()) {
      setMessage({ type: 'error', text: 'Please provide a reason for the return' });
      return false;
    }
    if (returnReason.trim().length < 10) {
      setMessage({ type: 'error', text: 'Return reason must be at least 10 characters long' });
      return false;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-4">
      {/* Message Alert */}
      <div className={`fixed top-4 right-4 z-50 transition-all duration-500 transform ${
        message ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}>
        {message && (
          <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-lg max-w-md ${
            message.type === 'success' 
              ? 'bg-green-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
            <button 
              onClick={() => setMessage(null)}
              className="ml-4 hover:bg-white/20 rounded-lg p-1 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#a31621] to-[#8a131b] text-white px-6 py-4 rounded-t-2xl shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Sales History</h1>
              <p className="text-xs text-white/70">View and manage all sales transactions</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by Sale ID..."
              className="w-full pl-10 pr-4 py-2.5 text-gray-700 rounded-lg focus:outline-none focus:ring-4 focus:ring-white/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="px-4 py-2.5 text-gray-700 rounded-lg focus:outline-none focus:ring-4 focus:ring-white/30"
          >
            <option value="all">All Sales</option>
            <option value="active">Active Sales</option>
            <option value="returned">Returned Sales</option>
          </select>

          {/* Date From */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            max={getCurrentDate()}
            className="px-4 py-2.5 text-gray-700 rounded-lg focus:outline-none focus:ring-4 focus:ring-white/30"
          />

          {/* Date To */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            max={getCurrentDate()}
            className="px-4 py-2.5 text-gray-700 rounded-lg focus:outline-none focus:ring-4 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white/90 backdrop-blur-sm shadow-xl p-4 rounded-b-2xl">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
              <p className="text-gray-500 font-medium">Loading sales...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                    <th className="p-3 text-left font-semibold text-gray-700">Sale ID</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Customer</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Items</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Payment</th>
                    <th className="p-3 text-right font-semibold text-gray-700">Total</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Status</th>
                    <th className="p-3 text-left font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, index) => (
                    <tr 
                      key={sale.sale_id} 
                      className="border-b hover:bg-gray-50 transition-all duration-200"
                    >
                      <td className="p-3 font-mono font-medium text-blue-600">
                        #{sale.sale_id}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar size={14} />
                          {formatDate(sale.sale_date)}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {sale.clients?.client_type === 'Business' ? (
                            <Building size={16} className="text-purple-600" />
                          ) : (
                            <User size={16} className="text-blue-600" />
                          )}
                          <span className="truncate max-w-[200px]">
                            {sale.client_name || 'Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Package size={14} className="text-gray-400" />
                          <span>{sale.total_items} items</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                          sale.payment_method === 'Cash' ? 'bg-green-100 text-green-700' :
                          sale.payment_method === 'Credit' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {getPaymentIcon(sale.payment_method)}
                          {sale.payment_method}
                        </span>
                      </td>
                      <td className="p-3 text-right font-semibold">
                        ${sale.total.toFixed(2)}
                      </td>
                      <td className="p-3">
                        {getStatusBadge(sale.status)}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedSale(sale)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {sale.status && (
                            <button
                              onClick={() => {
                                setSelectedSale(sale);
                                setShowReturnModal(true);
                              }}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Process Return"
                            >
                              <RotateCcw size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {sales.map((sale) => (
                <div key={sale.sale_id} className="bg-white rounded-xl p-4 shadow-lg border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-mono font-semibold text-blue-600">#{sale.sale_id}</p>
                        <p className="text-xs text-gray-500">{formatDate(sale.sale_date)}</p>
                      </div>
                    </div>
                    {getStatusBadge(sale.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2">
                      {sale.clients?.client_type === 'Business' ? (
                        <Building size={16} className="text-purple-600" />
                      ) : (
                        <User size={16} className="text-blue-600" />
                      )}
                      <span>{sale.client_name || 'Anonymous'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-gray-400" />
                      <span>{sale.total_items} items</span>
                    </div>
                    <div className="flex items-center gap-2 justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} className="text-green-600" />
                        <span className="font-semibold">${sale.total.toFixed(2)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        sale.payment_method === 'Cash' ? 'bg-green-100 text-green-700' :
                        sale.payment_method === 'Credit' ? 'bg-blue-100 text-blue-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {getPaymentIcon(sale.payment_method)}
                        {sale.payment_method}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedSale(sale)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    {sale.status && (
                      <button
                        onClick={() => {
                          setSelectedSale(sale);
                          setShowReturnModal(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <RotateCcw size={16} />
                        Return
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {sales.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex flex-col items-center gap-4">
                  <Package size={48} className="text-gray-400" />
                  <div>
                    <p className="text-lg font-semibold text-gray-700">No sales found</p>
                    <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="p-2 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                >
                  <ChevronLeft size={20} />
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                          pagination.page === pageNum
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {pagination.totalPages > 5 && (
                    <>
                      <span className="px-2">...</span>
                      <button
                        onClick={() => setPagination(prev => ({ ...prev, page: pagination.totalPages }))}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                          pagination.page === pagination.totalPages
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="p-2 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all duration-200"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Sale Details Modal */}
      {selectedSale && !showReturnModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Sale Details #{selectedSale.sale_id}</h2>
              <button
                onClick={() => setSelectedSale(null)}
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-600">Date</p>
                  <p className="text-sm">{formatDate(selectedSale.sale_date)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  {getStatusBadge(selectedSale.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Customer</p>
                  <p className="text-sm">{selectedSale.client_name || 'Anonymous'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Payment Method</p>
                  <div className="flex items-center gap-1">
                    {getPaymentIcon(selectedSale.payment_method)}
                    <span className="text-sm">{selectedSale.payment_method}</span>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="font-semibold mb-3">Products</h3>
                <div className="space-y-2">
                  {selectedSale.products?.map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-600">SKU: {product.sku}</p>
                        <p className="text-sm text-gray-600">Qty: {product.quantity} × ${product.unit_price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${product.total_price.toFixed(2)}</p>
                      </div>
                    </div>
                  )) || []}
                </div>
              </div>

              {/* Totals */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>${selectedSale.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>VAT (16%):</span>
                  <span>${selectedSale.vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${selectedSale.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedSale.notes && (
                <div>
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedSale.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedSale && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-red-700">Process Return</h2>
              <button
                onClick={() => {
                  setShowReturnModal(false);
                  setReturnReason('');
                  setRefoundMethod('Store Credit');
                }}
                className="text-gray-500 hover:text-gray-700 p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-2">Sale #{selectedSale.sale_id}</p>
                <p className="text-sm text-red-600 mb-2">
                  This action will return all {selectedSale.total_items} products to inventory and mark the sale as returned.
                </p>
                <p className="text-sm font-semibold text-red-700">
                  Total amount: ${selectedSale.total.toFixed(2)}
                </p>
              </div>

              {/* Refound Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Refound Method <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {(['Cash', 'Credit', 'Store Credit'] as const).map(method => (
                    <label key={method} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="refoundMethod"
                        value={method}
                        checked={refoundMethod === method}
                        onChange={(e) => setRefoundMethod(e.target.value as typeof refoundMethod)}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <div className="flex items-center gap-2">
                        {getRefoundIcon(method)}
                        <span className="text-sm font-medium">{method}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Return <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Please provide a detailed reason for the return (minimum 10 characters)..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={4}
                  maxLength={500}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {returnReason.length}/500 characters (minimum 10)
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    setReturnReason('');
                    setRefoundMethod('Store Credit');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                  disabled={processingReturn}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReturnSale}
                  disabled={processingReturn || !validateReturnForm()}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processingReturn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <RotateCcw size={16} />
                      Process Return
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
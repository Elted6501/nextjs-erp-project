'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import { Pencil, X, Search, Plus, Users, Building, Menu, Filter, CheckCircle, XCircle, AlertCircle, Mail, Phone, MapPin, Calendar, Hash, Loader2 } from 'lucide-react';

interface Client {
    client_id: number;
    client_type: 'Individual' | 'Business';
    taxpayer_type: 'Physical Person' | 'Legal Entity';
    business_name?: string;
    first_name?: string;
    last_name?: string;
    tax_id: string;
    email: string;
    phone: string;
    mobile_phone?: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    notes?: string;
    status: 'Active' | 'Inactive' | 'Blocked';
    created_at?: string;
    updated_at?: string;
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface StatusCount {
    all: number;
    active: number;
    inactive: number;
    blocked: number;
}

export default function ClientPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive' | 'Blocked'>('All');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [newClient, setNewClient] = useState<Partial<Client>>({ 
        status: 'Active',
        client_type: 'Individual',
        taxpayer_type: 'Physical Person',
        country: 'Mexico'
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [statusCounts, setStatusCounts] = useState<StatusCount>({
        all: 0,
        active: 0,
        inactive: 0,
        blocked: 0
    });
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    // Cargar clientes con filtros
    const loadClients = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filter !== 'All' && { status: filter }),
                ...(search && { search })
            });

            const response = await fetch(`/api/sales/clients?${params}`);
            const data = await response.json();

            if (response.ok) {
                setClients(data.data || []);
                if (data.pagination) {
                    setPagination(data.pagination);
                }
                
                if (filter === 'All' && !search) {
                    updateStatusCounts(data.data || []);
                }
            } else {
                throw new Error(data.error || 'Error loading clients');
            }
        } catch (error) {
            console.error('Error loading clients:', error);
            setMessage({ type: 'error', text: 'Error loading clients' });
        } finally {
            setLoading(false);
        }
    };

    // Actualizar contadores de estado
    const updateStatusCounts = (clientsList: Client[]) => {
        const counts = clientsList.reduce((acc, client) => {
            acc.all++;
            switch (client.status) {
                case 'Active':
                    acc.active++;
                    break;
                case 'Inactive':
                    acc.inactive++;
                    break;
                case 'Blocked':
                    acc.blocked++;
                    break;
            }
            return acc;
        }, { all: 0, active: 0, inactive: 0, blocked: 0 });
        
        setStatusCounts(counts);
    };

    useEffect(() => {
        loadClients();
    }, [pagination.page, filter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 }));
            loadClients();
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    // Validar formulario
    const validateForm = (): boolean => {
        const errors: string[] = [];

        if (newClient.client_type === 'Individual') {
            if (!newClient.first_name?.trim()) errors.push('First name is required');
            if (!newClient.last_name?.trim()) errors.push('Last name is required');
            if (newClient.first_name && newClient.first_name.length > 50) errors.push('First name is too long (max 50 characters)');
            if (newClient.last_name && newClient.last_name.length > 50) errors.push('Last name is too long (max 50 characters)');
        } else {
            if (!newClient.business_name?.trim()) errors.push('Business name is required');
            if (newClient.business_name && newClient.business_name.length > 100) errors.push('Business name is too long (max 100 characters)');
        }

        if (!newClient.email?.trim()) errors.push('Email is required');
        if (!newClient.tax_id?.trim()) errors.push('Tax ID is required');
        if (!newClient.phone?.trim()) errors.push('Phone is required');
        if (!newClient.address?.trim()) errors.push('Address is required');
        if (!newClient.city?.trim()) errors.push('City is required');
        if (!newClient.state?.trim()) errors.push('State is required');
        if (!newClient.country?.trim()) errors.push('Country is required');
        if (!newClient.zip_code?.trim()) errors.push('ZIP code is required');

        if (newClient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClient.email)) {
            errors.push('Invalid email format');
        }
        if (newClient.email && newClient.email.length > 100) errors.push('Email is too long (max 100 characters)');
        if (newClient.zip_code && !/^\d{5,10}$/.test(newClient.zip_code)) {
            errors.push('ZIP code must be 5-10 digits');
        }

        if (errors.length > 0) {
            setMessage({ type: 'error', text: errors.join(', ') });
            setTimeout(() => setMessage(null), 5000);
            return false;
        }

        return true;
    };

    const handleSaveClient = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            if (editingClient) {
                const res = await fetch(`/api/sales/clients/${editingClient.client_id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newClient),
                });
                
                if (!res.ok) {
                    const error = await res.json();
                    throw new Error(error.error || 'Error updating client');
                }
                
                const result = await res.json();
                setMessage({ type: 'success', text: 'Client updated successfully' });
            } else {
                const response = await fetch('/api/sales/clients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newClient),
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Error creating client');
                }
                
                const result = await response.json();
                setMessage({ type: 'success', text: result.message || 'Client created successfully' });
            }
            
            await loadClients();
            setShowForm(false);
            setEditingClient(null);
            setNewClient({ 
                status: 'Active',
                client_type: 'Individual',
                taxpayer_type: 'Physical Person',
                country: 'Mexico'
            });
        } catch (err) {
            console.error('Error saving client:', err);
            setMessage({ 
                type: 'error', 
                text: err instanceof Error ? err.message : 'Error saving client' 
            });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const openEditForm = (client: Client) => {
        setNewClient(client);
        setEditingClient(client);
        setShowForm(true);
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingClient(null);
        setNewClient({ 
            status: 'Active',
            client_type: 'Individual',
            taxpayer_type: 'Physical Person',
            country: 'Mexico'
        });
    };

    const handleFilterChange = (newFilter: typeof filter) => {
        setFilter(newFilter);
        setShowMobileFilters(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Active':
                return <CheckCircle className="w-4 h-4" />;
            case 'Inactive':
                return <AlertCircle className="w-4 h-4" />;
            case 'Blocked':
                return <XCircle className="w-4 h-4" />;
            default:
                return null;
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-green-200';
            case 'Inactive':
                return 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-yellow-200';
            case 'Blocked':
                return 'bg-gradient-to-r from-red-400 to-red-500 text-white shadow-red-200';
            default:
                return 'bg-gray-200 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 p-2 sm:p-4">
            {/* Message Alert */}
            <div className={`fixed top-4 right-4 z-50 transition-all duration-500 transform ${
                message ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}>
                {message && (
                    <div className={`px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-lg ${
                        message.type === 'success' 
                            ? 'bg-green-500/90 text-white' 
                            : 'bg-red-500/90 text-white'
                    }`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-5 h-5 animate-bounce" />
                        ) : (
                            <XCircle className="w-5 h-5 animate-pulse" />
                        )}
                        <span className="text-sm font-medium">{message.text}</span>
                        <button 
                            onClick={() => setMessage(null)}
                            className="ml-4 hover:bg-white/20 rounded-lg p-1 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Header */}
            <div className="bg-gradient-to-r from-[#a31621] to-[#8a131b] text-white px-4 py-3 sm:px-6 sm:py-4 rounded-t-2xl shadow-xl">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold">Client Management</h1>
                                <p className="text-xs text-white/70 hidden sm:block">Manage your business relationships</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowMobileSearch(!showMobileSearch)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-all duration-200 backdrop-blur-sm lg:hidden"
                            >
                                <Search size={20} />
                            </button>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowForm(true);
                                }}
                                className="bg-white text-[#a31621] hover:bg-gray-100 hover:scale-105 transition-all duration-200 rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-1 sm:gap-2 shadow-lg font-medium"
                            >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Add Client</span>
                            </button>
                        </div>
                    </div>
                    
                    {/* Desktop Search */}
                    <div className="hidden lg:block">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#a31621] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, email or tax ID"
                                className="rounded-xl px-10 py-2.5 text-gray-700 w-full max-w-md focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-200 shadow-lg"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Mobile Search */}
                    <div className={`lg:hidden transition-all duration-300 ${
                        showMobileSearch ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
                    }`}>
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-[#a31621] transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search clients..."
                                className="rounded-xl px-10 py-2 text-gray-700 w-full focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-200 text-sm"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Popup Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-slide-up">
                        <button
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 cursor-pointer text-gray-400 hover:text-red-600 transition-colors"
                            onClick={resetForm}
                            disabled={saving}
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <h2 className="text-base sm:text-lg font-bold mb-4 text-[#08415c] flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${editingClient ? 'bg-blue-100' : 'bg-green-100'}`}>
                                {editingClient ? <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />}
                            </div>
                            {editingClient ? 'Edit Client' : 'Register New Client'}
                        </h2>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {/* Client Type */}
                            <div className="col-span-1 sm:col-span-2">
                                <label className="block text-sm font-semibold mb-2 text-gray-700">
                                    Client Type <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="client_type"
                                            value="Individual"
                                            checked={newClient.client_type === 'Individual'}
                                            onChange={(e) => setNewClient({ ...newClient, client_type: 'Individual' })}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="flex items-center gap-1 text-sm group-hover:text-blue-600 transition-colors">
                                            <Users size={16} />
                                            Individual
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="client_type"
                                            value="Business"
                                            checked={newClient.client_type === 'Business'}
                                            onChange={(e) => setNewClient({ ...newClient, client_type: 'Business' })}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="flex items-center gap-1 text-sm group-hover:text-blue-600 transition-colors">
                                            <Building size={16} />
                                            Business
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Taxpayer Type */}
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    Taxpayer Type <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    value={newClient.taxpayer_type || 'Physical Person'} 
                                    className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300"
                                    onChange={(e) => setNewClient({ ...newClient, taxpayer_type: e.target.value as 'Physical Person' | 'Legal Entity' })}
                                >
                                    <option value="Physical Person">Physical Person</option>
                                    <option value="Legal Entity">Legal Entity</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    value={newClient.status || 'Active'} 
                                    className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300"
                                    onChange={(e) => setNewClient({ ...newClient, status: e.target.value as 'Active' | 'Inactive' | 'Blocked' })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Blocked">Blocked</option>
                                </select>
                            </div>

                            {/* Business Name */}
                            {newClient.client_type === 'Business' && (
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block text-sm font-semibold mb-1 text-gray-700">
                                        Business Name <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        placeholder="Enter business name" 
                                        value={newClient.business_name || ''} 
                                        className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300" 
                                        onChange={(e) => setNewClient({ ...newClient, business_name: e.target.value })}
                                        maxLength={100}
                                    />
                                </div>
                            )}

                            {/* Name fields */}
                            {newClient.client_type === 'Individual' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-gray-700">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            placeholder="Enter first name" 
                                            value={newClient.first_name || ''} 
                                            className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300" 
                                            onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })}
                                            maxLength={50}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold mb-1 text-gray-700">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            placeholder="Enter last name" 
                                            value={newClient.last_name || ''} 
                                            className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300" 
                                            onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })}
                                            maxLength={50}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div className="col-span-1 sm:col-span-2 md:col-span-1">
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="email"
                                    placeholder="email@example.com" 
                                    value={newClient.email || ''} 
                                    className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300" 
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                    maxLength={100}
                                    required
                                />
                            </div>
                            
                            <div className="col-span-1 sm:col-span-2 md:col-span-1">
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    Tax ID (RFC) <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="XXXX000000XXX" 
                                    value={newClient.tax_id || ''} 
                                    className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300" 
                                    onChange={(e) => setNewClient({ ...newClient, tax_id: e.target.value.toUpperCase() })}
                                    maxLength={30}
                                    required
                                />
                            </div>
                            
                            <div className="col-span-1 sm:col-span-2">
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="Street, Number, Colony" 
                                    value={newClient.address || ''} 
                                    className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300" 
                                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} 
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="(555) 123-4567" 
                                    value={newClient.phone || ''} 
                                    className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300" 
                                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                    maxLength={20}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Mobile Phone</label>
                                <input 
                                    placeholder="(555) 987-6543" 
                                    value={newClient.mobile_phone || ''} 
                                    className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300" 
                                    onChange={(e) => setNewClient({ ...newClient, mobile_phone: e.target.value })}
                                    maxLength={20}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="City name" 
                                    value={newClient.city || ''} 
                                    className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300" 
                                    onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                                    maxLength={50}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="State/Province" 
                                    value={newClient.state || ''} 
                                    className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300" 
                                    onChange={(e) => setNewClient({ ...newClient, state: e.target.value })}
                                    maxLength={50}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="Country" 
                                    value={newClient.country || ''} 
                                    className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300" 
                                    onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                                    maxLength={50}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold mb-1 text-gray-700">
                                    ZIP Code <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="12345" 
                                    value={newClient.zip_code || ''} 
                                    className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300" 
                                    onChange={(e) => setNewClient({ ...newClient, zip_code: e.target.value.replace(/\D/g, '') })}
                                    maxLength={10}
                                    pattern="[0-9]{5,10}"
                                    required
                                />
                            </div>
                            
                            <div className="col-span-1 sm:col-span-2">
                                <label className="block text-sm font-semibold mb-1 text-gray-700">Notes</label>
                                <textarea 
                                    placeholder="Additional notes (optional)" 
                                    value={newClient.notes || ''} 
                                    className="border-2 border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200 hover:border-gray-300 resize-none" 
                                    rows={3}
                                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })} 
                                />
                            </div>
                        </div>
                        
                        <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <p className="text-xs sm:text-sm text-gray-500">
                                <span className="text-red-500">*</span> Required fields
                            </p>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button 
                                    onClick={resetForm}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex-1 sm:flex-initial text-sm font-medium transition-all duration-200 hover:shadow-lg"
                                    disabled={saving}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveClient}
                                    disabled={saving}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg flex-1 sm:flex-initial text-sm font-medium transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        editingClient ? "Update" : "Save"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row">
                {/* Mobile Filter Button */}
                <div className="lg:hidden bg-white/80 backdrop-blur-sm p-3 flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                            <Filter size={16} className="text-white" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Filter: {filter}</span>
                    </div>
                    <button
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
                    >
                        <Menu size={18} />
                    </button>
                </div>

                {/* Mobile Filters Dropdown */}
                <div className={`lg:hidden bg-white/90 backdrop-blur-sm border-t transition-all duration-300 ${
                    showMobileFilters ? 'max-h-96' : 'max-h-0 overflow-hidden'
                }`}>
                    <div className="p-4 space-y-2">
                        <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                            <Filter size={16} />
                            Filter by Status
                        </h3>
                        <div className="space-y-2">
                            {(['All', 'Active', 'Inactive', 'Blocked'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleFilterChange(status)}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm flex justify-between items-center transition-all duration-200 ${
                                        filter === status 
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]' 
                                            : 'hover:bg-gray-100 bg-white'
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {status !== 'All' && getStatusIcon(status)}
                                        {status}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                        filter === status ? 'bg-white/20' : 'bg-gray-100'
                                    }`}>
                                        {status === 'All' ? pagination.total : 
                                         status === 'Active' ? statusCounts.active :
                                         status === 'Inactive' ? statusCounts.inactive :
                                         statusCounts.blocked}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Desktop Sidebar Filters */}
                <div className="hidden lg:block w-56 bg-white/90 backdrop-blur-sm shadow-xl rounded-bl-2xl p-6">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                            <Filter size={16} className="text-white" />
                        </div>
                        Filter by Status
                    </h3>
                    <ul className="space-y-2">
                        {(['All', 'Active', 'Inactive', 'Blocked'] as const).map(status => (
                            <li 
                                key={status}
                                onClick={() => setFilter(status)} 
                                className={`cursor-pointer px-4 py-3 rounded-xl transition-all duration-200 flex justify-between items-center group ${
                                    filter === status 
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]' 
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                <span className="flex items-center gap-2 font-medium">
                                    {status !== 'All' && getStatusIcon(status)}
                                    {status}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                    filter === status 
                                        ? 'bg-white/20' 
                                        : status === 'All' ? 'bg-gray-100' :
                                          status === 'Active' ? 'bg-green-100 text-green-700' :
                                          status === 'Inactive' ? 'bg-yellow-100 text-yellow-700' :
                                          'bg-red-100 text-red-700'
                                }`}>
                                    {status === 'All' ? pagination.total : 
                                     filter === 'All' && (
                                        status === 'Active' ? statusCounts.active :
                                        status === 'Inactive' ? statusCounts.inactive :
                                        statusCounts.blocked
                                     )}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Table/Cards */}
                <div className="flex-1 bg-white/90 backdrop-blur-sm shadow-xl p-2 sm:p-4 overflow-auto rounded-b-2xl lg:rounded-br-2xl">
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="inline-flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin absolute top-0"></div>
                                </div>
                                <p className="text-gray-500 font-medium">Loading clients...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden lg:block overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                                            <th className="p-3 text-left font-semibold text-gray-700">Name</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Type</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Tax ID</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Email</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Phone</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Location</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Status</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Created</th>
                                            <th className="p-3 text-left font-semibold text-gray-700">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {clients.map((client, index) => (
                                            <tr 
                                                key={client.client_id} 
                                                className="border-b hover:bg-gray-50 transition-all duration-200 animate-fade-in"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <td className="p-3 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`p-1.5 rounded-lg ${
                                                            client.client_type === 'Business' 
                                                                ? 'bg-purple-100 text-purple-600' 
                                                                : 'bg-blue-100 text-blue-600'
                                                        }`}>
                                                            {client.client_type === 'Business' ? <Building size={14} /> : <Users size={14} />}
                                                        </div>
                                                        <span className="truncate max-w-[200px]">
                                                            {client.client_type === 'Business' 
                                                                ? client.business_name 
                                                                : `${client.first_name || ''} ${client.last_name || ''}`}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                        client.client_type === 'Business'
                                                            ? 'bg-purple-100 text-purple-700'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {client.client_type}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Hash size={14} />
                                                        {client.tax_id}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Mail size={14} />
                                                        <span className="truncate max-w-[180px]">{client.email}</span>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <Phone size={14} />
                                                        {client.phone}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 text-gray-600">
                                                        <MapPin size={14} />
                                                        {client.city}, {client.state}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm ${getStatusStyles(client.status)}`}>
                                                        {getStatusIcon(client.status)}
                                                        {client.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Calendar size={14} />
                                                        {client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <button
                                                        onClick={() => openEditForm(client)}
                                                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="lg:hidden space-y-3">
                                {clients.map((client, index) => (
                                    <div 
                                        key={client.client_id} 
                                        className="bg-white rounded-xl p-4 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 animate-slide-up"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-2 rounded-lg ${
                                                    client.client_type === 'Business' 
                                                        ? 'bg-purple-100 text-purple-600' 
                                                        : 'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {client.client_type === 'Business' ? <Building size={18} /> : <Users size={18} />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {client.client_type === 'Business' 
                                                            ? client.business_name 
                                                            : `${client.first_name || ''} ${client.last_name || ''}`}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{client.client_type}</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => openEditForm(client)}
                                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Hash size={16} className="text-gray-400" />
                                                <span className="font-medium">Tax ID:</span>
                                                <span>{client.tax_id}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail size={16} className="text-gray-400" />
                                                <span className="truncate">{client.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone size={16} className="text-gray-400" />
                                                <span>{client.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <MapPin size={16} className="text-gray-400" />
                                                <span>{client.city}, {client.state}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between items-center mt-4 pt-3 border-t">
                                            <span className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-semibold ${getStatusStyles(client.status)}`}>
                                                {getStatusIcon(client.status)}
                                                {client.status}
                                            </span>
                                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                                <Calendar size={14} />
                                                {client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {clients.length === 0 && (
                                <div className="text-center py-16">
                                    <div className="inline-flex flex-col items-center gap-4">
                                        <div className="p-6 bg-gray-100 rounded-full">
                                            <Users size={48} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-700">No clients found</p>
                                            {search && <p className="text-sm text-gray-500 mt-1">Try adjusting your search criteria</p>}
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
                                        className="px-4 py-2 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all duration-200"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                            const pageNum = i + 1;
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
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
                                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
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
                                        className="px-4 py-2 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-all duration-200"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }

                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
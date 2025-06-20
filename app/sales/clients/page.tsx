'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import { Pencil, X, Search, Plus, Users, Building } from 'lucide-react';

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
        country: 'Mexico' // Default country
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
                
                // Actualizar contadores de estado
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

    // Cargar clientes cuando cambian los filtros
    useEffect(() => {
        loadClients();
    }, [pagination.page, filter]);

    // Búsqueda con debounce
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

        // Validaciones según tipo de cliente
        if (newClient.client_type === 'Individual') {
            if (!newClient.first_name?.trim()) errors.push('First name is required');
            if (!newClient.last_name?.trim()) errors.push('Last name is required');
            if (newClient.first_name && newClient.first_name.length > 50) errors.push('First name is too long (max 50 characters)');
            if (newClient.last_name && newClient.last_name.length > 50) errors.push('Last name is too long (max 50 characters)');
        } else {
            if (!newClient.business_name?.trim()) errors.push('Business name is required');
            if (newClient.business_name && newClient.business_name.length > 100) errors.push('Business name is too long (max 100 characters)');
        }

        // Validaciones comunes
        if (!newClient.email?.trim()) errors.push('Email is required');
        if (!newClient.tax_id?.trim()) errors.push('Tax ID is required');
        if (!newClient.phone?.trim()) errors.push('Phone is required');
        if (!newClient.address?.trim()) errors.push('Address is required');
        if (!newClient.city?.trim()) errors.push('City is required');
        if (!newClient.state?.trim()) errors.push('State is required');
        if (!newClient.country?.trim()) errors.push('Country is required');
        if (!newClient.zip_code?.trim()) errors.push('ZIP code is required');

        // Validaciones de formato
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
                // Crear nuevo cliente
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
            
            await loadClients(); // Recargar la lista
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
    return (
        <div className="min-h-screen bg-[#fff7f7] p-4">
            {message && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm flex items-center justify-between ${
                    message.type === 'success' 
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                    <span>{message.text}</span>
                    <button 
                        onClick={() => setMessage(null)}
                        className="ml-4 text-lg font-bold hover:opacity-70"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Header */}
            <div className="bg-[#a31621] text-white px-6 py-4 rounded-t-xl">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Users size={24} />
                        <h1 className="text-xl font-semibold">Client Management</h1>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, email or tax ID"
                                className="rounded-lg px-10 py-2 text-gray-700 w-80 focus:outline-none focus:ring-2 focus:ring-white"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button
                            label={
                                <div className="flex items-center gap-2">
                                    <Plus size={18} />
                                    <span>Add Client</span>
                                </div>
                            }
                            className="bg-white text-[#a31621] hover:bg-gray-100"
                            onClick={() => {
                                resetForm();
                                setShowForm(true);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Popup Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl relative">
                        <button
                            className="absolute top-4 right-4 cursor-pointer text-red-600 hover:text-red-800"
                            onClick={resetForm}
                            disabled={saving}
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-lg font-semibold mb-4 text-[#08415c] flex items-center gap-2">
                            {editingClient ? <Pencil size={20} /> : <Plus size={20} />}
                            {editingClient ? 'Edit Client' : 'Register New Client'}
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Client Type */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">
                                    Client Type <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="client_type"
                                            value="Individual"
                                            checked={newClient.client_type === 'Individual'}
                                            onChange={(e) => setNewClient({ ...newClient, client_type: 'Individual' })}
                                            className="text-blue-600"
                                        />
                                        <span className="flex items-center gap-1">
                                            <Users size={16} />
                                            Individual
                                        </span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="client_type"
                                            value="Business"
                                            checked={newClient.client_type === 'Business'}
                                            onChange={(e) => setNewClient({ ...newClient, client_type: 'Business' })}
                                            className="text-blue-600"
                                        />
                                        <span className="flex items-center gap-1">
                                            <Building size={16} />
                                            Business
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Taxpayer Type */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Taxpayer Type <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    value={newClient.taxpayer_type || 'Physical Person'} 
                                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={(e) => setNewClient({ ...newClient, taxpayer_type: e.target.value as 'Physical Person' | 'Legal Entity' })}
                                >
                                    <option value="Physical Person">Physical Person</option>
                                    <option value="Legal Entity">Legal Entity</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select 
                                    value={newClient.status || 'Active'} 
                                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onChange={(e) => setNewClient({ ...newClient, status: e.target.value as 'Active' | 'Inactive' | 'Blocked' })}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Blocked">Blocked</option>
                                </select>
                            </div>

                            {/* Business Name - Solo si es Business */}
                            {newClient.client_type === 'Business' && (
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium mb-1">
                                        Business Name <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        placeholder="Business Name (max 100 characters)" 
                                        value={newClient.business_name || ''} 
                                        className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                        onChange={(e) => setNewClient({ ...newClient, business_name: e.target.value })}
                                        maxLength={100}
                                    />
                                </div>
                            )}

                            {/* Name fields - Solo si es Individual */}
                            {newClient.client_type === 'Individual' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            First Name <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            placeholder="First Name (max 50 characters)" 
                                            value={newClient.first_name || ''} 
                                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })}
                                            maxLength={50}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">
                                            Last Name <span className="text-red-500">*</span>
                                        </label>
                                        <input 
                                            placeholder="Last Name (max 50 characters)" 
                                            value={newClient.last_name || ''} 
                                            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                            onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })}
                                            maxLength={50}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    type="email"
                                    placeholder="Email (max 100 characters)" 
                                    value={newClient.email || ''} 
                                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                    maxLength={100}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Tax ID (RFC) <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="RFC / Tax ID" 
                                    value={newClient.tax_id || ''} 
                                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={(e) => setNewClient({ ...newClient, tax_id: e.target.value.toUpperCase() })}
                                    maxLength={30}
                                    required
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">
                                    Address <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="Street, Number, Colony" 
                                    value={newClient.address || ''} 
                                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} 
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Phone <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="10 digits" 
                                    value={newClient.phone || ''} 
                                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                    maxLength={20}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Mobile Phone</label>
                                <input 
                                    placeholder="10 digits (optional)" 
                                    value={newClient.mobile_phone || ''} 
                                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={(e) => setNewClient({ ...newClient, mobile_phone: e.target.value })}
                                    maxLength={20}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="City" 
                                    value={newClient.city || ''} 
                                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                                    maxLength={50}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="State" 
                                    value={newClient.state || ''} 
                                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={(e) => setNewClient({ ...newClient, state: e.target.value })}
                                    maxLength={50}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="Country" 
                                    value={newClient.country || ''} 
                                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={(e) => setNewClient({ ...newClient, country: e.target.value })}
                                    maxLength={50}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    ZIP Code <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    placeholder="5-10 digits" 
                                    value={newClient.zip_code || ''} 
                                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    onChange={(e) => setNewClient({ ...newClient, zip_code: e.target.value.replace(/\D/g, '') })}
                                    maxLength={10}
                                    pattern="[0-9]{5,10}"
                                    required
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea 
                                    placeholder="Additional notes (optional)" 
                                    value={newClient.notes || ''} 
                                    className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    rows={3}
                                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })} 
                                />
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                <span className="text-red-500">*</span> Required fields
                            </p>
                            <div className="flex gap-2">
                                <Button 
                                    label="Cancel" 
                                    onClick={resetForm}
                                    className="bg-gray-500 hover:bg-gray-600 text-white"
                                    disabled={saving}
                                />
                                <Button 
                                    label={saving ? "Saving..." : (editingClient ? "Update" : "Save")} 
                                    onClick={handleSaveClient} 
                                    className="bg-green-700 hover:bg-green-800 text-white"
                                    disabled={saving}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Filters */}
            <div className="flex">
                <div className="w-48 bg-white shadow rounded-bl-xl p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Filter by Status</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li 
                            onClick={() => setFilter('All')} 
                            className={`cursor-pointer hover:text-blue-600 flex justify-between items-center ${filter === 'All' ? 'font-bold text-blue-600' : ''}`}
                        >
                            <span>All</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{pagination.total}</span>
                        </li>
                        <li 
                            onClick={() => setFilter('Active')} 
                            className={`cursor-pointer hover:text-green-600 flex justify-between items-center ${filter === 'Active' ? 'font-bold text-green-600' : ''}`}
                        >
                            <span>Active</span>
                            {filter === 'All' && <span className="text-xs bg-green-100 px-2 py-1 rounded">{statusCounts.active}</span>}
                        </li>
                        <li 
                            onClick={() => setFilter('Inactive')} 
                            className={`cursor-pointer hover:text-yellow-600 flex justify-between items-center ${filter === 'Inactive' ? 'font-bold text-yellow-600' : ''}`}
                        >
                            <span>Inactive</span>
                            {filter === 'All' && <span className="text-xs bg-yellow-100 px-2 py-1 rounded">{statusCounts.inactive}</span>}
                        </li>
                        <li 
                            onClick={() => setFilter('Blocked')} 
                            className={`cursor-pointer hover:text-red-600 flex justify-between items-center ${filter === 'Blocked' ? 'font-bold text-red-600' : ''}`}
                        >
                            <span>Blocked</span>
                            {filter === 'All' && <span className="text-xs bg-red-100 px-2 py-1 rounded">{statusCounts.blocked}</span>}
                        </li>
                    </ul>
                </div>

                {/* Table */}
                <div className="flex-1 bg-white shadow p-4 overflow-auto rounded-br-xl">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            <p className="mt-2">Loading clients...</p>
                        </div>
                    ) : (
                        <>
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs bg-[#ffdddd]">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2">Tax ID</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Phone</th>
                                        <th className="p-2">City</th>
                                        <th className="p-2">State</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Created</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => (
                                        <tr key={client.client_id} className="border-t hover:bg-gray-50">
                                            <td className="p-2 font-medium">
                                                <div className="flex items-center gap-2">
                                                    {client.client_type === 'Business' ? <Building size={14} /> : <Users size={14} />}
                                                    {client.client_type === 'Business' 
                                                        ? client.business_name 
                                                        : `${client.first_name || ''} ${client.last_name || ''}`}
                                                </div>
                                            </td>
                                            <td className="p-2">
                                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {client.client_type}
                                                </span>
                                            </td>
                                            <td className="p-2">{client.tax_id}</td>
                                            <td className="p-2">{client.email}</td>
                                            <td className="p-2">{client.phone}</td>
                                            <td className="p-2">{client.city}</td>
                                            <td className="p-2">{client.state}</td>
                                            <td className="p-2">
                                                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                                    client.status === 'Active' ? 'bg-green-100 text-green-800' : 
                                                    client.status === 'Inactive' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                    {client.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="p-2 text-xs text-gray-500">
                                                {client.created_at ? new Date(client.created_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="p-2">
                                                <button
                                                    onClick={() => openEditForm(client)}
                                                    className="text-blue-600 hover:text-blue-800 p-1 hover:bg-blue-50 rounded"
                                                    title="Edit"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {clients.length === 0 && (
                                <div className="text-gray-500 mt-8 text-center">
                                    <Users size={48} className="mx-auto mb-4 opacity-20" />
                                    <p>No clients found.</p>
                                    {search && <p className="text-sm mt-2">Try adjusting your search criteria.</p>}
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-6 flex justify-center items-center gap-2">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                        disabled={pagination.page === 1}
                                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-1 text-sm">
                                        Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong>
                                    </span>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

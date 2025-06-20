'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import { Pencil, X } from 'lucide-react';

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
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
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
        taxpayer_type: 'Physical Person'
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [loading, setLoading] = useState(false);
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

    // Cargar clientes cuando cambian los filtros
    useEffect(() => {
        loadClients();
    }, [pagination.page, filter, search]);

    const handleSaveClient = async () => {
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
                await loadClients(); // Recargar la lista
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
                await loadClients(); // Recargar la lista
            }
            
            setShowForm(false);
            setEditingClient(null);
            setNewClient({ 
                status: 'Active',
                client_type: 'Individual',
                taxpayer_type: 'Physical Person'
            });
        } catch (err) {
            console.error('Error saving client:', err);
            setMessage({ 
                type: 'error', 
                text: err instanceof Error ? err.message : 'Error saving client' 
            });
        } finally {
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const openEditForm = (client: Client) => {
        setNewClient(client);
        setEditingClient(client);
        setShowForm(true);
    };

    // Búsqueda con debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            setPagination(prev => ({ ...prev, page: 1 }));
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    return (
        <div className="min-h-screen bg-[#fff7f7] p-4">
            {message && (
                <div className={`mb-4 px-4 py-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Header */}
            <div className="bg-[#a31621] text-white px-6 py-4 rounded-t-xl flex flex-wrap items-center justify-between">
                <h1 className="text-xl font-semibold">Client Management</h1>
                <div className="flex flex-wrap gap-2 items-center">
                    <input
                        type="text"
                        placeholder="Search by name, email or tax ID"
                        className="rounded px-3 py-1 text-gray-700"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button
                        label="Add Client"
                        className="bg-white text-[#a31621] hover:bg-gray-100"
                        onClick={() => {
                            setNewClient({ 
                                status: 'Active',
                                client_type: 'Individual',
                                taxpayer_type: 'Physical Person'
                            });
                            setEditingClient(null);
                            setShowForm(true);
                        }}
                    />
                </div>
            </div>

            {/* Popup Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl relative">
                        <button
                            className="absolute top-4 right-4 cursor-pointer text-red-600 hover:text-red-800"
                            onClick={() => {
                                setShowForm(false);
                                setEditingClient(null);
                            }}
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-lg font-semibold mb-4 text-[#08415c]">
                            {editingClient ? 'Edit Client' : 'Register New Client'}
                        </h2>
                        
                        <div className="grid grid-cols-2 gap-4">
                            {/* Client Type */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Client Type</label>
                                <select 
                                    value={newClient.client_type || 'Individual'} 
                                    className="border p-2 rounded w-full"
                                    onChange={(e) => setNewClient({ ...newClient, client_type: e.target.value as 'Individual' | 'Business' })}
                                >
                                    <option value="Individual">Individual</option>
                                    <option value="Business">Business</option>
                                </select>
                            </div>

                            {/* Taxpayer Type */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Taxpayer Type</label>
                                <select 
                                    value={newClient.taxpayer_type || 'Physical Person'} 
                                    className="border p-2 rounded w-full"
                                    onChange={(e) => setNewClient({ ...newClient, taxpayer_type: e.target.value as 'Physical Person' | 'Legal Entity' })}
                                >
                                    <option value="Physical Person">Physical Person</option>
                                    <option value="Legal Entity">Legal Entity</option>
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium mb-1">Status</label>
                                <select 
                                    value={newClient.status || 'Active'} 
                                    className="border p-2 rounded w-full"
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
                                    <label className="block text-sm font-medium mb-1">Business Name</label>
                                    <input 
                                        placeholder="Business Name" 
                                        value={newClient.business_name || ''} 
                                        className="border p-2 rounded w-full" 
                                        onChange={(e) => setNewClient({ ...newClient, business_name: e.target.value })} 
                                    />
                                </div>
                            )}

                            {/* Name fields - Solo si es Individual */}
                            {newClient.client_type === 'Individual' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">First Name *</label>
                                        <input 
                                            placeholder="First Name" 
                                            value={newClient.first_name || ''} 
                                            className="border p-2 rounded w-full" 
                                            onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })} 
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Last Name *</label>
                                        <input 
                                            placeholder="Last Name" 
                                            value={newClient.last_name || ''} 
                                            className="border p-2 rounded w-full" 
                                            onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })} 
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1">Email *</label>
                                <input 
                                    type="email"
                                    placeholder="Email" 
                                    value={newClient.email || ''} 
                                    className="border p-2 rounded w-full" 
                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} 
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Tax ID *</label>
                                <input 
                                    placeholder="RFC / Tax ID" 
                                    value={newClient.tax_id || ''} 
                                    className="border p-2 rounded w-full" 
                                    onChange={(e) => setNewClient({ ...newClient, tax_id: e.target.value })} 
                                    required
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Address *</label>
                                <input 
                                    placeholder="Address" 
                                    value={newClient.address || ''} 
                                    className="border p-2 rounded w-full" 
                                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} 
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone *</label>
                                <input 
                                    placeholder="Phone" 
                                    value={newClient.phone || ''} 
                                    className="border p-2 rounded w-full" 
                                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} 
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Mobile Phone</label>
                                <input 
                                    placeholder="Mobile Phone" 
                                    value={newClient.mobile_phone || ''} 
                                    className="border p-2 rounded w-full" 
                                    onChange={(e) => setNewClient({ ...newClient, mobile_phone: e.target.value })} 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">City *</label>
                                <input 
                                    placeholder="City" 
                                    value={newClient.city || ''} 
                                    className="border p-2 rounded w-full" 
                                    onChange={(e) => setNewClient({ ...newClient, city: e.target.value })} 
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">State *</label>
                                <input 
                                    placeholder="State" 
                                    value={newClient.state || ''} 
                                    className="border p-2 rounded w-full" 
                                    onChange={(e) => setNewClient({ ...newClient, state: e.target.value })} 
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">Country *</label>
                                <input 
                                    placeholder="Country" 
                                    value={newClient.country || ''} 
                                    className="border p-2 rounded w-full" 
                                    onChange={(e) => setNewClient({ ...newClient, country: e.target.value })} 
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium mb-1">ZIP Code *</label>
                                <input 
                                    placeholder="ZIP Code" 
                                    value={newClient.zip_code || ''} 
                                    className="border p-2 rounded w-full" 
                                    onChange={(e) => setNewClient({ ...newClient, zip_code: e.target.value })} 
                                    required
                                />
                            </div>
                            
                            <div className="col-span-2">
                                <label className="block text-sm font-medium mb-1">Notes</label>
                                <textarea 
                                    placeholder="Notes (optional)" 
                                    value={newClient.notes || ''} 
                                    className="border p-2 rounded w-full" 
                                    rows={3}
                                    onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })} 
                                />
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end gap-2">
                            <Button 
                                label="Cancel" 
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingClient(null);
                                }}
                                className="bg-gray-500 hover:bg-gray-600 text-white" 
                            />
                            <Button 
                                label={editingClient ? "Update" : "Save"} 
                                onClick={handleSaveClient} 
                                className="bg-green-700 hover:bg-green-800 text-white" 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Filters */}
            <div className="flex">
                <div className="w-40 bg-white shadow rounded-bl-xl p-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Filter by Status</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li 
                            onClick={() => setFilter('All')} 
                            className={`cursor-pointer hover:text-blue-600 ${filter === 'All' ? 'font-bold text-blue-600' : ''}`}
                        >
                            All ({pagination.total})
                        </li>
                        <li 
                            onClick={() => setFilter('Active')} 
                            className={`cursor-pointer hover:text-green-600 ${filter === 'Active' ? 'font-bold text-green-600' : ''}`}
                        >
                            Active
                        </li>
                        <li 
                            onClick={() => setFilter('Inactive')} 
                            className={`cursor-pointer hover:text-yellow-600 ${filter === 'Inactive' ? 'font-bold text-yellow-600' : ''}`}
                        >
                            Inactive
                        </li>
                        <li 
                            onClick={() => setFilter('Blocked')} 
                            className={`cursor-pointer hover:text-red-600 ${filter === 'Blocked' ? 'font-bold text-red-600' : ''}`}
                        >
                            Blocked
                        </li>
                    </ul>
                </div>

                {/* Table */}
                <div className="flex-1 bg-white shadow p-4 overflow-auto rounded-br-xl">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading clients...</div>
                    ) : (
                        <>
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs bg-[#ffdddd]">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">Client Type</th>
                                        <th className="p-2">Taxpayer Type</th>
                                        <th className="p-2">Tax ID</th>
                                        <th className="p-2">Email</th>
                                        <th className="p-2">Phone</th>
                                        <th className="p-2">City</th>
                                        <th className="p-2">State</th>
                                        <th className="p-2">Status</th>
                                        <th className="p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client) => (
                                        <tr key={client.client_id} className="border-t hover:bg-gray-50">
                                            <td className="p-2">
                                                {client.client_type === 'Business' 
                                                    ? client.business_name 
                                                    : `${client.first_name || ''} ${client.last_name || ''}`}
                                            </td>
                                            <td className="p-2">{client.client_type}</td>
                                            <td className="p-2">{client.taxpayer_type}</td>
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
                                            <td className="p-2">
                                                <button
                                                    onClick={() => openEditForm(client)}
                                                    className="text-blue-600 hover:text-blue-800"
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
                                <p className="text-gray-500 mt-4 text-center">No clients found.</p>
                            )}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && (
                                <div className="mt-4 flex justify-center gap-2">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                        disabled={pagination.page === 1}
                                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-3 py-1">
                                        Page {pagination.page} of {pagination.totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                                        disabled={pagination.page === pagination.totalPages}
                                        className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
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
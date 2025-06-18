'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import { Pencil, X } from 'lucide-react';

interface Client {
    _id: string;
    client_type: 'Individual' | 'Business';
    taxpayer_type: 'Physical' | 'Legal';
    business_name?: string;
    first_name: string;
    last_name: string;
    tax_id: string;
    email: string;
    phone: string;
    mobile_phone: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    notes?: string;
    status: 'Active' | 'Inactive' | 'Blocked';
    createdAt: string;
}

export default function ClientPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [filter, setFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [search, setSearch] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [newClient, setNewClient] = useState<Partial<Client>>({ status: 'Active' });
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetch('http://localhost:5000/api/clients')
            .then((res) => res.json())
            .then(setClients);
    }, []);

    const handleSaveClient = async () => {
        try {
            if (editingClient) {
                const res = await fetch(`http://localhost:5000/api/clients/${editingClient._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newClient),
                });
                const updated = await res.json();
                setClients((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));
                setMessage({ type: 'success', text: 'Cliente actualizado correctamente.' });
            } else {
                const response = await fetch('http://localhost:5000/api/clients', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newClient),
                });
                if (!response.ok) throw new Error('Error al registrar el cliente.');
                const created = await response.json();
                setClients((prev) => [...prev, created]);
                setMessage({ type: 'success', text: 'Cliente registrado correctamente.' });
            }
            setShowForm(false);
            setEditingClient(null);
            setNewClient({ status: 'Active' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Ocurrió un error al guardar el cliente.' });
        } finally {
            setTimeout(() => setMessage(null), 4000);
        }
    };

    const filteredClients = clients.filter((c) => {
        const matchStatus = filter === 'All' || c.status === filter;
        const matchSearch = `${c.first_name} ${c.last_name}`
            .toLowerCase()
            .includes(search.toLowerCase());
        return matchStatus && matchSearch;
    });

    const openEditForm = (client: Client) => {
        setNewClient(client);
        setEditingClient(client);
        setShowForm(true);
    };

    return (
        <div className="min-h-screen bg-[#fff7f7] p-4">
            {message && (
                <div className={`mb-4 px-4 py-2 rounded text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            {/* Header */}
            <div className="bg-[#a31621] text-white px-6 py-4 rounded-t-xl flex flex-wrap items-center justify-between">
                <h1 className="text-xl font-semibold">Gestión de Clientes</h1>
                <div className="flex flex-wrap gap-2 items-center">
                    <input type="date" className="rounded px-2 py-1 text-gray-700" />
                    <input type="date" className="rounded px-2 py-1 text-gray-700" />
                    <input
                        type="text"
                        placeholder="Buscar por Nombre"
                        className="rounded px-3 py-1 text-gray-700"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button
                        label="Add client"
                        className="bg-[#a31621] hover:bg-[#7c101a] text-white"
                        onClick={() => {
                            setNewClient({ status: 'Active' });
                            setEditingClient(null);
                            setShowForm(true);
                        }}
                    />
                </div>
            </div>

            {/* Popup Form */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white border rounded-xl p-6 w-full max-w-2xl shadow-xl relative">
                        <button
                            className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-xl"
                            onClick={() => {
                                setShowForm(false);
                                setEditingClient(null);
                            }}
                        >
                            &times;
                        </button>
                        <h2 className="text-lg font-semibold mb-4 text-[#08415c]">
                            {editingClient ? 'Editar Cliente' : 'Registrar Cliente'}
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder="Nombre" value={newClient.first_name || ''} className="border p-2 rounded" onChange={(e) => setNewClient({ ...newClient, first_name: e.target.value })} />
                            <input placeholder="Apellido" value={newClient.last_name || ''} className="border p-2 rounded" onChange={(e) => setNewClient({ ...newClient, last_name: e.target.value })} />
                            <input placeholder="Email" value={newClient.email || ''} className="border p-2 rounded" onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
                            <input placeholder="RFC / ID" value={newClient.tax_id || ''} className="border p-2 rounded" onChange={(e) => setNewClient({ ...newClient, tax_id: e.target.value })} />
                            <input placeholder="Dirección" value={newClient.address || ''} className="border p-2 rounded" onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} />
                            <input placeholder="Teléfono" value={newClient.phone || ''} className="border p-2 rounded" onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} />
                            <input placeholder="Ciudad" value={newClient.city || ''} className="border p-2 rounded" onChange={(e) => setNewClient({ ...newClient, city: e.target.value })} />
                            <input placeholder="Estado" value={newClient.state || ''} className="border p-2 rounded" onChange={(e) => setNewClient({ ...newClient, state: e.target.value })} />
                            <input placeholder="País" value={newClient.country || ''} className="border p-2 rounded" onChange={(e) => setNewClient({ ...newClient, country: e.target.value })} />
                            <input placeholder="Código Postal" value={newClient.zip_code || ''} className="border p-2 rounded" onChange={(e) => setNewClient({ ...newClient, zip_code: e.target.value })} />
                            <textarea placeholder="Notas" value={newClient.notes || ''} className="border p-2 rounded col-span-2" onChange={(e) => setNewClient({ ...newClient, notes: e.target.value })} />
                        </div>
                        <div className="mt-4 flex justify-end">
                            <Button label="Guardar" onClick={handleSaveClient} className="bg-green-700 hover:bg-green-800 text-white" />
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar Filters */}
            <div className="flex">
                <div className="w-40 bg-white shadow rounded-bl-xl p-4">
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li onClick={() => setFilter('All')} className="cursor-pointer hover:text-[#08415c]">Todos</li>
                        <li onClick={() => setFilter('Active')} className="cursor-pointer hover:text-green-600">Activo</li>
                        <li onClick={() => setFilter('Inactive')} className="cursor-pointer hover:text-red-600">Inactivo</li>
                    </ul>
                </div>

                {/* Table */}
                <div className="flex-1 bg-white shadow p-4 overflow-auto rounded-br-xl">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs bg-[#ffdddd]">
                            <tr>
                                <th className="p-2">Nombre</th>
                                <th className="p-2">Tipo Cliente</th>
                                <th className="p-2">Tipo Doc.</th>
                                <th className="p-2">RFC / ID</th>
                                <th className="p-2">Dirección</th>
                                <th className="p-2">Ciudad</th>
                                <th className="p-2">Estado</th>
                                <th className="p-2">País</th>
                                <th className="p-2">Teléfono</th>
                                <th className="p-2">F. de Creación</th>
                                <th className="p-2">Notas</th>
                                <th className="p-2">Estado</th>
                                <th className="p-2">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((client) => (
                                <tr key={client._id} className="border-t">
                                    <td className="p-2">{client.first_name} {client.last_name}</td>
                                    <td className="p-2">{client.client_type}</td>
                                    <td className="p-2">{client.taxpayer_type}</td>
                                    <td className="p-2">{client.tax_id}</td>
                                    <td className="p-2">{client.address}</td>
                                    <td className="p-2">{client.city}</td>
                                    <td className="p-2">{client.state}</td>
                                    <td className="p-2">{client.country}</td>
                                    <td className="p-2">{client.phone}</td>
                                    <td className="p-2">{new Date(client.createdAt).toLocaleString()}</td>
                                    <td className="p-2 whitespace-pre-wrap break-words">{client.notes || '-'}</td>
                                    <td className="p-2">
                                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {client.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-2">
                                        <button
                                            onClick={() => openEditForm(client)}
                                            className="text-blue-600 hover:text-blue-800"
                                            title="Editar"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredClients.length === 0 && (
                        <p className="text-gray-500 mt-4">No hay clientes que coincidan con el filtro.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

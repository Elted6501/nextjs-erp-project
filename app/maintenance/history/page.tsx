'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaCar,
  FaCalendarAlt,
  FaSignOutAlt,
  FaUserTie,
  FaTools,
} from 'react-icons/fa';

export default function HistoryPage() {
  const [client, setClient] = useState('');
  const [car, setCar] = useState('');
  const [historyVisible, setHistoryVisible] = useState(false);
  const router = useRouter();

  const handleSearch = () => {
    setHistoryVisible(true);
  };

  const handleFinish = () => {
    router.push('/maintenance');
  };

  const mockHistory = [
    {
      car: 'Toyota Corolla 2020',
      date: '2025-05-10',
      entryDate: '2025-05-08',
      exitDate: '2025-05-11',
      mechanic: 'John Doe',
      services: ['Oil Change', 'Tire Rotation'],
    },
    {
      car: 'Toyota Corolla 2020',
      date: '2025-02-22',
      entryDate: '2025-02-20',
      exitDate: '2025-02-23',
      mechanic: 'Jane Smith',
      services: ['Brake Inspection'],
    },
    {
      car: 'Honda Civic 2019',
      date: '2025-04-05',
      entryDate: '2025-04-04',
      exitDate: '2025-04-06',
      mechanic: 'Mike Johnson',
      services: ['Battery Replacement'],
    }
  ];

  const filteredHistory = mockHistory.filter(h => car ? h.car === car : true);

  return (
    <main className="min-h-screen px-6 py-10 text-black" style={{ backgroundColor: '#ecebeb' }}>
      <div className="max-w-4xl mx-auto p-8 rounded-xl shadow space-y-8 border border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-red-600 text-center">Service History</h1>

        {!historyVisible && (
          <div className="space-y-6">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Client</label>
              <select
                className="w-full bg-gradient-to-b from-[#7a0c0c] to-[#b31217] text-white border border-red-700 p-3 rounded-lg appearance-none shadow"
                value={client}
                onChange={(e) => setClient(e.target.value)}
              >
                <option value="">-- Select Client --</option>
                <option value="Luis M.">Luis M.</option>
                <option value="Carlos G.">Carlos G.</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-semibold text-gray-700">Car</label>
              <select
                className="w-full bg-gradient-to-b from-[#7a0c0c] to-[#b31217] text-white border border-red-700 p-3 rounded-lg appearance-none shadow"
                value={car}
                onChange={(e) => setCar(e.target.value)}
              >
                <option value="">-- All Cars --</option>
                <option value="Toyota Corolla 2020">Toyota Corolla 2020</option>
                <option value="Honda Civic 2019">Honda Civic 2019</option>
              </select>
            </div>

            <button
              onClick={handleSearch}
              disabled={!client}
              className="bg-red-700 hover:bg-red-900 px-6 py-3 rounded-lg shadow text-white w-full disabled:opacity-40"
            >
              Search History
            </button>
          </div>
        )}

        {historyVisible && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-700">Client: {client}</h2>

            <div className="border-l-4 border-red-700 pl-6 space-y-6">
              {filteredHistory.map((entry, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline icon */}
                  <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-red-700 flex items-center justify-center text-white">
                    <FaCalendarAlt size={12} />
                  </div>

                  {/* Entry details */}
                  <div className="bg-neutral-100 p-4 rounded-md shadow text-sm space-y-2">
                    <div className="text-red-600 font-semibold">{entry.date}</div>

                    <div className="flex items-center gap-2">
                      <FaCar className="text-red-600" />
                      <span className="text-gray-800">{entry.car}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-red-600" />
                      <span className="text-gray-800">Entry: {entry.entryDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaSignOutAlt className="text-red-600" />
                      <span className="text-gray-800">Exit: {entry.exitDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaUserTie className="text-red-600" />
                      <span className="text-gray-800">Mechanic: {entry.mechanic}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaTools className="text-red-600" />
                      <span className="text-gray-800">Services: {entry.services.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleFinish}
                className="bg-red-700 hover:bg-red-900 px-6 py-3 rounded-lg shadow text-white"
              >
                Finalize
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

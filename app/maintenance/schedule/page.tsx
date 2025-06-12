'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  addDays,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isBefore,
  isAfter,
  eachDayOfInterval,
} from 'date-fns';

function Calendar({
  selected,
  onSelect,
  fromDate = new Date(),
  toDate = addDays(new Date(), 30),
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });

  const isDisabled = (date) => isBefore(date, fromDate) || isAfter(date, toDate);

  return (
    <div className="text-black space-y-2">
      <div className="flex justify-between items-center mb-2">
        <button onClick={() => setCurrentMonth(addDays(currentMonth, -30))} className="text-red-600">‹</button>
        <span className="font-semibold text-lg text-red-600">{format(currentMonth, 'MMMM yyyy')}</span>
        <button onClick={() => setCurrentMonth(addDays(currentMonth, 30))} className="text-red-600">›</button>
      </div>
      <div className="grid grid-cols-7 text-center font-medium text-sm text-red-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="grid grid-cols-7 text-center text-sm">
        {days.map((date) => {
          const isSelected = selected && isSameDay(selected, date);
          const isInMonth = isSameMonth(date, currentMonth);
          const isDisabledDay = isDisabled(date);

          return (
            <button
              key={date.toISOString()}
              disabled={isDisabledDay}
              onClick={() => onSelect(date)}
              className={`p-2 m-1 rounded-full transition-all
                ${isDisabledDay ? 'text-gray-400' : ''}
                ${isSelected ? 'bg-gradient-to-br from-red-700 to-red-500 text-white shadow-lg' : ''}
                ${!isInMonth ? 'text-gray-400' : ''}
                ${isToday(date) ? 'border border-red-500' : ''}
                hover:bg-red-100`}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SchedulePage() {
  const [step, setStep] = useState(1);
  const [client, setClient] = useState('');
  const [car, setCar] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [mechanic, setMechanic] = useState('Any');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [assignedMechanic, setAssignedMechanic] = useState('');
  const [appointmentId, setAppointmentId] = useState('');

  const router = useRouter();

  const services = [
    { name: 'Oil Change', price: 29.99 },
    { name: 'Brake Inspection', price: 49.99 },
    { name: 'Engine Diagnostic', price: 89.99 },
    { name: 'Tire Rotation', price: 19.99 },
  ];

  const mechanics = ['Any', 'John Doe', 'Jane Smith', 'Mike Johnson'];

  const toggleService = (serviceName) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  const total = services
    .filter((s) => selectedServices.includes(s.name))
    .reduce((sum, s) => sum + s.price, 0);

  useEffect(() => {
    if (mechanic === 'Any' && selectedDate && selectedTime) {
      const availableMechanics = mechanics.filter((m) => m !== 'Any');
      const randomMechanic =
        availableMechanics[Math.floor(Math.random() * availableMechanics.length)];
      setAssignedMechanic(randomMechanic);
    } else if (mechanic !== 'Any') {
      setAssignedMechanic(mechanic);
    }
  }, [mechanic, selectedDate, selectedTime]);

  useEffect(() => {
    if (step === 4) {
      const id = `APT-${Math.floor(100000 + Math.random() * 900000)}`;
      setAppointmentId(id);
    }
  }, [step]);

  return (
    <main className="min-h-screen text-white px-6 py-10 bg-[#ecebeb]">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
        <h1 className="text-3xl font-bold text-red-600 text-center">Schedule a Maintenance Appointment</h1>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block mb-1 text-red-600">Client</label>
              <select
                className="w-full bg-gradient-to-b from-[#7a0c0c] to-[#b31217] text-white border border-red-700 p-3 rounded-xl shadow appearance-none"
                value={client}
                onChange={(e) => setClient(e.target.value)}
              >
                <option value="">-- Select Client --</option>
                <option value="Luis M.">Luis M.</option>
                <option value="Carlos G.">Carlos G.</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 text-red-600">Car</label>
              <select
                className="w-full bg-gradient-to-b from-[#7a0c0c] to-[#b31217] text-white border border-red-700 p-3 rounded-xl shadow appearance-none"
                value={car}
                onChange={(e) => setCar(e.target.value)}
              >
                <option value="">-- Select Car --</option>
                <option value="Toyota Corolla">Toyota Corolla</option>
                <option value="Honda Civic">Honda Civic</option>
              </select>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!client || !car}
              className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 px-6 py-3 rounded-xl text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-red-600">Select Services</label>
              <div className="grid grid-cols-2 gap-4">
                {services.map((s) => (
                  <div
                    key={s.name}
                    className={`p-3 rounded-xl border cursor-pointer transition-all
                      ${selectedServices.includes(s.name)
                        ? 'bg-gradient-to-r from-red-700 to-red-500 text-white border-red-500 shadow-md'
                        : 'bg-white text-black border-red-300 hover:bg-red-50'}`}
                    onClick={() => toggleService(s.name)}
                  >
                    <p>{s.name}</p>
                    <p className="text-sm text-red-500">${s.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block mb-1 text-red-600">Select Mechanic</label>
              <select
                className="w-full bg-gradient-to-b from-[#7a0c0c] to-[#b31217] text-white border border-red-700 p-3 rounded-xl shadow appearance-none"
                value={mechanic}
                onChange={(e) => setMechanic(e.target.value)}
              >
                {mechanics.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div className="bg-white text-black p-4 rounded-xl border border-red-500">
              <p className="text-lg font-semibold mb-2 text-red-600">Selected Services:</p>
              <ul className="space-y-1">
                {services
                  .filter((s) => selectedServices.includes(s.name))
                  .map((s) => (
                    <li key={s.name} className="flex justify-between">
                      <span>{s.name}</span>
                      <span>${s.price.toFixed(2)}</span>
                    </li>
                  ))}
              </ul>
              <hr className="my-2 border-red-400" />
              <p className="font-bold text-lg text-red-700">Total: ${total.toFixed(2)}</p>
            </div>
            <button
              onClick={() => setStep(3)}
              disabled={selectedServices.length === 0}
              className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 px-6 py-3 rounded-xl text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div>
                <label className="block mb-2 text-red-700 font-semibold">Choose Date</label>
                <div className="bg-gray-50 rounded-xl border border-gray-300 shadow-md p-4 h-full">
                  <Calendar selected={selectedDate} onSelect={setSelectedDate} />
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl border border-gray-300 shadow-md p-4 h-full">
                <h3 className="mb-4 text-red-700 font-semibold text-lg">Available Times</h3>
                <ul className="space-y-3">
                  {['09:00 AM', '10:30 AM', '01:00 PM', '03:30 PM'].map((time) => (
                    <li
                      key={time}
                      className={`cursor-pointer rounded-lg px-4 py-2 border bg-white text-red-700 font-medium transition-colors
                        ${
                          selectedTime === time
                            ? 'bg-gradient-to-r from-red-700 to-red-500 text-white border-transparent shadow-lg'
                            : 'border-gray-300 hover:border-red-400 hover:text-red-600'
                        }`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {selectedDate && selectedTime && (
              <div className="bg-gray-100 rounded-xl border border-gray-300 shadow-md p-4 text-gray-800 font-semibold">
                <p>
                  <strong>Selected:</strong> {selectedDate.toLocaleDateString()} at {selectedTime}
                </p>
              </div>
            )}
            <button
              onClick={() => setStep(4)}
              disabled={!selectedDate || !selectedTime}
              className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 px-6 py-3 rounded-xl text-white disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}

{step === 4 && (
  <div className="flex flex-col items-center space-y-6">
    <h2 className="text-2xl font-bold text-red-700">Appointment Summary</h2>
    <div className="bg-white border border-red-400 shadow-md rounded-xl px-6 py-4 max-w-3xl w-full font-mono text-gray-900">
      <div className="grid grid-cols-3 gap-x-8 text-sm font-semibold text-red-600 border-b border-red-200 pb-2 mb-2">
        <div>Appointment ID</div>
        <div>Client</div>
        <div>Car</div>
      </div>
      <div className="grid grid-cols-3 gap-x-8 text-sm border-b border-red-100 pb-2 mb-4">
        <div>{appointmentId}</div>
        <div>{client}</div>
        <div>{car}</div>
      </div>

      <div className="text-sm font-semibold text-red-600 border-b border-red-200 pb-1 mb-1">Services</div>
      <div className="text-sm border-b border-red-100 pb-3 mb-4">{selectedServices.join(', ') || 'None'}</div>

      <div className="grid grid-cols-2 gap-x-8 text-sm font-semibold text-red-600 border-b border-red-200 pb-2 mb-2">
        <div>Total</div>
        <div>Date & Time</div>
      </div>
      <div className="grid grid-cols-2 gap-x-8 text-sm border-b border-red-100 pb-2 mb-4">
        <div>${total.toFixed(2)}</div>
        <div>{selectedDate?.toLocaleDateString()} at {selectedTime}</div>
      </div>

      <div className="text-sm font-semibold text-red-600 pb-1">Mechanic</div>
      <div className="text-sm">{assignedMechanic}</div>
    </div>

    <div className="flex space-x-4">
      <button
        onClick={() => router.push('/maintenance')}
        className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 px-5 py-2 rounded-lg text-white text-sm font-semibold shadow"
      >
        Finish
      </button>
      <button
        onClick={() => {
          const printContents = document.querySelector('div.bg-white.border').innerHTML;
          const originalContents = document.body.innerHTML;
          document.body.innerHTML = printContents;
          window.print();
          document.body.innerHTML = originalContents;
          window.location.reload();
        }}
        className="bg-white border border-red-600 text-red-600 hover:bg-red-50 px-5 py-2 rounded-lg text-sm font-semibold shadow transition-colors"
      >
        Print / Download
      </button>
    </div>
  </div>
)}





      </div>
    </main>
  );
}

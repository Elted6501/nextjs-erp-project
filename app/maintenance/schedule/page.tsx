'use client';

import React, { useState, useEffect } from 'react';

import Schedule from '@/components/Maintenance/schedule';
import ScheduleServices from '@/components/Maintenance/ScheduleServices';
import ScheduleAppointment from '@/components/Maintenance/ScheduleAppointment';
import ScheduleResults from '@/components/Maintenance/ScheduleResults';

export default function SchedulePage() {
  const [step, setStep] = useState<number>(1);
  const [client, setClient] = useState<string>('');
  const [clients, setClients] = useState<any[]>(['']);
  const [car, setCar] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [mechanic, setMechanic] = useState<string>('Any');
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [assignedMechanic, setAssignedMechanic] = useState<string>('');
  const [appointmentId, setAppointmentId] = useState<string>('');

  const services = [
    { name: 'Oil Change', price: 29.99 },
    { name: 'Brake Inspection', price: 49.99 },
    { name: 'Engine Diagnostic', price: 89.99 },
    { name: 'Tire Rotation', price: 19.99 },
  ];

  const total = services
    .filter((s) => selectedServices.includes(s.name))
    .reduce((sum, s) => sum + s.price, 0);

  useEffect(() => {
    if (mechanic === 'Any' && selectedDate && selectedTime) {
      const availableMechanics = mechanics.filter((m) => m !== 'Any');
      const randomMechanic =
        availableMechanics[
          Math.floor(Math.random() * availableMechanics.length)
        ];
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

  async function getClients(): Promise<void> {
    const response = await fetch(
      'http://localhost:3000/api/maintenance/schedule/clients'
    );
    const data = await response.json();

    if (data.error) {
      console.error(data.error);
    } else {
      setClients(data.clients);
    }
  }

  async function getMechanics(): Promise<void> {
    const response = await fetch(
      'http://localhost:3000/api/maintenance/schedule/mechanics'
    );
    const data = await response.json();

    if (data.error) {
      console.error(data.error);
    } else {
      setMechanics(data.data);
    }

    console.log(mechanics);
  }

  useEffect(() => {
    (async () => {
      await getClients();
      await getMechanics();
    })();
  }, []);

  return (
    <main className="min-h-screen text-white px-6 py-10 bg-[#ecebeb]">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
        <h1 className="text-3xl font-bold text-red-600 text-center">
          Schedule a Maintenance Appointment
        </h1>

        {step === 1 && (
          <Schedule
            car={car}
            client={client}
            setCar={setCar}
            setClient={setClient}
            setStep={setStep}
            clients={clients}
          ></Schedule>
        )}

        {step === 2 && (
          <ScheduleServices
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            mechanic={mechanic}
            mechanics={mechanics}
            setMechanic={setMechanic}
            setStep={setStep}
            total={total}
          ></ScheduleServices>
        )}

        {step === 3 && (
          <ScheduleAppointment
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            setSelectedDate={setSelectedDate}
            setSelectedTime={setSelectedTime}
            setStep={setStep}
          ></ScheduleAppointment>
        )}

        {step === 4 && (
          <ScheduleResults
            appointmentId={appointmentId}
            assignedMechanic={assignedMechanic}
            car={car}
            client={client}
            selectedDate={selectedDate}
            selectedServices={selectedServices}
            selectedTime={selectedTime}
            total={total}
          ></ScheduleResults>
        )}
      </div>
    </main>
  );
}

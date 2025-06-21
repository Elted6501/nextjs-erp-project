"use client";

import React, { useEffect, useState } from "react";

import ScheduleAppointment from "@/components/Maintenance/ScheduleAppointment";
import ScheduleResults from "@/components/Maintenance/ScheduleResults";
import ScheduleServices from "@/components/Maintenance/ScheduleServices";

type Mechanic = {
  id: string;
  first_name: string;
  last_name: string;
};

function Schedule({
  client,
  setClient,
  car,
  setCar,
  setStep,
}: {
  client: string;
  setClient: (value: string) => void;
  car: string;
  setCar: (value: string) => void;
  setStep: (step: number) => void;
}) {
  const [brand, setBrand] = React.useState("");
  const [model, setModel] = React.useState("");
  const [year, setYear] = React.useState("");
  const [plates, setPlates] = React.useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!client || !brand || !model || !year || !plates) {
      alert("Por favor, completa todos los campos");
      return;
    }
    setCar(`${brand} ${model} ${year} - ${plates}`);
    setStep(2);
  }

  return (
    <form onSubmit={handleSubmit} className="text-gray-800">
      {/* ... Inputs como los tienes ... */}
      <div className="grid grid-cols-2 gap-6">
        {/* Cliente */}
        <div>
          <label className="block font-semibold mb-2">Nombre del cliente</label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej. Juan Pérez"
            required
          />
        </div>
        {/* Marca */}
        <div>
          <label className="block font-semibold mb-2">Marca del auto</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej. Toyota"
            required
          />
        </div>
        {/* Modelo */}
        <div>
          <label className="block font-semibold mb-2">Modelo del auto</label>
          <input
            type="text"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej. Corolla"
            required
          />
        </div>
        {/* Año */}
        <div>
          <label className="block font-semibold mb-2">Año del auto</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej. 2018"
            min="1900"
            max={new Date().getFullYear()}
            required
          />
        </div>
        {/* Placas */}
        <div className="col-span-2">
          <label className="block font-semibold mb-2">Placas</label>
          <input
            type="text"
            value={plates}
            onChange={(e) => setPlates(e.target.value)}
            className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Ej. ABC1234"
            required
          />
        </div>
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700 transition"
        >
          Guardar y continuar
        </button>
      </div>
    </form>
  );
}

export default function SchedulePage() {
  const [step, setStep] = useState<number>(1);
  const [client, setClient] = useState<string>("");
  const [clients, setClients] = useState<string[]>([]);
  const [car, setCar] = useState<string>("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [mechanic, setMechanic] = useState<string>("Any");
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [assignedMechanic, setAssignedMechanic] = useState<
    Mechanic | null | undefined
  >(null);
  const [appointmentId, setAppointmentId] = useState<string>("");

  const services = [
    { name: "Oil Change", price: 29.99 },
    { name: "Brake Inspection", price: 49.99 },
    { name: "Engine Diagnostic", price: 89.99 },
    { name: "Tire Rotation", price: 19.99 },
  ];

  const total = services
    .filter((s) => selectedServices.includes(s.name))
    .reduce((sum, s) => sum + s.price, 0);

  useEffect(() => {
    if (
      mechanic === "Any" &&
      selectedDate &&
      selectedTime &&
      mechanics.length > 0
    ) {
      const availableMechanics = mechanics.filter((m) => m.id !== "Any");
      if (availableMechanics.length === 0) {
        setAssignedMechanic(null);
        return;
      }
      const randomMechanic =
        availableMechanics[
          Math.floor(Math.random() * availableMechanics.length)
        ];
      setAssignedMechanic(randomMechanic);
    } else if (mechanic !== "Any") {
      const found = mechanics.find((m) => m.id === mechanic);
      setAssignedMechanic(found || null);
    } else {
      setAssignedMechanic(null);
    }
  }, [mechanic, selectedDate, selectedTime, mechanics]);

  useEffect(() => {
    if (step === 4) {
      const id = `APT-${Math.floor(100000 + Math.random() * 900000)}`;
      setAppointmentId(id);
    }
  }, [step]);

  async function getClients(): Promise<void> {
    try {
      const response = await fetch("../api/maintenance/schedule/clients");
      const data = await response.json();

      if (data.error) {
        console.error(data.error);
      } else {
        setClients(data.clients);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function getMechanics(): Promise<void> {
    try {
      const response = await fetch("../api/maintenance/schedule/mechanics");
      const data = await response.json();

      if (data.error) {
        console.error(data.error);
      } else {
        // Espera que data.data sea array de {id, name}
        setMechanics(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    getClients();
    getMechanics();
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
          />
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
          />
        )}

        {step === 3 && (
          <ScheduleAppointment
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            setSelectedDate={setSelectedDate}
            setSelectedTime={setSelectedTime}
            setStep={setStep}
          />
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
          />
        )}
      </div>
    </main>
  );
}

"use client";

import React, { useEffect, useState } from "react";

import ScheduleAppointment from "@/components/Maintenance/ScheduleAppointment";
import ScheduleResults from "@/components/Maintenance/ScheduleResults";
import ScheduleServices from "@/components/Maintenance/ScheduleServices";
import { CarType, Mechanic, ServicesType } from "@/Types/Maintenance/schedule";
import Inputs from "@/components/Maintenance/Inputs";

export default function SchedulePage() {
  const [step, setStep] = useState<number>(1);
  const [client, setClient] = useState<string>("");
  const [services, setServices] = useState<ServicesType[]>([]);
  const [car, setCar] = useState<CarType>({ brand: '', model: '', year: '', plates: '', });
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [mechanic, setMechanic] = useState<Mechanic>({ employee_id: 0, first_name: 'Any', last_name: 'Any' });
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [assignedMechanic, setAssignedMechanic] = useState<Mechanic | null | undefined>(null);
  const [appointmentId, setAppointmentId] = useState<string>("");
  const [brand, setBrand] = React.useState("");
  const [model, setModel] = React.useState("");
  const [year, setYear] = React.useState("");
  const [plates, setPlates] = React.useState("");

  async function getServices() {
    try {
      const response = await fetch("../api/maintenance/schedule/services");
      const data = await response.json();

      if (data.error) {
        console.error(data.error);
      } else {
        setServices(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  }

  const total: number = services.filter((s) => selectedServices.includes(s.name)).reduce((sum, s) => sum + s.service_price, 0);

  useEffect(() => {
    if (mechanic.first_name === "Any" && selectedDate && selectedTime && mechanics.length > 0) {
      const availableMechanics = mechanics.filter((m) => m.first_name !== "Any");

      if (availableMechanics.length === 0) {
        setAssignedMechanic(null);
        return;
      }

      const randomMechanic = availableMechanics[Math.floor(Math.random() * availableMechanics.length)];
      setAssignedMechanic(randomMechanic);

    } else if (mechanic.first_name !== "Any") {
      const found = mechanics.find((m) => m.employee_id === mechanic.employee_id);
      setAssignedMechanic(found || null);
    } else {
      setAssignedMechanic(null);
    }
  }, [mechanic, selectedDate, selectedTime, mechanics]);

  useEffect(() => {
    if (step === 3) {
      const id = `APT-${Math.floor(100000 + Math.random() * 900000)}`;
      setAppointmentId(id);
    }
  }, [step]);


  async function getMechanics(): Promise<void> {
    try {
      const response = await fetch("../api/maintenance/schedule/mechanics");
      const data = await response.json();

      if (data.error) {
        console.error(data.error);
      } else {
        setMechanics(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  }

    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (!client || !brand || !model || !year || !plates) {
        alert("Please, fill all the fields");
        return;
      }
      setCar({ brand, model, year, plates });
      setStep(2);
    }

  useEffect(() => {
    getMechanics();
    getServices();
  }, []);

  return (
    <main className="min-h-screen text-white px-6 py-10 bg-[#ecebeb]">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-xl space-y-8">
        <h1 className="text-3xl font-bold text-red-600 text-center">
          Schedule a Maintenance Appointment
        </h1>

        {step === 1 && (
  <form onSubmit={handleSubmit} className="text-gray-800">
      <div className="grid grid-cols-2 gap-6">
        <Inputs placeholder='Ej. Juan Pérez' setValue={setClient} value={client} title='Name of the client' />
        <Inputs placeholder='Ej. Toyota' setValue={setBrand} value={brand} title='Brand of the car' />
        <Inputs placeholder='Ej. Corolla' setValue={setModel} value={model} title='Model of the car' />
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
        <Inputs placeholder='Ej. ABC123' setValue={setPlates} value={plates} title='Plates' />
      </div>

      <div className="mt-6">
        <button
          type="submit"
          className="bg-red-600 text-white font-semibold px-6 py-2 rounded hover:bg-red-700 transition"
        >
          Save and continue
        </button>
      </div>
    </form>
        )}

        {step === 2 && (
          <ScheduleServices
            selectedServices={selectedServices}
            setSelectedServices={setSelectedServices}
            services={services}
            mechanic={mechanic}
            mechanics={mechanics}
            setMechanic={setMechanic}
            setStep={setStep}
            total={total}
          />
        )}

        {step === 3 && (
          <ScheduleAppointment
            appointmentId={appointmentId}
            Mechanic={mechanic}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            setSelectedDate={setSelectedDate}
            setSelectedTime={setSelectedTime}
            setStep={setStep}
            assignedMechanic={assignedMechanic}
            car={car}
            client={client}
            selectedServices={selectedServices}
          />
        )}

        {step >= 4 && (
          <ScheduleResults
            appointmentId={appointmentId}
            assignedMechanic={assignedMechanic}
            car={car}
            client={client}
            selectedDate={selectedDate}
            selectedServices={selectedServices}
            selectedTime={selectedTime}
            total={total}
            step={step}
          />
        )}
      </div>
    </main>
  );
}

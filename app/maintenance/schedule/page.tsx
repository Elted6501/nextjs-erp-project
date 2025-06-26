"use client";

import React, { useEffect, useState } from "react";

import ScheduleAppointment from "@/components/Maintenance/ScheduleAppointment";
import ScheduleResults from "@/components/Maintenance/ScheduleResults";
import ScheduleServices from "@/components/Maintenance/ScheduleServices";
import Schedule from "@/components/Maintenance/Schedule";
import { CarType, Mechanic, ServicesType } from "@/Types/Maintenance/schedule";

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
          <Schedule
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

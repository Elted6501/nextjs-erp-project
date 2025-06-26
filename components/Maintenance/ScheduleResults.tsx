import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useEffect, useState } from 'react';

type Mechanic = {
  employee_id: string | number
  first_name: string;
  last_name: string;
};

type ScheduleResultsType = {
  appointmentId: string;
  client: string;
  car: {
    brand: string
    model: string
    year: string
    plates: string
  };
  selectedServices: string[];
  total: number;
  selectedDate?: string;
  selectedTime: string;
  assignedMechanic?: Mechanic | null | undefined;
  step: number
};

const ScheduleResults = (props: ScheduleResultsType) => {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-2xl font-bold text-red-700">Appointment Summary</h2>
      <div className="bg-white border border-red-400 shadow-md rounded-xl px-6 py-4 max-w-3xl w-full font-mono text-gray-900">
        <div className="grid grid-cols-3 gap-x-8 text-sm font-semibold text-red-600 border-b border-red-200 pb-2 mb-2">
          <div>Appointment ID</div>
          <div>Client</div>
          <div>Car</div>
        </div>
        <div className="grid grid-cols-3 gap-x-8 text-sm border-b border-red-100 pb-2 mb-4">
          <div>{props.appointmentId}</div>
          <div>{props.client}</div>
          <div>{props.car.brand} - {props.car.model} - {props.car.year} - {props.car.plates}</div>
        </div>

        <div className="text-sm font-semibold text-red-600 border-b border-red-200 pb-1 mb-1">
          Services
        </div>
        <div className="text-sm border-b border-red-100 pb-3 mb-4">
          {props.selectedServices.join(", ") || "None"}
        </div>

        <div className="grid grid-cols-2 gap-x-8 text-sm font-semibold text-red-600 border-b border-red-200 pb-2 mb-2">
          <div>Total</div>
          <div>Date & Time</div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 text-sm border-b border-red-100 pb-2 mb-4">
          <div>${props.total.toFixed(2)}</div>
          <div>
            {props.selectedDate} at {props.selectedTime}
          </div>
        </div>

        <div className="text-sm font-semibold text-red-600 pb-1">Mechanic</div>
        <div className="text-sm">
          {props.assignedMechanic
            ? `${props.assignedMechanic.first_name} ${props.assignedMechanic.last_name}`
            : "No mechanic assigned"}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => router.push("/maintenance")}
          className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 px-5 py-2 rounded-lg text-white text-sm font-semibold shadow"
        >
          Finish
        </button>
        <button
          onClick={() => {
            const printContents = document.querySelector(
              "div.bg-white.border"
            )?.innerHTML;
            const originalContents = document.body.innerHTML;
            document.body.innerHTML = printContents ?? "";
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
  );
};

export default ScheduleResults;

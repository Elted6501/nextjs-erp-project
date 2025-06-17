import { ScheduleServicesType } from '@/Types/Maintenance/schedule';
import React, { useState } from 'react';
import ServicesSchedule from './ServicesSchedule';
import MechanicsSchedule from './MechanicsSchedule';
import ScheduleServicesSelected from './ScheduleServicesSelected';

const ScheduleServices = ({
  setStep,
  mechanic,
  setMechanic,
  total,
  selectedServices,
  setSelectedServices,
  mechanics,
}: ScheduleServicesType) => {
  return (
    <div className="space-y-6">
      <ServicesSchedule
        selectedServices={selectedServices}
        setSelectedServices={setSelectedServices}
        services={[
          { name: 'Oil Change', price: 29.99 },
          { name: 'Brake Inspection', price: 49.99 },
          { name: 'Engine Diagnostic', price: 89.99 },
          { name: 'Tire Rotation', price: 19.99 },
        ]}
      ></ServicesSchedule>
      <MechanicsSchedule
        mechanic={mechanic}
        mechanics={mechanics}
        setMechanic={setMechanic}
      ></MechanicsSchedule>
      <ScheduleServicesSelected
        selectedServices={selectedServices}
        services={[
          { name: 'Oil Change', price: 29.99 },
          { name: 'Brake Inspection', price: 49.99 },
          { name: 'Engine Diagnostic', price: 89.99 },
          { name: 'Tire Rotation', price: 19.99 },
        ]}
        total={total}
      ></ScheduleServicesSelected>
      <button
        onClick={() => setStep(3)}
        disabled={selectedServices.length === 0}
        className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 px-6 py-3 rounded-xl text-white disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default ScheduleServices;

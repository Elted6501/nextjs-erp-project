import { ServicesScheduleType } from '@/Types/Maintenance/schedule';
import React, { useState } from 'react';

const ServicesSchedule = ({
  services,
  setSelectedServices,
  selectedServices,
}: ServicesScheduleType) => {
  const toggleService = (serviceName: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceName)
        ? prev.filter((s) => s !== serviceName)
        : [...prev, serviceName]
    );
  };

  return (
    <div>
      <label className="block mb-2 text-red-600">Select Services</label>
      <div className="grid grid-cols-2 gap-4">
        {services.map((s) => (
          <div
            key={s.name}
            className={`p-3 rounded-xl border cursor-pointer transition-all
                      ${
                        selectedServices.includes(s.name)
                          ? 'bg-gradient-to-r from-red-700 to-red-500 text-white border-red-500 shadow-md'
                          : 'bg-white text-black border-red-300 hover:bg-red-50'
                      }`}
            onClick={() => toggleService(s.name)}
          >
            <p>{s.name}</p>
            <p className="text-sm text-red-500">${s.price.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServicesSchedule;

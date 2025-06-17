import React from 'react';
import Calendar from './CalendarComponent';
import { ScheduleAppointmentType } from '@/Types/Maintenance/schedule';
import ScheduleAvailableTimes from './ScheduleAvailableTimes';

const ScheduleAppointment = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  setStep,
}: ScheduleAppointmentType) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <label className="block mb-2 text-red-700 font-semibold">
            Choose Date
          </label>
          <div className="bg-gray-50 rounded-xl border border-gray-300 shadow-md p-4 h-full">
            <Calendar selected={selectedDate} onSelect={setSelectedDate} />
          </div>
        </div>
        <ScheduleAvailableTimes
          selectedTime={selectedTime}
          setSelectedTime={setSelectedTime}
        ></ScheduleAvailableTimes>
      </div>
      {selectedDate && selectedTime && (
        <div className="bg-gray-100 rounded-xl border border-gray-300 shadow-md p-4 text-gray-800 font-semibold">
          <p>
            <strong>Selected:</strong> {selectedDate.toLocaleDateString()} at{' '}
            {selectedTime}
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
  );
};

export default ScheduleAppointment;

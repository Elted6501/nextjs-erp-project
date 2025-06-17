import { ScheduleClientSelection } from '@/Types/Maintenance/schedule';
import React from 'react';
import ListSchedule from './ListSchedule';

const Schedule = ({
  setClient,
  client,
  setCar,
  car,
  setStep,
  clients,
}: ScheduleClientSelection) => {
  return (
    <div className="space-y-6">
      <ListSchedule
        values={clients}
        setValue={setClient}
        value={client}
      ></ListSchedule>
      <ListSchedule
        values={['Toyota Corolla', 'Honda Civic']}
        setValue={setCar}
        value={car}
      ></ListSchedule>

      <button
        onClick={() => setStep(2)}
        disabled={!client || !car}
        className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-800 hover:to-red-700 px-6 py-3 rounded-xl text-white disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

export default Schedule;

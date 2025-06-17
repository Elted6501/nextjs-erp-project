import { clients, ScheduleListType } from '@/Types/Maintenance/schedule';
import React from 'react';

const ListSchedule = ({ setValue, value, values }: ScheduleListType) => {
  return (
    <div>
      <label className="block mb-1 text-red-600">Car</label>
      <select
        className="w-full bg-gradient-to-b from-[#7a0c0c] to-[#b31217] text-white border border-red-700 p-3 rounded-xl shadow appearance-none"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      >
        <option value="">-- Select Car --</option>
        {typeof values[0] === 'string'
          ? (values as string[]).map((v) => <option value={v}>{v}</option>)
          : (values as clients[]).map((v) => (
              <option value={v.client_id}>{v.first_name}</option>
            ))}
      </select>
    </div>
  );
};

export default ListSchedule;

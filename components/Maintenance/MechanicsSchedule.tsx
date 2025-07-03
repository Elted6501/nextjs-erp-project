'use client'
import { Mechanic } from "@/Types/Maintenance/schedule";

type MechanicsScheduleType = {
  mechanic: Mechanic;
  mechanics: Mechanic[];
  setMechanic: (val: { employee_id: number, first_name: string, last_name: string }) => void;
};

const MechanicsSchedule = ({
  mechanic,
  mechanics,
  setMechanic,
}: MechanicsScheduleType) => {
  return (
    <div>
      <label className="block mb-1 text-red-600">Select Mechanic</label>
      <select
        className="w-full bg-gradient-to-b from-[#7a0c0c] to-[#b31217] text-white border border-red-700 p-3 rounded-xl shadow appearance-none"
        value={mechanic.employee_id}
        onChange={(e) => setMechanic({
          employee_id: Number(e.target.value),
          first_name: '',
          last_name: ''
        })}
      >
        <option value="Any">Any</option>
        {mechanics.map((m) => (
          <option key={m.employee_id} value={m.employee_id}>
            {m.first_name} {m.last_name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MechanicsSchedule;

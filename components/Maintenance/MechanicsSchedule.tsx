type Mechanic = {
  employee_id: string;
  first_name: string;
  last_name: string;
};

type MechanicsScheduleType = {
  mechanic: string;
  mechanics: Mechanic[];
  setMechanic: (val: string) => void;
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
        value={mechanic}
        onChange={(e) => setMechanic(e.target.value)}
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

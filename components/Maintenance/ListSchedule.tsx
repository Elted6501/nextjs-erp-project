type Client = {
  client_id: string;
  first_name: string;
  // otros campos que uses
};

type ScheduleListType = {
  values: string[] | Client[];
  value: string;
  setValue: (val: string) => void;
};

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
        {typeof values[0] === "string"
          ? (values as string[]).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))
          : (values as Client[]).map((v) => (
              <option key={v.client_id} value={v.client_id}>
                {v.first_name}
              </option>
            ))}
      </select>
    </div>
  );
};

export default ListSchedule;

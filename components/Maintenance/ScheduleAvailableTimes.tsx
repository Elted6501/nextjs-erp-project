import { Mechanic } from "@/Types/Maintenance/schedule";
import { useEffect, useState } from "react";

type ScheduleAvailableTimesType = {
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  mechanicSelected: Mechanic;
  selectedDate: string
};

const ScheduleAvailableTimes = ({
  selectedTime,
  setSelectedTime,
  mechanicSelected,
  selectedDate
}: ScheduleAvailableTimesType) => {

  const [hours, setHours] = useState<{ available_hour: string }[]>([])

  useEffect(() => {
    console.log(mechanicSelected, selectedDate);

    if (mechanicSelected.employee_id != 0 && selectedDate) {
      (async () => {
        const response = await fetch(`../api/maintenance/schedule/maintenance?id=${mechanicSelected.employee_id}&date=${selectedDate}`);
        const data = await response.json();
        if (!data.error) {
          setHours(data.data);
        }
      })()
    }
  }, [selectedDate, mechanicSelected]);

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-300 shadow-md p-4 h-full">
      <h3 className="mb-4 text-red-700 font-semibold text-lg">
        Available Times
      </h3>
      <ul className="space-y-3">
        {hours.map((time) => (
          <li
            key={time.available_hour}
            className={`cursor-pointer rounded-lg px-4 py-2 border bg-white text-red-700 font-medium transition-colors
              ${selectedTime === time.available_hour
                ? "bg-gradient-to-r from-red-700 to-red-500 text-white border-transparent shadow-lg"
                : "border-gray-300 hover:border-red-400 hover:text-red-600"
              }`}
            onClick={() => setSelectedTime(time.available_hour)}
          >
            {time.available_hour}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScheduleAvailableTimes;

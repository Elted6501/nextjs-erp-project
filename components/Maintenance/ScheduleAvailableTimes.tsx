type ScheduleAvailableTimesType = {
  selectedTime: string;
  setSelectedTime: (time: string) => void;
};

const ScheduleAvailableTimes = ({
  selectedTime,
  setSelectedTime,
}: ScheduleAvailableTimesType) => {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-300 shadow-md p-4 h-full">
      <h3 className="mb-4 text-red-700 font-semibold text-lg">
        Available Times
      </h3>
      <ul className="space-y-3">
        {["09:00 AM", "10:30 AM", "01:00 PM", "03:30 PM"].map((time) => (
          <li
            key={time}
            className={`cursor-pointer rounded-lg px-4 py-2 border bg-white text-red-700 font-medium transition-colors
              ${
                selectedTime === time
                  ? "bg-gradient-to-r from-red-700 to-red-500 text-white border-transparent shadow-lg"
                  : "border-gray-300 hover:border-red-400 hover:text-red-600"
              }`}
            onClick={() => setSelectedTime(time)}
          >
            {time}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScheduleAvailableTimes;

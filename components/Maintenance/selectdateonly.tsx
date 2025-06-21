import { ScheduleAppointmentType } from "@/Types/Maintenance/schedule";
import Calendar from "./CalendarComponent";

type DateOnlyProps = Pick<
  ScheduleAppointmentType,
  "selectedDate" | "setSelectedDate"
>;

const ScheduleDateOnly = ({ selectedDate, setSelectedDate }: DateOnlyProps) => {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-300 shadow-md p-4 h-full">
      <Calendar selected={selectedDate} onSelect={setSelectedDate} />
    </div>
  );
};

export default ScheduleDateOnly;

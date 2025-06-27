import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isAfter, isBefore, isSameDay, isSameMonth, isToday, parse, startOfMonth, startOfWeek, } from "date-fns";
import { useState } from "react";

type CalendarProps = {
  selected?: string;
  onSelect?: (date: string) => void;
  onSelectTime?: (date: Date) => void;
  fromDate?: Date;
  toDate?: Date;
};

function Calendar({ selected, onSelect, onSelectTime, fromDate = new Date(), toDate = addMonths(new Date(), 1), }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), "dd/MM/yyyy"));

  const parsedCurrentMonth = parse(currentMonth, "dd/MM/yyyy", new Date());

  const start = startOfWeek(startOfMonth(parsedCurrentMonth), { weekStartsOn: 0, });
  const end = endOfWeek(endOfMonth(parsedCurrentMonth), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });

  const isDisabled = (date: Date) =>
    isBefore(date, fromDate) || isAfter(date, toDate);

  return (
    <div className="text-black space-y-2">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => {
            const updated = addMonths(parsedCurrentMonth, -1);
            setCurrentMonth(format(updated, "dd/MM/yyyy"));
          }}
          className="text-red-600"
        >
          ‹
        </button>
        <span className="font-semibold text-lg text-red-600">
          {format(parsedCurrentMonth, "MMMM yyyy")}
        </span>
        <button
          onClick={() => {
            const updated = addMonths(parsedCurrentMonth, 1);
            setCurrentMonth(format(updated, "dd/MM/yyyy"));

          }}
          className="text-red-600"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 text-center font-medium text-sm text-red-500">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center text-sm">
        {days.map((date) => {
          const isSelected = selected && isSameDay(selected, date);
          const isInMonth = isSameMonth(date, parsedCurrentMonth);
          const isDisabledDay = isDisabled(date);

          return (
            <button
              key={date.toISOString()}
              disabled={isDisabledDay}
              onClick={() => {
                if (onSelectTime) {
                  onSelectTime(new Date(format(date, "yyyy/MM/dd")))
                } else if (onSelect) {
                  onSelect(format(date, "yyyy/MM/dd"))
                }
              }}
              className={`p-2 m-1 rounded-full transition-all
                ${isDisabledDay ? "text-gray-400" : ""}
                ${isSelected ? "bg-gradient-to-br from-red-700 to-red-500 text-white shadow-lg" : ""}
                ${!isInMonth ? "text-gray-400" : ""}
                ${isToday(date) ? "border border-red-500" : ""}
                hover:bg-red-100`}
            >
              {format(date, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;

import { useState } from "react";

export default function Calendar({
  selected,
  onSelect,
  fromDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
  toDate = new Date(),
}: {
  selected?: Date;
  onSelect: (date: Date) => void;
  fromDate?: Date;
  toDate?: Date;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const startOfWeek = (date: Date) => {
    const day = date.getDay();
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
  };
  const endOfWeek = (date: Date) => {
    const day = date.getDay();
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + (6 - day)
    );
  };
  const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const addMonths = (date: Date, months: number) => new Date(date.getFullYear(), date.getMonth() + months, 1);
  const isSameDay = (d1: Date, d2: Date) => d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

  const generateDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const days = [];
    for (let d = start; d <= end; d = new Date(d.getTime() + 86400000)) {
      days.push(new Date(d));
    }
    return days;
  };

  const days = generateDays();

  const isDisabled = (date: Date) => date < fromDate || date > toDate;

  return (
    <div className="text-black space-y-2 border p-3 rounded shadow">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
          className="text-red-600 font-bold"
        >
          ‹
        </button>
        <span className="font-semibold text-lg text-red-600">
          {currentMonth.toLocaleDateString(undefined, {
            month: "long",
            year: "numeric",
          })}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="text-red-600 font-bold"
          disabled={addMonths(currentMonth, 1) > toDate}
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
          const selectedClass =
            selected && isSameDay(selected, date)
              ? "bg-red-600 text-white"
              : "";
          const disabledClass = isDisabled(date)
            ? "text-gray-300 cursor-not-allowed"
            : "cursor-pointer";

          return (
            <button
              key={date.toISOString()}
              disabled={isDisabled(date)}
              onClick={() => onSelect(date)}
              className={`p-2 m-1 rounded-full hover:bg-red-200 transition ${selectedClass} ${disabledClass}`}
              type="button"
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

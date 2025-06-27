"use client";

import MechanicsSchedule from "@/components/Maintenance/MechanicsSchedule";
import { History, MaintenanceType, Mechanic, ScheduleAppointmentType } from "@/Types/Maintenance/schedule";
import { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";

function Calendar({
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
  const startOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1);
  const endOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0);
  const addMonths = (date: Date, months: number) =>
    new Date(date.getFullYear(), date.getMonth() + months, 1);
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

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

const ScheduleAppointment = ({ selectedDate, setSelectedDate, }: ScheduleAppointmentType) => {
  return <Calendar selected={selectedDate} onSelect={setSelectedDate} />;
};

export default function HistoryPage() {
  const [mechanic, setMechanic] = useState<Mechanic>({ employee_id: 0, first_name: 'Any', last_name: 'Any' });
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [historyVisible, setHistoryVisible] = useState<boolean>(false);
  const [history, setHistory] = useState<History[]>([{ car: '', date: '', entryDate: '', exitDate: '', services: [] }]);

  useEffect(() => {
    fetch("../api/maintenance/schedule/mechanics")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setMechanics(data.data);
      })
      .catch(console.error);
  }, []);

  const handleSearch = async (): Promise<void> => {
    if (!selectedDate) {
      alert("Please, select a date to search");
      return;
    }
    const Mechanic = mechanics.filter(m => m.employee_id === mechanic.employee_id);
    const response = await fetch(`../api/maintenance/history/history?id=${Mechanic[0].employee_id}&date=${selectedDate.toLocaleDateString()}`);
    const data: { data: MaintenanceType[] } = await response.json();
    if (data.data) {
      setHistory([]);
      data.data.forEach(v => {
        setHistory(h => [...h, {
          car: v.notes.split('.')[0].split('-')[0] + ' ' + v.notes.split('.')[0].split('-')[1] + ' ' + v.notes.split('.')[0].split('-')[2],
          date: v.mn_assigned,
          entryDate: v.mn_made,
          exitDate: v.mn_completed,
          services: v.notes.split('.')[1].split(',')
        }])
      })

      const mechanicFiltered: Mechanic[] = mechanics.filter(m => m.employee_id === mechanic.employee_id);
      setMechanic({
        employee_id: mechanicFiltered[0].employee_id,
        first_name: mechanicFiltered[0].first_name,
        last_name: mechanicFiltered[0].last_name
      });

    }

    setHistoryVisible(true);
  };

  const handleReset = (): void => {
    setHistoryVisible(false);
    setSelectedDate(new Date());
    setMechanic({ employee_id: 0, first_name: 'Any', last_name: 'Any' });
  };

  return (
    <main className="min-h-screen px-6 py-10 text-black bg-[#ecebeb]">
      <div className="max-w-4xl mx-auto p-8 rounded-xl shadow space-y-8 border border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-red-600 text-center">
          Service History
        </h1>

        {!historyVisible && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="grid grid-cols-2 gap-6"
          >
            <MechanicsSchedule
              mechanic={mechanic}
              mechanics={mechanics}
              setMechanic={setMechanic} />

            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Date
              </label>
              <ScheduleAppointment
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
              />
            </div>

            <div className="col-span-2">
              <button
                type="submit"
                disabled={!selectedDate}
                className="bg-red-700 hover:bg-red-900 px-6 py-3 rounded-lg shadow text-white w-full disabled:opacity-40"
              >
                Search history
              </button>
            </div>
          </form>
        )}

        {historyVisible && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-center text-gray-700">
              {mechanic.first_name === "Any"
                ? "All mechanics"
                : `Mechanic: ${mechanic.first_name} ${mechanic.last_name}`}
              - Date: {selectedDate?.toLocaleDateString()}
            </h2>

            <div className="border-l-4 border-red-700 pl-6 space-y-6">
              {history.length === 0 ? (
                <p className="text-gray-600 italic">
                  There is no history
                </p>
              ) : (
                history.map((entry, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-3 top-1 w-6 h-6 rounded-full bg-red-700 flex items-center justify-center text-white">
                      <FaCalendarAlt size={12} />
                    </div>
                    <div className="bg-neutral-100 p-4 rounded-md shadow text-sm space-y-2">
                      <div className="text-red-600 font-semibold">
                        {entry.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Car:</strong> {entry.car}
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Entry:</strong> {entry.entryDate}
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Exit:</strong> {entry.exitDate}
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Mechanic:</strong> mechanic
                      </div>
                      <div className="flex items-center gap-2">
                        <strong>Services:</strong> {entry.services.join(", ")}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                onClick={handleReset}
                className="bg-red-700 hover:bg-red-900 px-6 py-3 rounded-lg shadow text-white"
              >
                Return
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

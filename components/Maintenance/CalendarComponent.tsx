import React, { useState } from 'react';
import {
  addDays,
  format,
  isSameDay,
  isToday,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isBefore,
  isAfter,
  eachDayOfInterval,
} from 'date-fns';
import { CalendarMaintenance } from '@/Types/Maintenance/schedule';

function Calendar({
  selected,
  onSelect,
  fromDate = new Date(),
  toDate = addDays(new Date(), 30),
}: CalendarMaintenance) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start, end });

  const isDisabled = (date: Date) =>
    isBefore(date, fromDate) || isAfter(date, toDate);

  return (
    <div className="text-black space-y-2">
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
          className="text-red-600"
        >
          ‹
        </button>
        <span className="font-semibold text-lg text-red-600">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
          className="text-red-600"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 text-center font-medium text-sm text-red-500">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 text-center text-sm">
        {days.map((date) => {
          const isSelected = selected && isSameDay(selected, date);
          const isInMonth = isSameMonth(date, currentMonth);
          const isDisabledDay = isDisabled(date);

          return (
            <button
              key={date.toISOString()}
              disabled={isDisabledDay}
              onClick={() => onSelect(date)}
              className={`p-2 m-1 rounded-full transition-all
                ${isDisabledDay ? 'text-gray-400' : ''}
                ${
                  isSelected
                    ? 'bg-gradient-to-br from-red-700 to-red-500 text-white shadow-lg'
                    : ''
                }
                ${!isInMonth ? 'text-gray-400' : ''}
                ${isToday(date) ? 'border border-red-500' : ''}
                hover:bg-red-100`}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Calendar;

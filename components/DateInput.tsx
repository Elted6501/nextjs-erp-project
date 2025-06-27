"use client";

import React from "react";
import DatePicker from "react-datepicker";
import { DateInputButton } from "./DateInputButton";
import "react-datepicker/dist/react-datepicker.css";

interface DateInputProps {
  label?: string;
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

const DateInput: React.FC<DateInputProps> = ({ label, selectedDate, onChange }) => {
  return (
    <div className="flex flex-col gap-1 mb-4">
      {label && (
        <label className="text-red-700 font-semibold text-sm">
          {label}
        </label>
      )}
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        dateFormat="MM/dd/yyyy"
        placeholderText="Select a date"
        calendarClassName="border-red-700 rounded-lg shadow-lg"
        customInput={<DateInputButton placeholder="Select a date" />}
      />
    </div>
  );
};

export default DateInput;

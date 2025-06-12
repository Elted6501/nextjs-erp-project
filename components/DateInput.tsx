// components/DateInput.tsx
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface DateInputProps {
  label?: string;
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

const DateInput: React.FC<DateInputProps> = ({ label, selectedDate, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      <DatePicker
        selected={selectedDate}
        onChange={onChange}
        dateFormat="yyyy-MM-dd"
        className="border rounded-lg px-3 py-2 w-full"
        placeholderText="Selecciona una fecha"
      />
    </div>
  );
};

export default DateInput;

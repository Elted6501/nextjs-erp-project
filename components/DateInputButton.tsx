import React from "react";
import { HiOutlineCalendar } from "react-icons/hi";

interface DateInputButtonProps {
  value?: string;
  onClick?: () => void;
  placeholder?: string;
}

export const DateInputButton = React.forwardRef<HTMLButtonElement, DateInputButtonProps>(
  ({ value, onClick, placeholder }, ref) => (
    <button
      type="button"
      onClick={onClick}
      ref={ref}
      className="
        border border-red-700 rounded-lg px-3 py-2 w-full
        flex items-center gap-2
        text-red-700
        focus:outline-none focus:ring-2 focus:ring-red-700
        transition-colors
        cursor-pointer
        bg-white
        hover:bg-red-50
      "
    >
      <span className={value ? "text-red-700" : "text-red-700"}>
        {value && value.trim() !== "" ? value : placeholder}
      </span>
      <HiOutlineCalendar className="w-5 h-5 text-red-700" />
    </button>
  )
);

DateInputButton.displayName = "DateInputButton";



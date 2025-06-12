"use client";

type InputProps = {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
};

export default function Input({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
  required = false,
  disabled = false,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1 ">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-[#a01217]">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          border-[#a01217] focus:ring-[#a01217] text-black`}
      />
    </div>
  );
}

"use client";

import { useMemo } from "react";

interface DateOfEntryInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  error?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
}

/**
 * Reusable Date of Entry input component.
 * - Only allows past dates and today (no future dates)
 * - Use for Date of Entry, Date of Enlistment, etc.
 */
export default function DateOfEntryInput({
  value,
  onChange,
  label = "Date of Entry",
  required = false,
  className = "",
  error,
  id,
  name = "doe",
  disabled = false,
}: DateOfEntryInputProps) {
  const maxDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate && selectedDate > maxDate) {
      return; // Don't allow future dates
    }
    onChange(selectedDate);
  };

  return (
    <div>
      {label && (
        <label
          htmlFor={id || name}
          className="block text-sm font-medium text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type="date"
        value={value}
        onChange={handleChange}
        max={maxDate}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-700/50 disabled:border-gray-600 ${className}`}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}

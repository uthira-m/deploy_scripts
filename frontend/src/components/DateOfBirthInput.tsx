"use client";

import { useMemo } from "react";

interface DateOfBirthInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  error?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  minAge?: number; // Minimum age in years (default: 18). Set to 0 to allow any past date.
}

/**
 * Reusable Date of Birth input component.
 * - Only allows past dates
 * - Requires minimum age (default: 18 years)
 * - Prevents future dates
 */
export default function DateOfBirthInput({
  value,
  onChange,
  label = "Date of Birth",
  required = false,
  className = "",
  error,
  id,
  name = "dob",
  disabled = false,
  minAge = 18,
}: DateOfBirthInputProps) {
  // Calculate maximum date (minAge years ago from today, or today if minAge is 0)
  const maxDate = useMemo(() => {
    const today = new Date();
    if (minAge === 0) {
      return today.toISOString().split("T")[0];
    }
    const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    return maxDate.toISOString().split("T")[0];
  }, [minAge]);

  // Calculate minimum date (reasonable past date, e.g., 100 years ago)
  const minDate = useMemo(() => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    return minDate.toISOString().split("T")[0];
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    if (selectedDate && minAge > 0) {
      const selected = new Date(selectedDate);
      const today = new Date();
      const age = today.getFullYear() - selected.getFullYear();
      const monthDiff = today.getMonth() - selected.getMonth();
      const dayDiff = today.getDate() - selected.getDate();
      const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;

      // Validate minimum age
      if (actualAge < minAge) {
        return; // Don't update if under minimum age
      }
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
        min={minDate}
        max={maxDate}
        required={required}
        disabled={disabled}
        className={`w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-700/50 disabled:border-gray-600 ${className}`}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
      {value && minAge > 0 && (
        <p className="text-gray-400 text-xs mt-1">
          Minimum age: {minAge} years
        </p>
      )}
    </div>
  );
}

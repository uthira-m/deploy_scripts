"use client";

import { useMemo, useRef, useEffect } from "react";

interface DateOfBirthInputProps {
  value: string;
  onChange?: (value: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
  error?: string;
  id?: string;
  name?: string;
  disabled?: boolean;
  minAge?: number; // Minimum age in years (default: 18). Set to 0 for family members (no min).
  maxAge?: number; // Maximum age in years (default: 50 for personnel). Use 100+ for family members.
}

/**
 * Reusable Date of Birth input component.
 * - Only allows past dates
 * - Requires minimum age (default: 18 years)
 * - Maximum age 50 years for personnel (above 50 throws validation error)
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
  maxAge = 50,
}: DateOfBirthInputProps) {
  // Calculate max date (youngest allowed = minAge years ago)
  const maxDate = useMemo(() => {
    const today = new Date();
    if (minAge === 0) {
      return today.toISOString().split("T")[0];
    }
    const d = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    return d.toISOString().split("T")[0];
  }, [minAge]);

  // Calculate min date (oldest allowed = maxAge years ago, or 100 if no maxAge)
  const minDate = useMemo(() => {
    const today = new Date();
    const yearsBack = maxAge ?? 100;
    const d = new Date(today.getFullYear() - yearsBack, today.getMonth(), today.getDate());
    return d.toISOString().split("T")[0];
  }, [maxAge]);

  const inputRef = useRef<HTMLInputElement>(null);
  const customMessage = minAge > 0 && maxAge != null && maxAge > 0 && maxAge < 100
    ? `Age must be above ${minAge} and below ${maxAge} years`
    : "";

  const validateAndSetCustomValidity = (dateValue: string) => {
    const input = inputRef.current;
    if (!input || !customMessage) return;
    if (!dateValue) {
      input.setCustomValidity("");
      return;
    }
    const selected = new Date(dateValue);
    const today = new Date();
    let age = today.getFullYear() - selected.getFullYear();
    const monthDiff = today.getMonth() - selected.getMonth();
    const dayDiff = today.getDate() - selected.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;
    if (age < minAge || age > maxAge) {
      input.setCustomValidity(customMessage);
    } else {
      input.setCustomValidity("");
    }
  };

  useEffect(() => {
    validateAndSetCustomValidity(value);
  }, [value, minAge, maxAge, customMessage]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = e.target.value;
    validateAndSetCustomValidity(selectedDate);
    onChange?.(selectedDate);
  };

  const ageHint = minAge > 0 && maxAge != null && maxAge > 0 && maxAge < 100
    ? `Age must be above ${minAge} and below ${maxAge} years`
    : minAge > 0
      ? `Minimum age: ${minAge} years`
      : null;

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
        ref={inputRef}
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
      {ageHint && (
        <p className="text-gray-400 text-xs mt-1">{ageHint}</p>
      )}
    </div>
  );
}

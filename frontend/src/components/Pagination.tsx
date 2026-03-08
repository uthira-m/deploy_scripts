"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { paginationConfig } from "@/config/pagination";

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  /** "dark" for dashboard dark theme, "light" for docs/light theme */
  variant?: "dark" | "light";
  /** Custom class for the container */
  className?: string;
}

export function Pagination({
  page,
  limit,
  total,
  onPageChange,
  onLimitChange,
  variant = "dark",
  className = "",
}: PaginationProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  const rowOptions = paginationConfig.ROW_OPTIONS;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLimitSelect = (value: number) => {
    onLimitChange(value);
    onPageChange(1);
    setDropdownOpen(false);
  };

  const isDark = variant === "dark";
  const baseSelect =
    "flex items-center gap-1 px-3 py-1.5 rounded-md text-sm cursor-pointer border min-w-[4rem] justify-between";
  const selectStyles = isDark
    ? "bg-white/10 border-white/20 text-white hover:bg-white/20"
    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";
  const arrowBtn =
    "p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const arrowStyles = isDark
    ? "text-white hover:bg-white/20"
    : "text-gray-600 hover:bg-gray-100";

  if (total === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Rows per page:
          </span>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`${baseSelect} ${selectStyles}`}
            >
              {limit}
              <ChevronDown className="w-4 h-4 shrink-0" />
            </button>
            {dropdownOpen && (
              <div
                className={`absolute left-0 bottom-full mb-1 z-50 py-1 rounded-md shadow-lg min-w-[4rem] ${
                  isDark ? "bg-gray-800 border border-white/10" : "bg-white border border-gray-200"
                }`}
              >
                {rowOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleLimitSelect(opt)}
                    className={`w-full px-3 py-2 text-left text-sm hover:bg-white/10 ${
                      isDark ? "text-white" : "text-gray-700 hover:bg-gray-50"
                    } ${limit === opt ? "font-medium" : ""}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <span
          className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {start}-{end} of {total}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`${arrowBtn} ${arrowStyles}`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || total === 0}
          className={`${arrowBtn} ${arrowStyles}`}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

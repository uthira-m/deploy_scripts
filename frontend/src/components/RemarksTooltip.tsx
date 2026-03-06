"use client";

import { useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

interface RemarksTooltipProps {
  text: string;
  truncateAt?: number;
  children: React.ReactNode;
}

export default function RemarksTooltip({
  text,
  truncateAt = 50,
  children,
}: RemarksTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      left: rect.left,
      top: rect.top - 8,
    });
  }, []);

  const handleMouseEnter = () => {
    updatePosition();
    setVisible(true);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  const showTooltip = text.length > truncateAt;

  if (!showTooltip) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        className="relative inline-block w-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {visible &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed z-[99999] px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl min-w-[200px] max-w-md break-words whitespace-normal border border-gray-700 pointer-events-none"
            style={{
              left: position.left,
              top: position.top,
              transform: "translateY(-100%)",
            }}
          >
            {text}
            <div
              className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"
              style={{ marginTop: "-1px" }}
            />
          </div>,
          document.body
        )}
    </>
  );
}

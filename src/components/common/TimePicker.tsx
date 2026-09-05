import React from 'react';

interface TimePickerProps {
  /**
   * Current time value in HH:MM (24‑hour) format.
   * Example: "14:30".
   */
  value: string;
  /**
   * Callback invoked when the user selects a new time.
   * Receives the new value in HH:MM format.
   */
  onChange: (value: string) => void;
  /** Optional label displayed above the picker */
  label?: string;
  /** If true, the component is disabled */
  disabled?: boolean;
  /** CSS class for outer container */
  className?: string;
}

/**
 * Simple 24‑hour time picker using the native HTML <input type="time">.
 * The component is styled with Tailwind for a clean, premium appearance.
 */
export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
}) => {
  // Ensure the value is always in HH:MM format; fallback to empty string.
  const safeValue = value ?? '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {label && (
        <label className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </label>
      )}
      <input
        type="time"
        value={safeValue}
        onChange={handleChange}
        disabled={disabled}
        className="w-32 rounded-md border border-zinc-300 bg-white dark:bg-zinc-800 px-2 py-1 text-sm text-zinc-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-600 disabled:opacity-50"
        // Enforce 24‑hour clock; browsers respect the locale but the pattern enforces format.
        pattern="^([01]\d|2[0-3]):[0-5]\d$"
        step={60} // minute granularity
      />
    </div>
  );
};

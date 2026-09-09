import React, { useState, useRef, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';

export interface DateRangeValue {
    startDate: string | null;
    endDate: string | null;
}

export interface DateRangePickerProps {
    value: DateRangeValue;
    onChange: (value: DateRangeValue) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    showShortcuts?: boolean;
    className?: string;
    align?: 'left' | 'right';
}

interface ShortcutOption {
    label: string;
    getValue: () => DateRangeValue;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
    value,
    onChange,
    label,
    placeholder = 'Select Date Range',
    disabled = false,
    showShortcuts = true,
    className = '',
    align = 'left',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Track current viewing month/year in the calendar
    const [viewDate, setViewDate] = useState(() => {
        if (value.startDate) {
            const parsed = dayjs(value.startDate);
            if (parsed.isValid()) return parsed.startOf('month');
        }
        return dayjs().startOf('month');
    });

    // Temp state while picking in calendar
    const [tempRange, setTempRange] = useState<DateRangeValue>({
        startDate: value.startDate,
        endDate: value.endDate,
    });
    const [hoverDate, setHoverDate] = useState<string | null>(null);

    // Sync temp range when value prop changes or popover opens
    useEffect(() => {
        setTempRange({
            startDate: value.startDate,
            endDate: value.endDate,
        });
        if (value.startDate) {
            const parsed = dayjs(value.startDate);
            if (parsed.isValid()) {
                setViewDate(parsed.startOf('month'));
            }
        }
    }, [value, isOpen]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const shortcuts: ShortcutOption[] = useMemo(() => [
        {
            label: 'Today',
            getValue: () => {
                const today = dayjs().format('YYYY-MM-DD');
                return { startDate: today, endDate: today };
            },
        },
        {
            label: 'Yesterday',
            getValue: () => {
                const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
                return { startDate: yesterday, endDate: yesterday };
            },
        },
        {
            label: 'Last 7 Days',
            getValue: () => ({
                startDate: dayjs().subtract(6, 'day').format('YYYY-MM-DD'),
                endDate: dayjs().format('YYYY-MM-DD'),
            }),
        },
        {
            label: 'Last 30 Days',
            getValue: () => ({
                startDate: dayjs().subtract(29, 'day').format('YYYY-MM-DD'),
                endDate: dayjs().format('YYYY-MM-DD'),
            }),
        },
        {
            label: 'This Month',
            getValue: () => ({
                startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
                endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
            }),
        },
        {
            label: 'Last Month',
            getValue: () => {
                const lastMonth = dayjs().subtract(1, 'month');
                return {
                    startDate: lastMonth.startOf('month').format('YYYY-MM-DD'),
                    endDate: lastMonth.endOf('month').format('YYYY-MM-DD'),
                };
            },
        },
    ], []);

    const handleShortcutClick = (shortcut: ShortcutOption) => {
        const selected = shortcut.getValue();
        setTempRange(selected);
        onChange(selected);
        setIsOpen(false);
    };

    const handleClear = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        const cleared = { startDate: null, endDate: null };
        setTempRange(cleared);
        onChange(cleared);
    };

    const handleDayClick = (dateStr: string) => {
        if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
            // Start new selection
            setTempRange({ startDate: dateStr, endDate: null });
        } else {
            // Second click: finish selection
            if (dayjs(dateStr).isBefore(dayjs(tempRange.startDate))) {
                setTempRange({ startDate: dateStr, endDate: tempRange.startDate });
            } else {
                setTempRange({ startDate: tempRange.startDate, endDate: dateStr });
            }
        }
    };

    const handleApply = () => {
        onChange(tempRange);
        setIsOpen(false);
    };

    const handlePrevMonth = () => {
        setViewDate((prev) => prev.subtract(1, 'month'));
    };

    const handleNextMonth = () => {
        setViewDate((prev) => prev.add(1, 'month'));
    };

    // Generate days grid for viewDate
    const calendarDays = useMemo(() => {
        const startOfMonth = viewDate.startOf('month');
        const daysInMonth = viewDate.daysInMonth();
        const startDayOfWeek = startOfMonth.day(); // 0 (Sun) to 6 (Sat)

        const days: { dateStr: string; dayNumber: number; isCurrentMonth: boolean }[] = [];

        // Previous month padding days
        const prevMonth = viewDate.subtract(1, 'month');
        const prevMonthDays = prevMonth.daysInMonth();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const dayNum = prevMonthDays - i;
            days.push({
                dateStr: prevMonth.date(dayNum).format('YYYY-MM-DD'),
                dayNumber: dayNum,
                isCurrentMonth: false,
            });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                dateStr: viewDate.date(i).format('YYYY-MM-DD'),
                dayNumber: i,
                isCurrentMonth: true,
            });
        }

        // Next month padding days to complete grid (multiples of 7)
        const remaining = (7 - (days.length % 7)) % 7;
        const nextMonth = viewDate.add(1, 'month');
        for (let i = 1; i <= remaining; i++) {
            days.push({
                dateStr: nextMonth.date(i).format('YYYY-MM-DD'),
                dayNumber: i,
                isCurrentMonth: false,
            });
        }

        return days;
    }, [viewDate]);

    // Range checking helper
    const isDateSelected = (dateStr: string) => {
        return tempRange.startDate === dateStr || tempRange.endDate === dateStr;
    };

    const isDateInRange = (dateStr: string) => {
        if (tempRange.startDate && tempRange.endDate) {
            return (
                dayjs(dateStr).isAfter(dayjs(tempRange.startDate)) &&
                dayjs(dateStr).isBefore(dayjs(tempRange.endDate))
            );
        }
        if (tempRange.startDate && !tempRange.endDate && hoverDate) {
            const start = tempRange.startDate;
            if (dayjs(hoverDate).isAfter(dayjs(start))) {
                return (
                    dayjs(dateStr).isAfter(dayjs(start)) &&
                    dayjs(dateStr).isBefore(dayjs(hoverDate))
                );
            } else if (dayjs(hoverDate).isBefore(dayjs(start))) {
                return (
                    dayjs(dateStr).isAfter(dayjs(hoverDate)) &&
                    dayjs(dateStr).isBefore(dayjs(start))
                );
            }
        }
        return false;
    };

    const isStartOrEnd = (dateStr: string) => {
        if (tempRange.startDate === dateStr) return 'start';
        if (tempRange.endDate === dateStr) return 'end';
        if (!tempRange.endDate && hoverDate === dateStr && tempRange.startDate) {
            return dayjs(hoverDate).isBefore(dayjs(tempRange.startDate)) ? 'start' : 'end';
        }
        return null;
    };

    // Display string in trigger input
    const displayValue = useMemo(() => {
        if (value.startDate && value.endDate) {
            if (value.startDate === value.endDate) {
                return value.startDate;
            }
            return `${value.startDate} ~ ${value.endDate}`;
        }
        if (value.startDate) {
            return `${value.startDate} ~ ...`;
        }
        return '';
    }, [value.startDate, value.endDate]);

    return (
        <div ref={containerRef} className={`relative flex flex-col ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1.5 font-body">
                    {label}
                </label>
            )}

            {/* Trigger Input */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                }}
                className={`flex items-center justify-between gap-2 w-full bg-white dark:bg-neutral-800 border ${
                    isOpen
                        ? 'border-neutral-900 dark:border-neutral-100 ring-2 ring-neutral-900/10 dark:ring-neutral-100/10'
                        : 'border-mauve-200 dark:border-mauve-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                } rounded-lg py-2 px-3.5 text-sm transition-all cursor-pointer select-none ${
                    disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                }`}
            >
                <div className="flex items-center gap-2 overflow-hidden truncate">
                    <i className="ri-calendar-line text-base text-neutral-400 dark:text-neutral-500 shrink-0" />
                    {displayValue ? (
                        <span className="font-body text-neutral-900 dark:text-neutral-100 font-medium truncate">
                            {displayValue}
                        </span>
                    ) : (
                        <span className="font-body text-neutral-400 dark:text-neutral-500 truncate">
                            {placeholder}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {displayValue && (
                        <button
                            type="button"
                            aria-label="Clear date range"
                            onClick={handleClear}
                            className="p-0.5 text-neutral-400 hover:text-neutral-700 dark:text-neutral-500 dark:hover:text-neutral-200 transition-colors rounded"
                        >
                            <i className="ri-close-line text-sm" />
                        </button>
                    )}
                    <i
                        className={`ri-arrow-down-s-line text-base text-neutral-400 dark:text-neutral-500 transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                        }`}
                    />
                </div>
            </div>

            {/* Popover Dropdown */}
            {isOpen && (
                <div
                    className={`absolute top-full mt-1.5 z-50 bg-white dark:bg-neutral-900 border border-mauve-200 dark:border-mauve-800 rounded-xl shadow-2xl p-3.5 flex flex-col md:flex-row gap-3 animate-in fade-in zoom-in-95 duration-150 ${
                        align === 'right' ? 'right-0' : 'left-0'
                    }`}
                    style={{ minWidth: showShortcuts ? '460px' : '300px' }}
                >
                    {/* Shortcuts Column */}
                    {showShortcuts && (
                        <div className="flex md:flex-col gap-1 md:w-32 border-b md:border-b-0 md:border-r border-mauve-200 dark:border-mauve-800 pb-2 md:pb-0 md:pr-2.5 overflow-x-auto">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 px-2 py-1 hidden md:block">
                                Presets
                            </span>
                            {shortcuts.map((sc) => {
                                const scVal = sc.getValue();
                                const isActive =
                                    tempRange.startDate === scVal.startDate &&
                                    tempRange.endDate === scVal.endDate;
                                return (
                                    <button
                                        key={sc.label}
                                        type="button"
                                        onClick={() => handleShortcutClick(sc)}
                                        className={`text-left px-2.5 py-1.5 rounded-lg text-xs font-medium font-body transition-colors whitespace-nowrap ${
                                            isActive
                                                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                                                : 'text-neutral-600 dark:text-neutral-300 hover:bg-mauve-100 dark:hover:bg-neutral-800'
                                        }`}
                                    >
                                        {sc.label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Calendar Container */}
                    <div className="flex-1 flex flex-col gap-3 min-w-[280px]">
                        {/* Month Navigation Header */}
                        <div className="flex items-center justify-between px-1">
                            <button
                                type="button"
                                onClick={handlePrevMonth}
                                aria-label="Previous month"
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-mauve-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                            >
                                <i className="ri-arrow-left-s-line text-lg" />
                            </button>

                            <span className="font-heading font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                                {viewDate.format('MMMM YYYY')}
                            </span>

                            <button
                                type="button"
                                onClick={handleNextMonth}
                                aria-label="Next month"
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-mauve-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
                            >
                                <i className="ri-arrow-right-s-line text-lg" />
                            </button>
                        </div>

                        {/* Weekday Labels */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                                <span
                                    key={d}
                                    className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 py-1"
                                >
                                    {d}
                                </span>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div
                            className="grid grid-cols-7 gap-1 text-center"
                            onMouseLeave={() => setHoverDate(null)}
                        >
                            {calendarDays.map((day) => {
                                const isSelected = isDateSelected(day.dateStr);
                                const inRange = isDateInRange(day.dateStr);
                                const endpointType = isStartOrEnd(day.dateStr);
                                const isToday = day.dateStr === dayjs().format('YYYY-MM-DD');

                                return (
                                    <button
                                        key={day.dateStr}
                                        type="button"
                                        onClick={() => handleDayClick(day.dateStr)}
                                        onMouseEnter={() => setHoverDate(day.dateStr)}
                                        className={`h-8 w-full text-xs font-body transition-all relative flex items-center justify-center rounded-md ${
                                            !day.isCurrentMonth
                                                ? 'text-neutral-300 dark:text-neutral-600'
                                                : 'text-neutral-800 dark:text-neutral-200'
                                        } ${
                                            isSelected || endpointType
                                                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold shadow-sm z-10'
                                                : inRange
                                                ? 'bg-neutral-200/70 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-none'
                                                : 'hover:bg-mauve-100 dark:hover:bg-neutral-800'
                                        } ${
                                            isToday && !isSelected && !inRange
                                                ? 'border border-neutral-400 dark:border-neutral-500 font-medium'
                                                : ''
                                        }`}
                                    >
                                        {day.dayNumber}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Footer Controls */}
                        <div className="flex items-center justify-between pt-2 border-t border-mauve-200 dark:border-mauve-800 gap-2">
                            <div className="text-xs font-body text-neutral-500 dark:text-neutral-400 truncate">
                                {tempRange.startDate ? (
                                    <span>
                                        {tempRange.startDate}
                                        {tempRange.endDate ? ` ~ ${tempRange.endDate}` : ' (pick end)'}
                                    </span>
                                ) : (
                                    'No date selected'
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTempRange({ startDate: value.startDate, endDate: value.endDate });
                                        setIsOpen(false);
                                    }}
                                    className="px-2.5 py-1 text-xs font-medium font-body text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleApply}
                                    className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium font-body rounded-lg transition-colors shadow-sm"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

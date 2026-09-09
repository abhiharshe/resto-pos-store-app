import React, { useState, useRef, useEffect } from 'react';

interface Option {
    label: string;
    value: string | number;
}

interface SelectProps {
    label?: string;
    placeholder?: string;
    options: Option[];
    value?: string | number | (string | number)[];
    onChange: (value: any) => void;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    multiple?: boolean;
}

export const Select: React.FC<SelectProps> = ({
    label,
    placeholder = 'Select an option',
    options,
    value,
    onChange,
    error,
    required,
    disabled,
    multiple = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const isSelected = (val: string | number) => {
        if (multiple && Array.isArray(value)) {
            return value.includes(val);
        }
        return value === val;
    };

    const selectedOptions = multiple && Array.isArray(value)
        ? options.filter(opt => value.includes(opt.value))
        : options.filter(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option: Option) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : [];
            const newValues = isSelected(option.value)
                ? currentValues.filter(v => v !== option.value)
                : [...currentValues, option.value];
            onChange(newValues);
        } else {
            onChange(option.value);
            setIsOpen(false);
        }
        setSearchTerm('');
    };

    const removeOption = (val: string | number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (multiple && Array.isArray(value)) {
            onChange(value.filter(v => v !== val));
        }
    };

    return (
        <div className="flex flex-col gap-1.5 w-full" ref={wrapperRef}>
            {label && (
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <div
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={`
                        w-full min-h-[40px] px-3 py-1.5 flex flex-wrap gap-1.5 items-center justify-between text-left
                        bg-white dark:bg-neutral-800 border rounded-lg transition-all
                        ${error ? 'border-red-500' : 'border-zinc-100 dark:border-mauve-800'}
                        ${isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-500' : ''}
                        ${disabled ? 'opacity-50 cursor-not-allowed bg-neutral-50 dark:bg-mauve-900' : 'cursor-pointer'}
                    `}
                >
                    <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                        {selectedOptions.length > 0 ? (
                            selectedOptions.map(opt => (
                                <span
                                    key={opt.value}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-medium border border-indigo-100 dark:border-indigo-800"
                                >
                                    {opt.label}
                                    {multiple && (
                                        <button
                                            type="button"
                                            onClick={(e) => removeOption(opt.value, e)}
                                            className="hover:text-indigo-800 dark:hover:text-indigo-200"
                                        >
                                            <i className="ri-close-line" />
                                        </button>
                                    )}
                                </span>
                            ))
                        ) : (
                            <span className="text-zinc-400 truncate">{placeholder}</span>
                        )}
                    </div>
                    <i className={`ri-arrow-down-s-line transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-neutral-800 border border-zinc-100 dark:border-mauve-800 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-2 border-b border-zinc-50 dark:border-mauve-800">
                            <div className="relative">
                                <i className="ri-search-line absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 text-sm" />
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="Search..."
                                    className="w-full h-8 pl-8 pr-3 text-sm bg-neutral-50 dark:bg-mauve-900 border-none rounded-md focus:ring-0"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>
                        <div className="max-h-60 overflow-auto p-1 text-base sm:text-sm">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`
                                            w-full px-3 py-2 text-sm text-left rounded-md transition-colors flex items-center justify-between
                                            ${isSelected(option.value)
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-neutral-50 dark:hover:bg-neutral-900/50'}
                                        `}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected(option.value) && <i className="ri-check-line" />}
                                    </button>
                                ))
                            ) : (
                                <div className="px-3 py-4 text-sm text-center text-zinc-500">
                                    No results found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            {error && (
                <span className="text-xs text-red-500 mt-1">{error}</span>
            )}
        </div>
    );
};

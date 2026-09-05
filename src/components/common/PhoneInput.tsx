import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { countries, Country } from '../../constants/countries';
import { parsePhoneNumberFromString, CountryCode } from 'libphonenumber-js';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    error?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
    value,
    onChange,
    label,
    error,
    placeholder = '00000 00000',
    className = '',
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Parse initial value to find existing country code or default to first
    const findInitialCountry = () => {
        if (!value) return countries.find(c => c.code === 'IN') || countries[0];
        // Try to find by dial code
        const found = countries.find(c => value.startsWith(c.dialCode));
        return found || countries.find(c => c.code === 'IN') || countries[0];
    };

    const [selectedCountry, setSelectedCountry] = useState<Country>(findInitialCountry());
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter countries based on search
    const filteredCountries = countries.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.dialCode.includes(searchQuery) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get the phone number part (without country code)
    const getPhoneNumber = () => {
        if (value.startsWith(selectedCountry.dialCode)) {
            return value.slice(selectedCountry.dialCode.length).trim();
        }
        return value;
    };

    const validateAndChange = (phone: string, country: Country) => {
        const fullNumber = `${country.dialCode}${phone.replace(/\D/g, '')}`;
        onChange(fullNumber);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, ''); // Only digits
        validateAndChange(rawValue, selectedCountry);
    };

    const handleCountrySelect = (country: Country) => {
        const currentNumber = getPhoneNumber();
        setSelectedCountry(country);
        validateAndChange(currentNumber, country);
        setIsOpen(false);
        setSearchQuery('');
    };

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchQuery('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Local validation check for UI feedback
    const phoneNumberObj = parsePhoneNumberFromString(value, selectedCountry.code as CountryCode);
    const isValid = phoneNumberObj ? phoneNumberObj.isValid() : false;
    const isTouched = value.length > selectedCountry.dialCode.length;

    return (
        <div className={`w-full ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1 ml-1">
                    {label}
                </label>
            )}

            <div className="relative flex items-stretch">
                {/* Country Selector */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        type="button"
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                        className={`flex items-center h-full px-3 gap-2 bg-zinc-50 dark:bg-zinc-900 border-y border-l rounded-l-lg transition-all
                            ${error ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800'}
                            hover:bg-zinc-100 dark:hover:bg-zinc-800
                        `}
                    >
                        <span className="text-xl">{selectedCountry.flag}</span>
                        <span className="text-sm font-bold text-gray-600 dark:text-zinc-400">{selectedCountry.dialCode}</span>
                        <i className={`ri-arrow-down-s-line text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute left-0 top-full mt-2 z-100 min-w-[280px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col"
                            >
                                <div className="p-2 border-b border-zinc-100 dark:border-zinc-800">
                                    <div className="relative">
                                        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Search country..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 border-none rounded-md text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="max-h-[300px] overflow-y-auto p-1">
                                    {filteredCountries.map((country) => (
                                        <button
                                            key={country.code}
                                            type="button"
                                            onClick={() => handleCountrySelect(country)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors
                                                ${selectedCountry.code === country.code
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-300'}
                                            `}
                                        >
                                            <span className="text-xl">{country.flag}</span>
                                            <div className="flex flex-col items-start overflow-hidden">
                                                <span className="text-xs font-bold truncate w-full text-left">{country.name}</span>
                                                <span className="text-[10px] opacity-60">{country.dialCode}</span>
                                            </div>
                                        </button>
                                    ))}
                                    {filteredCountries.length === 0 && (
                                        <div className="p-4 text-center text-xs text-gray-500">No countries found</div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Number Input */}
                <div className="relative flex-1">
                    <input
                        type="tel"
                        value={getPhoneNumber()}
                        onChange={handleNumberChange}
                        placeholder={placeholder}
                        className={`w-full px-4 py-2 h-full bg-white dark:bg-zinc-900 border-y border-r rounded-r-lg transition-all outline-none font-medium text-sm
                            ${error || (isTouched && !isValid)
                                ? 'border-red-500 text-red-500 placeholder-red-300'
                                : 'border-zinc-200 dark:border-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-indigo-500'}
                        `}
                    />
                    {isTouched && isValid && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <i className="ri-checkbox-circle-fill text-green-500 text-lg" />
                        </div>
                    )}
                </div>
            </div>

            {(error || (isTouched && !isValid)) && (
                <p className="mt-1.5 text-[10px] text-red-500 font-bold ml-1 uppercase letter-spacing-tight">
                    {error || 'Invalid phone number'}
                </p>
            )}
        </div>
    );
};

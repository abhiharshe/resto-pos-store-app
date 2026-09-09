import React from 'react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
    containerClassName?: string;
    labelClassName?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ id, name, label, containerClassName = '', labelClassName = '', className = '', ...props }, ref) => {
        const inputId = id || name;

        return (
            <div className={`flex items-center gap-2 ${containerClassName}`}>
                <input
                    type="checkbox"
                    id={inputId}
                    name={name}
                    ref={ref}
                    className={`w-4 h-4 text-indigo-600 border border-zinc-300 rounded focus:ring-indigo-500 cursor-pointer ${className}`}
                    {...props}
                />
                {label && (
                    <label htmlFor={inputId} className={`text-sm font-medium text-neutral-900 dark:text-white cursor-pointer ${labelClassName}`}>
                        {label}
                    </label>
                )}
            </div>
        );
    }
);

Checkbox.displayName = 'Checkbox';

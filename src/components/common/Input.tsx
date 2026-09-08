import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: string;
    helper?: string;
    rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
    label,
    error,
    icon,
    helper,
    rightElement,
    className = '',
    ...props
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                    {label}
                </label>
            )}
            <div className="relative rounded-md shadow-sm">
                {icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className={`${icon} text-gray-400`} />
                    </div>
                )}
                <input
                    ref={ref}
                    className={`block w-full sm:text-sm rounded-md transition-colors py-2 border
                        ${icon ? 'pl-10' : 'pl-4'}
                        ${rightElement ? 'pr-24' : 'pr-4'}
                        ${error
                            ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-zinc-200 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-zinc-800'
                        }
                        ${className}
                    `}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                        {rightElement}
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-1 text-sm text-red-600 animate-fadeIn">
                    {error}
                </p>
            )}
            {helper && !error && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {helper}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

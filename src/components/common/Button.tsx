import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    styleType?: 'solid' | 'outline';
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'info' | 'danger' | 'warning';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: string;
}

export const Button = ({
    styleType = 'solid',
    variant = 'primary',
    size = 'md',
    isLoading,
    icon,
    children,
    className = '',
    disabled,
    ...props
}: ButtonProps) => {

    const baseStyles = "cursor-pointer items-center justify-center border font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const sizes = {
        sm: "px-2 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    const solidVariants = {
        primary: "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow-md",
        secondary: "border-transparent text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500",
        outline: "border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:ring-indigo-500",
        ghost: "border-transparent text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-200",
        success: "border-transparent text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm hover:shadow-md",
        info: "border-transparent text-white bg-sky-600 hover:bg-sky-700 focus:ring-sky-500 shadow-sm hover:shadow-md",
        danger: "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow-md",
        warning: "border-transparent text-white bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 shadow-sm hover:shadow-md"
    };

    const outlineVariants = {
        primary: "border-indigo-600 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 focus:ring-indigo-500 bg-transparent",
        secondary: "border-indigo-300 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 focus:ring-indigo-500 bg-transparent",
        outline: "border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-700 focus:ring-indigo-500",
        ghost: "border-transparent text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-zinc-200",
        success: "border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 focus:ring-emerald-500 bg-transparent",
        info: "border-sky-600 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/20 focus:ring-sky-500 bg-transparent",
        danger: "border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 focus:ring-red-500 bg-transparent",
        warning: "border-amber-500 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 focus:ring-amber-500 bg-transparent"
    };

    const activeVariants = styleType === 'outline' ? outlineVariants : solidVariants;

    return (
        <button
            className={`${baseStyles} ${sizes[size]} ${activeVariants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading && (
                <i className="ri-loader-4-line animate-spin mr-2" />
            )}
            {!isLoading && icon && (
                <i className={`${icon} mr-2`} />
            )}
            {children}
        </button>
    );
};

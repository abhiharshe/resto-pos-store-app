import { ButtonHTMLAttributes } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'info';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    icon?: string;
}

const IconButton = ({
    variant = 'primary',
    size = 'md',
    isLoading,
    icon,
    className = '',
    disabled,
    ...props
}: IconButtonProps) => {

    const baseStyles = "inline-flex items-center justify-center border font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

    const sizes = {
        sm: "px-2 py-1 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    const variants = {
        primary: "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow-md",
        secondary: "border-transparent text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500",
        outline: "border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-zinc-300 bg-white dark:bg-neutral-800 hover:bg-gray-50 dark:hover:bg-neutral-700 focus:ring-indigo-500",
        ghost: "border-transparent text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-zinc-200",
        danger: "border border-red-300 text-red-600 bg-red-100 hover:bg-red-200 focus:ring-red-500",
        success: "border border-green-300 text-green-600 bg-green-100 hover:bg-green-200 focus:ring-green-500",
        warning: "border border-yellow-300 text-yellow-600 bg-yellow-100 hover:bg-yellow-200 focus:ring-yellow-500",
        info: "border border-blue-300 text-blue-600 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500",
    };

    return (
        <button
            className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {icon && <i className={icon}></i>}
        </button>
    )
}

export default IconButton
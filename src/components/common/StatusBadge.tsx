import React from 'react';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
    status: string;
    variant?: StatusVariant;
    className?: string;
}

const variantMap: Record<string, StatusVariant> = {
    // Order Status
    'PENDING': 'warning',
    'CONFIRMED': 'info',
    'PREPARING': 'info',
    'READY': 'success',
    'COMPLETED': 'success',
    'CANCELLED': 'error',

    // Payment Status
    'PAID': 'success',
    'FAILED': 'error',
};

const styles: Record<StatusVariant, string> = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    neutral: 'bg-gray-100 text-gray-800 dark:bg-zinc-700 dark:text-zinc-300',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant, className = '' }) => {
    const activeVariant = variant || variantMap[status.toUpperCase()] || 'neutral';

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[activeVariant]} ${className}`}>
            {status}
        </span>
    );
};

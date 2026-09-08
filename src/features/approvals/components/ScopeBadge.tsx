import React from 'react';

interface ScopeBadgeProps {
    isGlobal?: boolean;
    storeName?: string;
    className?: string;
}

export const ScopeBadge: React.FC<ScopeBadgeProps> = ({ isGlobal, storeName, className = '' }) => {
    if (isGlobal) {
        return (
            <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 ${className}`}
                title="Global record - Shared across all stores"
            >
                <i className="ri-global-line text-xs" />
                Global
            </span>
        );
    }

    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 ${className}`}
            title={storeName ? `Store record: ${storeName}` : 'Store-specific record'}
        >
            <i className="ri-store-2-line text-xs" />
            {storeName || 'Store Owned'}
        </span>
    );
};

export default ScopeBadge;

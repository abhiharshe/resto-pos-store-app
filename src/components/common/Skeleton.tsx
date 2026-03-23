import React from 'react';

interface SkeletonProps {
    className?: string; // Additional classes for custom sizing/shaping
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
    return (
        <div 
            className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}
        />
    );
};

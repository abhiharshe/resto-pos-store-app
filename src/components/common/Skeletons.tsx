import React from 'react';
import { Skeleton } from './Skeleton';

export const CategorySkeleton: React.FC = () => {
    return (
        <Skeleton className="h-9 w-24 rounded-lg flex-shrink-0" />
    );
};

export const MenuItemSkeleton: React.FC = () => {
    return (
        <div className="border border-gray-200 dark:border-gray-500 rounded-2xl p-3 flex flex-col gap-3 bg-white dark:bg-gray-800 border-opacity-60 h-full">
            <div className="flex flex-row gap-3">
                {/* Image Skeleton */}
                <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
                
                <div className="flex-1 min-w-0 space-y-2">
                    {/* Title Skeleton */}
                    <Skeleton className="h-5 w-3/4 rounded" />
                    {/* Description Skeleton */}
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-5/6 rounded" />
                    {/* Price Skeleton */}
                    <Skeleton className="h-4 w-1/4 rounded mt-2" />
                </div>
            </div>

            <div className="flex flex-row items-center justify-between mt-auto pt-1">
                {/* Customizable badge skeleton */}
                <Skeleton className="h-3 w-16 rounded" />
                {/* Add button skeleton */}
                <Skeleton className="h-8 w-16 rounded-lg ml-auto" />
            </div>
        </div>
    );
};

import React from 'react';
import AssetGallery from '../components/AssetGallery';


const AssetLibrary: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white">Media Library</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage all uploaded assets across the system</p>
                </div>
            </div>

            <div className="bg-white dark:bg-mauve-900 rounded-2xl border border-mauve-200 dark:border-mauve-800 p-6">
                <AssetGallery />
            </div>
        </div>
    );
};

export default AssetLibrary; 

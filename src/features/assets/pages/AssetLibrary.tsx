import React from 'react';
import AssetGallery from '../components/AssetGallery';


const AssetLibrary: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Media Library</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage all uploaded assets across the system</p>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
                <AssetGallery />
            </div>
        </div>
    );
};

export default AssetLibrary; 

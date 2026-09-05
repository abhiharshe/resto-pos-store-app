import React, { createContext, useContext, useState, useCallback } from 'react';

export interface UploadItem {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
}

export type ViewMode = 'grid' | 'list';

interface AssetContextType {
    // State
    uploadQueue: UploadItem[];
    processingAssets: string[]; // IDs of assets currently being processed by backend
    selectedAssets: string[]; // IDs of selected assets for bulk operations
    viewMode: ViewMode;

    // Actions
    addToUploadQueue: (files: File[]) => void;
    removeFromUploadQueue: (id: string) => void;
    updateUploadStatus: (id: string, status: UploadItem['status'], progress?: number, error?: string) => void;
    
    addProcessingAsset: (id: string) => void;
    removeProcessingAsset: (id: string) => void;

    toggleAssetSelection: (id: string) => void;
    selectAssets: (ids: string[]) => void;
    clearSelection: () => void;
    
    setViewMode: (mode: ViewMode) => void;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
    const [processingAssets, setProcessingAssets] = useState<string[]>([]);
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    const addToUploadQueue = useCallback((files: File[]) => {
        const newItems: UploadItem[] = files.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            progress: 0,
            status: 'pending'
        }));
        setUploadQueue(prev => [...prev, ...newItems]);
    }, []);

    const removeFromUploadQueue = useCallback((id: string) => {
        setUploadQueue(prev => prev.filter(item => item.id !== id));
    }, []);

    const updateUploadStatus = useCallback((id: string, status: UploadItem['status'], progress?: number, error?: string) => {
        setUploadQueue(prev => prev.map(item => 
            item.id === id 
                ? { ...item, status, progress: progress ?? item.progress, error } 
                : item
        ));
    }, []);

    const addProcessingAsset = useCallback((id: string) => {
        setProcessingAssets(prev => [...new Set([...prev, id])]);
    }, []);

    const removeProcessingAsset = useCallback((id: string) => {
        setProcessingAssets(prev => prev.filter(assetId => assetId !== id));
    }, []);

    const toggleAssetSelection = useCallback((id: string) => {
        setSelectedAssets(prev => 
            prev.includes(id) ? prev.filter(assetId => assetId !== id) : [...prev, id]
        );
    }, []);

    const selectAssets = useCallback((ids: string[]) => {
        setSelectedAssets(prev => [...new Set([...prev, ...ids])]);
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedAssets([]);
    }, []);

    const value = {
        uploadQueue,
        processingAssets,
        selectedAssets,
        viewMode,
        addToUploadQueue,
        removeFromUploadQueue,
        updateUploadStatus,
        addProcessingAsset,
        removeProcessingAsset,
        toggleAssetSelection,
        selectAssets,
        clearSelection,
        setViewMode
    };

    return <AssetContext.Provider value={value}>{children}</AssetContext.Provider>;
};

export const useAssetContext = () => {
    const context = useContext(AssetContext);
    if (context === undefined) {
        throw new Error('useAssetContext must be used within an AssetProvider');
    }
    return context;
};

export default AssetContext;

import api, { getMediaURL } from '../utils/api';
import { AxiosProgressEvent } from 'axios';

export interface Asset {
    url: any;
    id: string;
    file_name: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    storage_key: string;
    status: string;
    created_at: string;
    variants?: Record<string, any>;
    metadata?: Record<string, any>;
}

export interface AssetListParams {
    page?: number;
    size?: number;
    mime_type?: string;
}

export interface AssetListResponse {
    items: Asset[];
    total: number;
    page: number;
    size: number;
}

const assetService = {
    /**
     * Fetch assets for a specific entity with optional filters.
     */
    fetchAssets: async (
        entityType: string,
        entityId: string,
        params?: AssetListParams
    ): Promise<AssetListResponse> => {
        const response = await api.get(`/assets/${entityType}/${entityId}`, { params });
        return response.data;
    },

    /**
     * Upload an asset for a specific entity.
     * Supports progress tracking and cancellation via AbortController.
     */
    uploadAsset: async (
        entityType: string,
        entityId: string,
        file: File,
        metadata?: Record<string, any>,
        onProgress?: (progressEvent: AxiosProgressEvent) => void,
        signal?: AbortSignal
    ): Promise<Asset> => {
        const formData = new FormData();
        formData.append('file', file);
        if (metadata) {
            formData.append('metadata', JSON.stringify(metadata));
        }

        const response = await api.post(`/assets/${entityType}/${entityId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: onProgress,
            signal,
        });

        return response.data.asset;
    },

    /**
     * Get details of a single asset.
     */
    getAsset: async (assetId: string): Promise<Asset> => {
        const response = await api.get(`/assets/${assetId}`);
        return response.data;
    },

    /**
     * Update asset metadata.
     */
    updateAsset: async (assetId: string, data: { file_name?: string; metadata?: any }): Promise<Asset> => {
        const response = await api.patch(`/assets/${assetId}`, data);
        return response.data;
    },

    /**
     * Soft delete an asset.
     */
    deleteAsset: async (assetId: string): Promise<void> => {
        await api.delete(`/assets/${assetId}`);
    },

    /**
     * Trigger background reprocessing for an asset.
     */
    reprocessAsset: async (assetId: string): Promise<void> => {
        await api.post(`/assets/${assetId}/reprocess`);
    },

    /**
     * Download an asset.
     * Triggers a browser download by fetching the file as a blob.
     */
    downloadAsset: async (asset: Asset): Promise<void> => {
        const url = getMediaURL(asset.storage_key);
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = asset.original_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
    }
};

export default assetService;

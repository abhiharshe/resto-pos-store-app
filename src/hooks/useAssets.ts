import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import assetService, { Asset } from '../services/assetService';

export const useAssets = (entityType: string, entityId: string) => {
    const queryClient = useQueryClient();
    const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

    const queryKey = ['assets', entityType, entityId];

    // 1. Fetch Assets
    const {
        data: assets = [],
        isLoading,
        error,
        refetch
    } = useQuery({
        queryKey,
        queryFn: async () => {
            const data = await assetService.fetchAssets(entityType, entityId);
            return data.items;
        },
        enabled: !!entityType && !!entityId,
    });

    // 2. Upload Asset
    const uploadMutation = useMutation({
        mutationFn: async ({ file, metadata }: { file: File, metadata?: any }) => {
            const tempId = Math.random().toString(36).substring(7);
            
            return await assetService.uploadAsset(
                entityType, 
                entityId, 
                file, 
                metadata,
                (progressEvent) => {
                    const percent = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded)
                    );
                    setUploadProgress(prev => ({ ...prev, [tempId]: percent }));
                }
            );
        },
        onSuccess: (newAsset) => {
            queryClient.setQueryData(queryKey, (old: Asset[] = []) => [newAsset, ...old]);
            toast.success('Asset uploaded successfully');
        },
        onError: (err: any) => {
            const msg = err.response?.data?.detail || 'Upload failed';
            toast.error(msg);
        }
    });

    // 3. Delete Asset
    const deleteMutation = useMutation({
        mutationFn: async (assetId: string) => {
            await assetService.deleteAsset(assetId);
        },
        onMutate: async (assetId) => {
            await queryClient.cancelQueries({ queryKey });
            const previousAssets = queryClient.getQueryData(queryKey);
            
            // Optimistic Update
            queryClient.setQueryData(queryKey, (old: Asset[] = []) => 
                old.filter(a => a.id !== assetId)
            );

            return { previousAssets };
        },
        onError: (_err, _assetId, context) => {
            queryClient.setQueryData(queryKey, context?.previousAssets);
            toast.error('Failed to delete asset');
        },
        onSuccess: () => {
            toast.success('Asset deleted successfully');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey });
        }
    });

    // 4. Reprocess Asset
    const reprocessMutation = useMutation({
        mutationFn: async (assetId: string) => {
            await assetService.reprocessAsset(assetId);
        },
        onSuccess: () => {
            toast.success('Reprocessing task queued');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: () => {
            toast.error('Failed to trigger reprocessing');
        }
    });

    return {
        assets,
        isLoading,
        error,
        uploadProgress,
        uploadAsset: (file: File, metadata?: any) => uploadMutation.mutateAsync({ file, metadata }),
        deleteAsset: (assetId: string) => deleteMutation.mutateAsync(assetId),
        reprocessAsset: (assetId: string) => reprocessMutation.mutateAsync(assetId),
        refetch,
        isUploading: uploadMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
};

export default useAssets;

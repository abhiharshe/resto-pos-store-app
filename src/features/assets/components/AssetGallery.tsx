import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getMediaURL } from '../../../utils/api';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';
import { AssetPreview } from '../../../components/common/AssetPreview';
import { ConfirmDialog } from '../../../components/common/ConfirmDialog';
import { Skeleton } from '../../../components/common/Skeleton';
import IconButton from '../../../components/common/IconButton';

interface Asset {
    id: string;
    file_name: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    storage_key: string;
    status: string;
    created_at: string;
    variants?: Record<string, string>;
    url?: string;
}

interface AssetGalleryProps {
    entityType?: string;
    entityId?: string;
    editable?: boolean;
    selectionMode?: boolean;
    onSelectionChange?: (selectedIds: string[]) => void;
}

const AssetCard: React.FC<{
    asset: Asset;
    editable: boolean;
    isSelected: boolean;
    selectionMode: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onPreview: () => void;
}> = ({ asset, editable, isSelected, selectionMode, onSelect, onDelete, onPreview }) => {
    const isImage = asset.mime_type.startsWith('image/');

    // Use medium variant if available, then fallback to populated URL, then storage key
    const thumbnail = asset.variants?.medium || asset.url || asset.storage_key;
    const thumbnailURL = getMediaURL(thumbnail);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div
            className={`
                group relative bg-white dark:bg-zinc-900 border rounded-2xl overflow-hidden transition-all duration-300
                ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500 shadow-lg' : 'border-zinc-200 dark:border-zinc-800 hover:shadow-md'}
                ${selectionMode ? 'cursor-pointer' : ''}
            `}
            onClick={() => selectionMode && onSelect()}
        >
            {/* Selection Overlay */}
            {selectionMode && (
                <div className={`absolute top-3 left-3 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white/80 border-white shadow-sm'}`}>
                    {isSelected && <i className="ri-check-line text-white text-sm"></i>}
                </div>
            )}

            {/* Thumbnail/Icon */}
            <div
                className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden cursor-zoom-in"
                onClick={(e) => {
                    if (selectionMode) return;
                    e.stopPropagation();
                    onPreview();
                }}
            >
                {isImage ? (
                    <img
                        src={thumbnailURL}
                        alt={asset.file_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="flex flex-col items-center space-y-2">
                        <i className={`ri-${asset.mime_type.includes('pdf') ? 'file-pdf' : 'file-3'}-fill text-5xl text-zinc-400`}></i>
                        <span className="text-[10px] font-bold text-zinc-500 uppercase">{asset.mime_type.split('/')[1]}</span>
                    </div>
                )}

                {/* Actions Overlay */}
                {!selectionMode && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <IconButton
                            icon="ri-zoom-in-line"
                            variant="ghost"
                            className="bg-white/20 text-white hover:bg-white/40 border-transparent rounded-xl"
                            onClick={(e) => { e.stopPropagation(); onPreview(); }}
                        />
                        <a
                            href={getMediaURL(asset.storage_key)}
                            download={asset.original_name}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <IconButton
                                icon="ri-download-line"
                                variant="ghost"
                                className="bg-white/20 text-white hover:bg-white/40 border-transparent rounded-xl"
                            />
                        </a>
                        {editable && (
                            <IconButton
                                icon="ri-delete-bin-line"
                                variant="ghost"
                                className="bg-red-500/80 text-white hover:bg-red-600 border-transparent rounded-xl"
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <p className="text-sm font-bold text-zinc-900 dark:text-white truncate mb-1" title={asset.original_name}>
                    {asset.original_name}
                </p>
                <div className="flex justify-between items-center text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>{formatSize(asset.file_size)}</span>
                    <span>{dayjs(asset.created_at).format('MMM D, YYYY')}</span>
                </div>
            </div>

            {/* Status Badge (if not ready) */}
            {asset.status !== 'ready' && (
                <div className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                    {asset.status}
                </div>
            )}
        </div>
    );
};

const AssetGallery: React.FC<AssetGalleryProps> = ({
    entityType,
    entityId,
    editable = true,
    selectionMode = false,
    onSelectionChange,
}) => {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [pageSize] = useState(12);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);
    const [deleteAssetId, setDeleteAssetId] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['assets', entityType, entityId, page, pageSize],
        queryFn: async () => {
            const url = entityType && entityId
                ? `/assets/${entityType}/${entityId}`
                : '/assets/all';
            const response = await api.get(url, {
                params: { page, size: pageSize },
            });
            return response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (assetId: string) => api.delete(`/assets/${assetId}`),
        onMutate: async (assetId) => {
            await queryClient.cancelQueries({ queryKey: ['assets', entityType, entityId] });
            const previousData = queryClient.getQueryData(['assets', entityType, entityId, page, pageSize]);

            // Optimistically remove from list
            queryClient.setQueryData(['assets', entityType, entityId, page, pageSize], (old: any) => ({
                ...old,
                items: old.items.filter((item: Asset) => item.id !== assetId),
                total: old.total - 1,
            }));

            return { previousData };
        },
        onError: (err, assetId, context) => {
            queryClient.setQueryData(['assets', entityType, entityId, page, pageSize], context?.previousData);
            toast.error('Failed to delete asset');
        },
        onSuccess: () => {
            toast.success('Asset deleted successfully');
            setDeleteAssetId(null);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['assets', entityType, entityId] });
        },
    });

    const handleSelect = (id: string) => {
        const newSelection = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];

        setSelectedIds(newSelection);
        if (onSelectionChange) onSelectionChange(newSelection);
    };

    const totalPages = data ? Math.ceil(data.total / pageSize) : 0;

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden p-0">
                        <Skeleton className="aspect-square rounded-none" />
                        <div className="p-4 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (!data?.items?.length) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-zinc-50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm flex items-center justify-center mb-6">
                    <i className="ri-image-2-line text-4xl text-zinc-300"></i>
                </div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-2">No assets found</h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-xs">This entity doesn't have any uploaded assets yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Gallery Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {data.items.map((asset: Asset) => (
                    <AssetCard
                        key={asset.id}
                        asset={asset}
                        editable={editable}
                        selectionMode={selectionMode}
                        isSelected={selectedIds.includes(asset.id)}
                        onSelect={() => handleSelect(asset.id)}
                        onDelete={() => setDeleteAssetId(asset.id)}
                        onPreview={() => setPreviewAsset(asset)}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4">
                    <IconButton
                        icon="ri-arrow-left-s-line"
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="rounded-xl w-10 h-10 p-0"
                    />
                    <div className="flex items-center gap-1">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`
                                    w-10 h-10 rounded-xl text-sm font-bold transition-all
                                    ${page === i + 1
                                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                                        : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'}
                                `}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <IconButton
                        icon="ri-arrow-right-s-line"
                        variant="outline"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="rounded-xl w-10 h-10 p-0"
                    />
                </div>
            )}

            {/* Preview Modal */}
            <AssetPreview
                isOpen={!!previewAsset}
                onClose={() => setPreviewAsset(null)}
                asset={previewAsset}
                onDelete={(id) => {
                    setPreviewAsset(null);
                    setDeleteAssetId(id);
                }}
            />

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={!!deleteAssetId}
                onClose={() => setDeleteAssetId(null)}
                onConfirm={() => deleteAssetId && deleteMutation.mutate(deleteAssetId)}
                title="Delete Asset"
                description="Are you sure you want to delete this asset? This action cannot be undone."
                variant="danger"
                confirmText="Delete"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
};

export default AssetGallery;

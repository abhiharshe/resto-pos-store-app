import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import dayjs from 'dayjs';
import { getMediaURL } from '../../utils/api';
import IconButton from './IconButton';
import { Button } from './Button';

interface Asset {
    id: string;
    file_name: string;
    original_name: string;
    mime_type: string;
    file_size: number;
    storage_key: string;
    status: string;
    created_at: string;
    metadata?: Record<string, any>;
    url?: string;
}

interface AssetPreviewProps {
    asset: Asset | null;
    isOpen: boolean;
    onClose: () => void;
    onDelete?: (id: string) => void;
    onDownload?: (asset: Asset) => void;
}

export const AssetPreview: React.FC<AssetPreviewProps> = ({
    asset,
    isOpen,
    onClose,
    onDelete,
    onDownload,
}) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!asset) return null;

    const isImage = asset.mime_type.startsWith('image/');
    const isVideo = asset.mime_type.startsWith('video/');
    const isPDF = asset.mime_type === 'application/pdf';

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDownload = () => {
        if (onDownload) {
            onDownload(asset);
        } else {
            window.open(getMediaURL(asset.url || asset.storage_key), '_blank');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />

                    {/* Content Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-7xl h-[90vh] mx-4 bg-white dark:bg-zinc-950 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10"
                    >
                        {/* Main Preview Area */}
                        <div className="flex-1 bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center overflow-hidden relative">
                            {isImage ? (
                                <img
                                    src={getMediaURL(asset.url || asset.storage_key)}
                                    alt={asset.original_name}
                                    className="max-w-full max-h-full object-contain shadow-2xl"
                                />
                            ) : isVideo ? (
                                <video
                                    src={getMediaURL(asset.url || asset.storage_key)}
                                    controls
                                    className="max-w-full max-h-full"
                                />
                            ) : isPDF ? (
                                <iframe
                                    src={`${getMediaURL(asset.url || asset.storage_key)}#toolbar=0`}
                                    className="w-full h-full border-none"
                                    title={asset.original_name}
                                />
                            ) : (
                                <div className="text-center space-y-4 p-8">
                                    <div className="w-32 h-32 bg-zinc-200 dark:bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <i className="ri-file-3-line text-6xl text-zinc-400"></i>
                                    </div>
                                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Preview Not Available</h3>
                                    <p className="text-zinc-500 max-w-xs mx-auto">This file type ({asset.mime_type}) cannot be previewed in the browser.</p>
                                    <Button icon="ri-download-line" onClick={handleDownload}>
                                        Download to View
                                    </Button>
                                </div>
                            )}

                            {/* Top Actions Overlay */}
                            <div className="absolute top-6 right-6 flex items-center gap-3">
                                <IconButton
                                    icon="ri-close-line"
                                    variant="ghost"
                                    onClick={onClose}
                                    className="bg-black/20 hover:bg-black/40 text-white border-transparent rounded-2xl w-12 h-12"
                                />
                            </div>
                        </div>

                        {/* Sidebar Info */}
                        <div className="w-full md:w-80 border-l border-zinc-100 dark:border-white/10 flex flex-col bg-white dark:bg-zinc-950">
                            <div className="p-8 flex-1 overflow-y-auto space-y-8">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">File Details</h4>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[11px] text-zinc-400 font-semibold uppercase">Name</p>
                                            <p className="text-sm font-black text-zinc-900 dark:text-white break-all leading-tight">
                                                {asset.original_name}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[11px] text-zinc-400 font-semibold uppercase">Size</p>
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                    {formatSize(asset.file_size)}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[11px] text-zinc-400 font-semibold uppercase">Type</p>
                                                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate uppercase">
                                                    {asset.mime_type.split('/')[1]}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] text-zinc-400 font-semibold uppercase">Uploaded At</p>
                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                                                {dayjs(asset.created_at).format('MMMM D, YYYY')}
                                                <span className="block text-[10px] text-zinc-400 font-medium">
                                                    {dayjs(asset.created_at).format('h:mm A')}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {asset.metadata && Object.keys(asset.metadata).length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Metadata</h4>
                                        <div className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-4 space-y-3">
                                            {Object.entries(asset.metadata).map(([key, value]) => (
                                                <div key={key} className="flex justify-between items-center text-xs">
                                                    <span className="text-zinc-500 font-semibold capitalize">{key.replace(/_/g, ' ')}</span>
                                                    <span className="text-zinc-900 dark:text-white font-black truncate max-w-[120px]">{String(value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-zinc-100 dark:border-white/10 space-y-3">
                                <Button
                                    variant="primary"
                                    className="w-full rounded-2xl h-12 shadow-xl shadow-indigo-500/20"
                                    icon="ri-download-line"
                                    onClick={handleDownload}
                                >
                                    Download File
                                </Button>
                                {onDelete && (
                                    <Button
                                        variant="ghost"
                                        className="w-full rounded-2xl h-12 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                                        icon="ri-delete-bin-line"
                                        onClick={() => onDelete(asset.id)}
                                    >
                                        Delete Asset
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AssetPreview;

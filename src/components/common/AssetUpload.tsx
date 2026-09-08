import React, { useState, useRef, useEffect } from 'react';
import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import Modal from './Modal';

interface AssetUploadProps {
    entityType: string;
    entityId: string;
    allowedTypes?: string[];
    maxSize?: number; // in MB
    multiple?: boolean;
    onUploadComplete?: (assets: any[]) => void;
    onFilesChange?: (files: File[]) => void;
    autoUpload?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
    title?: string;
}

interface FileState {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    preview?: string;
    cancelSource?: CancelTokenSource;
}

const AssetUpload: React.FC<AssetUploadProps> = ({
    entityType,
    entityId,
    allowedTypes = ['image/*', 'application/pdf'],
    maxSize = 10,
    multiple = true,
    onUploadComplete,
    onFilesChange,
    autoUpload = true,
    isOpen,
    onClose,
    title = "Upload Assets",
}) => {
    const [files, setFiles] = useState<FileState[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isUploading = files.some(f => f.status === 'uploading');

    // Clear files when modal closes
    useEffect(() => {
        if (isOpen === false) {
            // Revoke all previews to avoid memory leaks
            files.forEach(f => {
                if (f.preview) URL.revokeObjectURL(f.preview);
            });
            setFiles([]);
        }
    }, [isOpen]);

    const validateFile = (file: File): string | null => {
        // Check size
        if (file.size > maxSize * 1024 * 1024) {
            return `File size exceeds ${maxSize}MB`;
        }

        // Check type
        const isTypeAllowed = allowedTypes.some((type) => {
            if (type.endsWith('/*')) {
                const baseType = type.split('/')[0];
                return file.type.startsWith(`${baseType}/`);
            }
            return file.type === type;
        });

        if (!isTypeAllowed) {
            return 'File type not allowed';
        }

        return null;
    };

    const uploadFile = async (fileState: FileState) => {
        const formData = new FormData();
        formData.append('file', fileState.file);

        const source = axios.CancelToken.source();

        setFiles(prev => prev.map(f =>
            f.id === fileState.id
                ? { ...f, status: 'uploading', cancelSource: source }
                : f
        ));

        try {
            const response = await api.post(`/assets/${entityType}/${entityId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                cancelToken: source.token,
                onUploadProgress: (progressEvent: AxiosProgressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / (progressEvent.total || progressEvent.loaded)
                    );
                    setFiles(prev => prev.map(f =>
                        f.id === fileState.id ? { ...f, progress: percentCompleted } : f
                    ));
                },
            });

            setFiles(prev => prev.map(f =>
                f.id === fileState.id ? { ...f, status: 'completed', progress: 100 } : f
            ));

            if (onUploadComplete) {
                onUploadComplete([response.data.asset]);
            }

            toast.success(`${fileState.file.name} uploaded successfully`);
        } catch (error: any) {
            if (axios.isCancel(error)) {
                console.log('Upload cancelled');
                setFiles(prev => prev.filter(f => f.id !== fileState.id));
            } else {
                const errorMsg = error.response?.data?.detail || 'Upload failed';
                setFiles(prev => prev.map(f =>
                    f.id === fileState.id ? { ...f, status: 'error', error: errorMsg } : f
                ));
                toast.error(`${fileState.file.name}: ${errorMsg}`);
            }
        }
    };

    const handleFiles = (newFiles: FileList | null) => {
        if (!newFiles) return;

        const fileList = Array.from(newFiles);
        const validFiles: FileState[] = [];

        fileList.forEach((file) => {
            const error = validateFile(file);
            const id = Math.random().toString(36).substring(7);
            const fileState: FileState = {
                id,
                file,
                progress: 0,
                status: 'pending',
                error: error || undefined,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            };
            validFiles.push(fileState);
        });

        if (!multiple) {
            setFiles(validFiles.slice(0, 1));
        } else {
            setFiles((prev) => [...prev, ...validFiles]);
        }

        if (autoUpload) {
            // Start uploads for pending files without errors
            validFiles.forEach(f => {
                if (!f.error) {
                    uploadFile(f);
                }
            });
        } else {
            setFiles((prev) => prev.map(f =>
                validFiles.find(v => v.id === f.id) && !f.error
                    ? { ...f, status: 'completed', progress: 100 }
                    : f
            ));
            if (onFilesChange) {
                onFilesChange(validFiles.map(f => f.file));
            }
        }
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const onDragLeave = () => {
        setIsDragging(false);
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const cancelUpload = (id: string) => {
        const fileState = files.find(f => f.id === id);
        if (fileState?.cancelSource) {
            fileState.cancelSource.cancel('User cancelled');
        } else {
            setFiles(prev => prev.filter(f => f.id !== id));
        }
    };

    const removeFile = (id: string) => {
        setFiles(prev => {
            const file = prev.find(f => f.id === id);
            if (file?.preview) URL.revokeObjectURL(file.preview);
            return prev.filter(f => f.id !== id);
        });
    };

    const renderContent = () => (
        <div className={`w-full space-y-4 ${isOpen ? 'p-6' : ''}`}>
            {/* Drop Zone */}
            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={isUploading ? undefined : onDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`
                    border-2 border-dashed rounded-2xl p-8 transition-all
                    flex flex-col items-center justify-center space-y-2
                    ${isUploading ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
                    ${isDragging && !isUploading
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10'
                        : 'border-zinc-300 dark:border-zinc-700 hover:border-indigo-400 bg-zinc-50 dark:bg-zinc-900/50'}
                `}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFiles(e.target.files)}
                    multiple={multiple}
                    disabled={isUploading}
                    accept={allowedTypes.join(',')}
                    className="hidden"
                />
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'}`}>
                    <i className="ri-upload-cloud-2-line text-3xl"></i>
                </div>
                <div className="text-center">
                    <p className="text-zinc-700 dark:text-zinc-300 font-semibold">
                        {isUploading ? 'Upload in progress...' : 'Click or drag files to upload'}
                    </p>
                    <p className="text-zinc-500 text-xs mt-1">
                        {isUploading ? 'Please wait while your files are being processed' : `Supported: ${allowedTypes.join(', ')} (Max ${maxSize}MB)`}
                    </p>
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {files.map((f) => (
                        <div key={f.id} className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-4 flex items-center space-x-4 shadow-sm animate-in slide-in-from-bottom-2">
                            {/* Preview/Icon */}
                            <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                                {f.preview ? (
                                    <img src={f.preview} alt="preview" className="w-full h-full object-cover" />
                                ) : (
                                    <i className={`ri-${f.file.type.includes('pdf') ? 'file-pdf' : 'file-3'}-line text-2xl text-zinc-400`}></i>
                                )}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate" title={f.file.name}>
                                        {f.file.name}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            f.status === 'uploading' ? cancelUpload(f.id) : removeFile(f.id);
                                        }}
                                        className="w-6 h-6 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <i className="ri-close-line"></i>
                                    </button>
                                </div>

                                {f.error ? (
                                    <div className="flex items-center gap-1.5 text-red-500">
                                        <i className="ri-error-warning-line text-sm"></i>
                                        <p className="text-xs font-medium">{f.error}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ease-out ${f.status === 'completed' ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                                                style={{ width: `${f.progress}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                            <span className={f.status === 'completed' ? 'text-emerald-500' : ''}>
                                                {f.status === 'uploading' ? `Uploading ${f.progress}%` : f.status}
                                            </span>
                                            <span>{(f.file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    if (isOpen !== undefined) {
        return (
            <Modal isOpen={isOpen} onClose={onClose!} title={title} size="lg">
                {renderContent()}
            </Modal>
        );
    }

    return renderContent();
};

export default AssetUpload;

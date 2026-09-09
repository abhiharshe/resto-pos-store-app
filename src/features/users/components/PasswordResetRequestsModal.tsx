import React, { useState } from 'react';
import Modal from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import IconButton from '../../../components/common/IconButton';
import toast from 'react-hot-toast';
import {
    PasswordResetRequest,
    usePasswordResetRequests,
    useRejectPasswordResetRequest
} from '../api/usersApi';
import { getApiErrorMessage } from '../../../utils/api';

interface PasswordResetRequestsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResetPasswordForRequest: (request: PasswordResetRequest) => void;
}

export const PasswordResetRequestsModal: React.FC<PasswordResetRequestsModalProps> = ({
    isOpen,
    onClose,
    onResetPasswordForRequest,
}) => {
    const [statusFilter, setStatusFilter] = useState<string>('PENDING');

    const { data: requests, isLoading } = usePasswordResetRequests(statusFilter === 'ALL' ? undefined : statusFilter);
    const rejectMutation = useRejectPasswordResetRequest();

    const handleReject = async (requestId: string) => {
        if (!window.confirm('Are you sure you want to reject this password reset request?')) {
            return;
        }

        try {
            await rejectMutation.mutateAsync(requestId);
            toast.success('Password reset request rejected.');
        } catch (error: any) {
            toast.error(getApiErrorMessage(error, 'Failed to reject request.'));
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return dateStr;
        }
    };

    const pendingCount = requests?.filter(r => r.status === 'PENDING').length || 0;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Password Reset Requests"
            size="2xl"
        >
            <div className="p-6 space-y-5">
                {/* Header Filter Tabs */}
                <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-mauve-800 pb-3">
                    <div className="flex gap-1.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('PENDING')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${statusFilter === 'PENDING'
                                ? 'bg-white dark:bg-mauve-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white'
                                }`}
                        >
                            <span>Pending</span>
                            {statusFilter === 'PENDING' && pendingCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-[10px]">
                                    {pendingCount}
                                </span>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('COMPLETED')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === 'COMPLETED'
                                ? 'bg-white dark:bg-mauve-900 text-green-600 dark:text-green-400 shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white'
                                }`}
                        >
                            Completed
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('REJECTED')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === 'REJECTED'
                                ? 'bg-white dark:bg-mauve-900 text-red-600 dark:text-red-400 shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white'
                                }`}
                        >
                            Rejected
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('ALL')}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${statusFilter === 'ALL'
                                ? 'bg-white dark:bg-mauve-900 text-neutral-900 dark:text-white shadow-sm'
                                : 'text-zinc-600 dark:text-zinc-400 hover:text-neutral-900 dark:hover:text-white'
                                }`}
                        >
                            All
                        </button>
                    </div>

                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                        {requests?.length || 0} {requests?.length === 1 ? 'request' : 'requests'}
                    </span>
                </div>

                {/* Requests List */}
                {isLoading ? (
                    <div className="py-12 text-center text-zinc-500 text-sm">
                        <i className="ri-loader-4-line animate-spin text-2xl text-indigo-500 mb-2 block" />
                        Loading requests...
                    </div>
                ) : !requests || requests.length === 0 ? (
                    <div className="py-12 text-center text-zinc-400 dark:text-zinc-500">
                        <div className="w-14 h-14 mx-auto rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-2xl mb-3">
                            <i className="ri-shield-keyhole-line" />
                        </div>
                        <p className="font-semibold text-sm text-zinc-700 dark:text-zinc-300">No reset requests found</p>
                        <p className="text-xs mt-1">There are no {statusFilter.toLowerCase()} password reset requests.</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                        {requests.map((req) => (
                            <div
                                key={req.id}
                                className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-zinc-100 dark:border-mauve-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-mauve-200 dark:hover:border-zinc-700"
                            >
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                                            {req.user?.full_name || 'Staff User'}
                                        </span>
                                        <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                            ({req.user?.email || 'No email'})
                                        </span>
                                        <StatusBadge
                                            status={req.status}
                                            variant={
                                                req.status === 'PENDING'
                                                    ? 'warning'
                                                    : req.status === 'COMPLETED'
                                                        ? 'success'
                                                        : 'error'
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400 flex-wrap">
                                        {req.store?.name && (
                                            <span className="flex items-center gap-1">
                                                <i className="ri-store-2-line" /> {req.store.name}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1">
                                            <i className="ri-time-line" /> {formatDate(req.created_at)}
                                        </span>
                                        {req.admin?.full_name && (
                                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                <i className="ri-check-line" /> Resolved by {req.admin.full_name}
                                            </span>
                                        )}
                                    </div>

                                    {req.reason && (
                                        <p className="text-xs bg-white dark:bg-mauve-900/80 p-2 rounded-lg border border-zinc-100 dark:border-mauve-800 text-zinc-600 dark:text-zinc-300 italic">
                                            "{req.reason}"
                                        </p>
                                    )}
                                </div>

                                {req.status === 'PENDING' && (
                                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        <Button
                                            size="sm"
                                            icon="ri-key-line"
                                            onClick={() => onResetPasswordForRequest(req)}
                                        >
                                            Reset Password
                                        </Button>
                                        <IconButton
                                            icon="ri-close-line"
                                            variant="danger"
                                            size="sm"
                                            title="Reject Request"
                                            onClick={() => handleReject(req.id)}
                                            disabled={rejectMutation.isPending}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="pt-3 border-t border-zinc-100 dark:border-mauve-800 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default PasswordResetRequestsModal;

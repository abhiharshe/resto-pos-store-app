import React, { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { ApprovalRequest, useApproveRequest, useRejectRequest } from '../api/approvalsApi';
import ApprovalStatusBadge from './ApprovalStatusBadge';
import toast from 'react-hot-toast';
import moment from 'moment';

interface ApprovalDetailModalProps {
    request: ApprovalRequest | null;
    isOpen: boolean;
    onClose: () => void;
    canReview?: boolean;
}

const renderValue = (val: any): React.ReactNode => {
    if (val === null || val === undefined) return <span className="text-zinc-400 italic">null</span>;
    if (typeof val === 'boolean') {
        return (
            <span
                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    val ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
            >
                {val ? 'Yes / Active' : 'No / Inactive'}
            </span>
        );
    }
    if (typeof val === 'object') {
        return (
            <pre className="text-xs bg-zinc-100 dark:bg-zinc-800/80 p-2 rounded max-h-40 overflow-auto font-mono text-zinc-800 dark:text-zinc-200">
                {JSON.stringify(val, null, 2)}
            </pre>
        );
    }
    return <span className="font-medium text-zinc-800 dark:text-zinc-200">{String(val)}</span>;
};

export const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
    request,
    isOpen,
    onClose,
    canReview = true,
}) => {
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    const approveMutation = useApproveRequest();
    const rejectMutation = useRejectRequest();

    if (!request) return null;

    const handleApprove = async () => {
        try {
            await approveMutation.mutateAsync(request.id);
            toast.success(`Request for ${request.entity_type.replace('_', ' ')} approved successfully!`);
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to approve request.');
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please enter a reason for rejection.');
            return;
        }
        try {
            await rejectMutation.mutateAsync({ id: request.id, rejection_reason: rejectionReason.trim() });
            toast.success(`Request rejected.`);
            setRejectionReason('');
            setIsRejecting(false);
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to reject request.');
        }
    };

    const actionColors: Record<string, string> = {
        CREATE: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        UPDATE: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        DELETE: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    };

    const proposed = request.proposed_changes || {};
    const current = request.current_data || {};
    const allKeys = Array.from(new Set([...Object.keys(current), ...Object.keys(proposed)])).filter(
        (key) => !['id', 'store_id', 'created_at', 'updated_at', 'deleted_at', 'approval_status', 'rejection_reason'].includes(key)
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Approval Review: ${request.entity_name || request.entity_type.replace('_', ' ')}`}
            size="2xl"
        >
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Meta summary card */}
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Entity</span>
                        <p className="text-sm font-bold text-zinc-900 dark:text-white capitalize">
                            {request.entity_type.toLowerCase().replace('_', ' ')}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Action</span>
                        <div>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold border ${actionColors[request.action] || ''}`}>
                                {request.action}
                            </span>
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Store</span>
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                            {request.store_name || request.store_id || 'Global'}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Status</span>
                        <div>
                            <ApprovalStatusBadge status={request.status} rejectionReason={request.rejection_reason} />
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Submitted By</span>
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {request.submitter_name || request.submitted_by}
                        </p>
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Date</span>
                        <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            {request.created_at ? moment(request.created_at).format('MMM D, YYYY h:mm A') : '-'}
                        </p>
                    </div>
                    {request.reviewer_name && (
                        <div>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400 uppercase font-semibold">Reviewed By</span>
                            <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                {request.reviewer_name}
                            </p>
                        </div>
                    )}
                </div>

                {/* Rejection Alert if rejected */}
                {request.status === 'REJECTED' && request.rejection_reason && (
                    <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
                        <i className="ri-error-warning-fill text-rose-500 text-lg mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">Rejection Reason</h4>
                            <p className="text-sm text-rose-800 dark:text-rose-300 mt-1">{request.rejection_reason}</p>
                        </div>
                    </div>
                )}

                {/* Diff Viewer for UPDATE */}
                {request.action === 'UPDATE' && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <i className="ri-git-commit-line text-purple-500" />
                            Data Comparison (Live vs Proposed)
                        </h4>
                        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-700">
                            <div className="grid grid-cols-12 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                <div className="col-span-4">Field</div>
                                <div className="col-span-4">Current Live Data</div>
                                <div className="col-span-4">Proposed Change</div>
                            </div>
                            {allKeys.length === 0 ? (
                                <div className="p-4 text-center text-sm text-zinc-500">No field changes detected</div>
                            ) : (
                                allKeys.map((key) => {
                                    const currVal = current[key];
                                    const propVal = proposed[key];
                                    const isChanged = JSON.stringify(currVal) !== JSON.stringify(propVal) && propVal !== undefined;

                                    return (
                                        <div
                                            key={key}
                                            className={`grid grid-cols-12 px-4 py-2.5 text-xs items-center gap-2 ${
                                                isChanged
                                                    ? 'bg-amber-50/70 dark:bg-amber-950/20'
                                                    : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30'
                                            }`}
                                        >
                                            <div className="col-span-4 font-mono font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                                                {key}
                                                {isChanged && (
                                                    <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                )}
                                            </div>
                                            <div className="col-span-4 break-words">
                                                {renderValue(currVal)}
                                            </div>
                                            <div className={`col-span-4 break-words ${isChanged ? 'font-semibold text-amber-700 dark:text-amber-300' : ''}`}>
                                                {propVal !== undefined ? renderValue(propVal) : <span className="text-zinc-400 italic">Unchanged</span>}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* View for CREATE */}
                {request.action === 'CREATE' && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <i className="ri-add-circle-line text-blue-500" />
                            Proposed New Record
                        </h4>
                        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-700">
                            <div className="grid grid-cols-12 bg-zinc-100 dark:bg-zinc-800 px-4 py-2 text-xs font-bold text-zinc-600 dark:text-zinc-300">
                                <div className="col-span-4">Field</div>
                                <div className="col-span-8">Proposed Value</div>
                            </div>
                            {Object.entries(proposed).map(([key, val]) => (
                                <div key={key} className="grid grid-cols-12 px-4 py-2 text-xs items-center gap-2 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                                    <div className="col-span-4 font-mono font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                                        {key}
                                    </div>
                                    <div className="col-span-8 break-words">
                                        {renderValue(val)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* View for DELETE */}
                {request.action === 'DELETE' && (
                    <div className="space-y-3">
                        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-300 text-sm">
                            <p className="font-bold flex items-center gap-2">
                                <i className="ri-delete-bin-line text-rose-500" />
                                Deletion Request
                            </p>
                            <p className="mt-1 text-xs">
                                Approving this request will mark the entity as inactive / soft-deleted from the store.
                            </p>
                        </div>
                        {current && Object.keys(current).length > 0 && (
                            <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-700">
                                {Object.entries(current).map(([key, val]) => (
                                    <div key={key} className="grid grid-cols-12 px-4 py-2 text-xs items-center gap-2">
                                        <div className="col-span-4 font-mono font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                                            {key}
                                        </div>
                                        <div className="col-span-8 break-words">
                                            {renderValue(val)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Reject Reason input box */}
                {isRejecting && (
                    <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-3 animate-fadeIn">
                        <label className="block text-xs font-bold uppercase tracking-wider text-rose-900 dark:text-rose-200">
                            Reason for Rejection <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Explain why this request is being rejected so the store admin can make necessary corrections..."
                            className="w-full text-sm rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-zinc-900 p-3 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setIsRejecting(false);
                                    setRejectionReason('');
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={handleReject}
                                isLoading={rejectMutation.isPending}
                            >
                                Confirm Rejection
                            </Button>
                        </div>
                    </div>
                )}

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>

                    {canReview && request.status === 'PENDING' && !isRejecting && (
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-800 dark:hover:bg-rose-950/30"
                                onClick={() => setIsRejecting(true)}
                            >
                                <i className="ri-close-circle-line mr-1.5" /> Reject
                            </Button>
                            <Button
                                variant="primary"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={handleApprove}
                                isLoading={approveMutation.isPending}
                            >
                                <i className="ri-checkbox-circle-line mr-1.5" /> Approve & Publish
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default ApprovalDetailModal;

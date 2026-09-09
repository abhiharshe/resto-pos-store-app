import React from 'react';
import Tooltip from '../../../components/common/Tooltip';
import { ApprovalStatus } from '../api/approvalsApi';

interface ApprovalStatusBadgeProps {
    status?: ApprovalStatus | string;
    rejectionReason?: string;
    className?: string;
}

export const ApprovalStatusBadge: React.FC<ApprovalStatusBadgeProps> = ({
    status = 'APPROVED',
    rejectionReason,
    className = '',
}) => {
    const normStatus = (status || 'APPROVED').toUpperCase();

    if (normStatus === 'PENDING') {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 ${className}`}
                title="Awaiting Super Admin review"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Pending Approval
            </span>
        );
    }

    if (normStatus === 'REJECTED') {
        const badge = (
            <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 cursor-help ${className}`}
            >
                <i className="ri-error-warning-line text-xs text-rose-500" />
                Rejected
            </span>
        );

        if (rejectionReason) {
            return (
                <Tooltip content={`Reason: ${rejectionReason}`} position="top">
                    {badge}
                </Tooltip>
            );
        }

        return badge;
    }

    if (normStatus === 'DRAFT') {
        return (
            <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-zinc-600 dark:bg-neutral-800 dark:text-zinc-300 border border-mauve-200 dark:border-zinc-700 ${className}`}
            >
                <i className="ri-draft-line text-xs" />
                Draft
            </span>
        );
    }

    // Default APPROVED
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 ${className}`}
        >
            <i className="ri-checkbox-circle-line text-xs text-emerald-500" />
            Approved
        </span>
    );
};

export default ApprovalStatusBadge;

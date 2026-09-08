import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useCoupons, Coupon, useDeleteCoupon } from '../api/couponsApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { FloatingActionButton } from '../../../components/common/FloatingActionButton';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { useAppSelector } from '../../../app/hooks';
import ScopeBadge from '../../approvals/components/ScopeBadge';
import ApprovalStatusBadge from '../../approvals/components/ApprovalStatusBadge';
import toast from 'react-hot-toast';
import moment from 'moment';
import Container from '../../../components/shared/Container';

const CouponList = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const { data: coupons, isLoading } = useCoupons();
    const deleteMutation = useDeleteCoupon();

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            const promise = deleteMutation.mutateAsync(id);
            toast.promise(promise, {
                loading: 'Deleting coupon...',
                success: 'Coupon deleted successfully!',
                error: 'Failed to delete coupon.',
            });
        }
    };

    const columns: ColumnDef<Coupon>[] = [
        {
            accessorKey: 'code',
            header: 'Coupon Code',
            cell: (info) => <span className="font-semibold text-zinc-900 dark:text-white uppercase tracking-wider">{info.getValue() as string}</span>
        },
        {
            id: 'scope',
            header: 'Scope',
            cell: (info) => (
                <ScopeBadge isGlobal={!info.row.original.store_id} />
            )
        },
        {
            accessorKey: 'approval_status',
            header: 'Approval',
            cell: (info) => (
                <ApprovalStatusBadge
                    status={info.row.original.approval_status}
                    rejectionReason={info.row.original.rejection_reason}
                />
            )
        },
        {
            accessorKey: 'discount_type',
            header: 'Type',
            cell: (info) => (
                <span className="text-sm">
                    {info.getValue() === 'FLAT' ? 'Flat Amount' : 'Percentage'}
                </span>
            )
        },
        {
            accessorKey: 'discount_value',
            header: 'Value',
            cell: (info) => {
                const type = info.row.original.discount_type;
                return (
                    <span className="font-medium">
                        {type === 'FLAT' ? `₹${info.getValue()}` : `${info.getValue()}%`}
                    </span>
                );
            }
        },
        {
            accessorKey: 'min_order_amount',
            header: 'Min. Order',
            cell: (info) => `₹${info.getValue()}`
        },
        {
            accessorKey: 'end_date',
            header: 'Expiry',
            cell: (info) => {
                const val = info.getValue() as string;
                if (!val) return 'No Expiry';
                const isExpired = moment(val).isBefore(moment());
                return (
                    <span className={isExpired ? 'text-red-500 font-medium' : ''}>
                        {moment(val).format('DD MMM YYYY')}
                    </span>
                );
            }
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: (info) => <StatusBadge status={info.getValue() ? 'Active' : 'Inactive'} variant={info.getValue() ? 'success' : 'neutral'} />
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: (info) => {
                const coupon = info.row.original;
                const isGlobal = !coupon.store_id;
                const canModify = isSuperAdmin || !isGlobal;

                if (!canModify) {
                    return (
                        <span className="text-xs text-zinc-400 italic">
                            Global (Managed by Super Admin)
                        </span>
                    );
                }

                return (
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/coupons/edit/${coupon.id}`)}
                        >
                            <i className="ri-edit-line mr-1 text-sm" />
                            {coupon.approval_status === 'REJECTED' ? 'Edit & Resubmit' : 'Edit'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10"
                            onClick={() => handleDelete(coupon.id)}
                            isLoading={deleteMutation.isPending}
                        >
                            <i className="ri-delete-bin-line mr-1 text-sm" /> Delete
                        </Button>
                    </div>
                );
            }
        }
    ];

    return (
        <Container>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white">Coupons</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage promotional codes and discounts.</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => navigate('/coupons/new')}
                    className="hidden sm:flex"
                >
                    <i className="ri-add-line mr-2" /> Add Coupon
                </Button>
            </div>

            <div className='border border-zinc-200 dark:border-zinc-700 rounded-lg'>
                <DataTable data={coupons || []} columns={columns} isLoading={isLoading} />
            </div>

            <FloatingActionButton to="/coupons/new" label="Add Coupon" />
        </Container>
    );
};

export default CouponList;

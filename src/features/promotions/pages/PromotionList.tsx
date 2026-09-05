import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { usePromotions, Promotion, useDeletePromotion } from '../api/promotionsApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { FloatingActionButton } from '../../../components/common/FloatingActionButton';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';

const PromotionList = () => {
    const navigate = useNavigate();
    const { data: promotions, isLoading } = usePromotions();
    const deleteMutation = useDeletePromotion();

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            try {
                await deleteMutation.mutateAsync(id);
                toast.success('Promotion deleted successfully!');
            } catch (err) {
                toast.error('Failed to delete promotion');
                console.error(err);
            }
        }
    };

    const columns: ColumnDef<Promotion>[] = [
        {
            accessorKey: 'title',
            header: 'Promotion Title',
            cell: (info) => (
                <div className="flex flex-col">
                    <span className="font-bold text-zinc-900 dark:text-white">{info.getValue() as string}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{info.row.original.type}</span>
                </div>
            )
        },
        {
            accessorKey: 'type',
            header: 'Offer Details',
            cell: (info) => {
                const promo = info.row.original;
                if (promo.type === 'BXGY') {
                    return (
                        <div className="flex flex-col text-sm">
                            <span className="text-zinc-600 dark:text-zinc-400">Buy {promo.buy_quantity} {promo.buy_item?.name}</span>
                            <span className="text-indigo-600 dark:text-indigo-400 font-medium">Get {promo.get_quantity} {promo.get_item?.name} Free</span>
                        </div>
                    );
                }
                return (
                    <div className="flex flex-col text-sm">
                        <span className="text-zinc-600 dark:text-zinc-400">Item: {promo.buy_item?.name}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{promo.discount_percentage}% OFF</span>
                    </div>
                );
            }
        },
        {
            accessorKey: 'store_id',
            header: 'Store',
            cell: (info) => <span className="text-sm font-medium">{info.row.original.store_id || 'All Stores'}</span>
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: (info) => <StatusBadge status={info.getValue() ? 'Active' : 'Inactive'} variant={info.getValue() ? 'success' : 'neutral'} />
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/promotions/edit/${info.row.original.id}`)}
                        icon="ri-edit-line"
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10"
                        onClick={() => handleDelete(info.row.original.id)}
                        isLoading={deleteMutation.isPending}
                        icon="ri-delete-bin-line"
                    >
                        Delete
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Container>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Promotions</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">Manage store-wide BXGY and Item Discount offers.</p>
                </div>
                <Button variant="primary" onClick={() => navigate('/promotions/new')} icon="ri-add-line" className="hidden md:inline-flex">
                    Create Promotion
                </Button>
            </div>

            <div className='border border-zinc-200 dark:border-zinc-700 rounded-lg'>
                <DataTable data={promotions || []} columns={columns} isLoading={isLoading} />
            </div>

            <FloatingActionButton to="/promotions/new" label="Add Promotion" />
        </Container>
    );
};

export default PromotionList;

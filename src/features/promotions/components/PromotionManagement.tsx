import { useState } from 'react';
import {
    usePromotions,
    useCreatePromotion,
    useUpdatePromotion,
    useDeletePromotion,
    Promotion
} from '../api/promotionsApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import IconButton from '../../../components/common/IconButton';
import { StatusBadge } from '../../../components/common/StatusBadge';
import PromotionForm from './PromotionForm';
import { ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import { useStores } from '../../stores/api/storesApi';

const PromotionManagement = () => {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPromo, setSelectedPromo] = useState<Promotion | undefined>(undefined);
    const { data: stores } = useStores();

    // We can add filtering by store if needed, for now just show all for the current user's scope
    const { data: promotions, isLoading } = usePromotions();

    const createMutation = useCreatePromotion();
    const updateMutation = useUpdatePromotion();
    const deleteMutation = useDeletePromotion();

    const handleEdit = (promo: Promotion) => {
        setSelectedPromo(promo);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this promotion?')) {
            const promise = deleteMutation.mutateAsync(id);
            toast.promise(promise, {
                loading: 'Deleting promotion...',
                success: 'Promotion deleted successfully!',
                error: 'Failed to delete promotion.'
            });
        }
    };

    const handleFormSubmit = async (values: any) => {
        try {
            if (selectedPromo) {
                await updateMutation.mutateAsync({ id: selectedPromo.id, ...values });
                toast.success('Promotion updated successfully!');
            } else {
                await createMutation.mutateAsync(values);
                toast.success('Promotion created successfully!');
            }
            setIsFormOpen(false);
            setSelectedPromo(undefined);
        } catch (error) {
            toast.error('Failed to save promotion.');
        }
    };

    const columns: ColumnDef<Promotion>[] = [
        {
            accessorKey: 'title',
            header: 'Campaign Title',
            cell: (info) => (
                <div className="flex items-center gap-3">
                    {info.row.original.image_url && (
                        <img src={info.row.original.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <span className="font-semibold text-zinc-900 dark:text-white uppercase tracking-tight">{info.getValue() as string}</span>
                </div>
            )
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: (info) => (
                <span className="text-xs font-black px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded uppercase tracking-wider text-zinc-500">
                    {info.getValue() === 'BXGY' ? 'Buy X Get Y' : 'Item Discount'}
                </span>
            )
        },
        {
            header: 'Offer Details',
            cell: (info) => {
                const promo = info.row.original;
                return (
                    <div className="text-sm">
                        {promo.type === 'BXGY' ? (
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Buy {promo.buy_quantity} <span className="font-semibold">{promo.buy_item?.name}</span>, <br />
                                Get {promo.get_quantity} <span className="font-semibold text-indigo-600 dark:text-indigo-400">{promo.get_item?.name}</span> Free
                            </p>
                        ) : (
                            <p className="text-zinc-600 dark:text-zinc-400">
                                <span className="font-semibold text-green-600">{promo.discount_percentage}% OFF</span> on {promo.buy_item?.name}
                            </p>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Store',
            cell: (info) => {
                const store = stores?.find(s => s.id === info.row.original.store_id);
                return <span className="text-sm font-medium text-zinc-500">{store?.name || 'Unknown Store'}</span>;
            }
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: (info) => (
                <StatusBadge
                    status={info.getValue() ? 'Active' : 'Paused'}
                    variant={info.getValue() ? 'success' : 'neutral'}
                />
            )
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <IconButton
                        icon="ri-edit-line"
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(info.row.original)}
                        title="Edit Promo"
                    />
                    <IconButton
                        icon="ri-delete-bin-line"
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(info.row.original.id)}
                        title="Delete Promo"
                    />
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Active Promotions</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Manage your automated buy-get and discount offers.</p>
                </div>
                <Button
                    variant="primary"
                    icon="ri-add-line"
                    onClick={() => {
                        setSelectedPromo(undefined);
                        setIsFormOpen(true);
                    }}
                >
                    Create Offer
                </Button>
            </div>

            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <PromotionForm
                        title={selectedPromo ? 'Edit Promotional Offer' : 'Launch New Offer'}
                        initialValues={selectedPromo}
                        onSubmit={handleFormSubmit}
                        onCancel={() => {
                            setIsFormOpen(false);
                            setSelectedPromo(undefined);
                        }}
                    />
                </div>
            )}

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border dark:border-zinc-800 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
                <DataTable data={promotions || []} columns={columns} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default PromotionManagement;

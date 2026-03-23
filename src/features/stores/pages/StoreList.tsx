import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useStores, Store, useDeleteStore } from '../api/storesApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const StoreList = () => {
    const navigate = useNavigate();
    const { data: stores, isLoading } = useStores();
    const deleteMutation = useDeleteStore();

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this store? This will also affect users assigned to it.')) {
            const promise = deleteMutation.mutateAsync(id);
            toast.promise(promise, {
                loading: 'Deleting store...',
                success: 'Store deleted successfully!',
                error: 'Failed to delete store.',
            });
        }
    };

    const columns: ColumnDef<Store>[] = [
        {
            accessorKey: 'name',
            header: 'Store Name',
            cell: (info) => <span className="font-medium text-zinc-900 dark:text-white">{info.getValue() as string}</span>
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
        },
        {
            accessorKey: 'currency',
            header: 'Currency',
        },
        {
            accessorKey: 'tax_percentage',
            header: 'Tax %',
            cell: (info) => `${info.getValue()}%`
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
                        onClick={() => navigate(`/stores/edit/${info.row.original.id}`)}
                    >
                        <i className="ri-edit-line mr-1 text-sm" /> Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10"
                        onClick={() => handleDelete(info.row.original.id)}
                        isLoading={deleteMutation.isPending}
                    >
                        <i className="ri-delete-bin-line mr-1 text-sm" /> Delete
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Stores</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your store locations and configurations.</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => navigate('/stores/new')}
                >
                    <i className="ri-add-line mr-2" /> Add Store
                </Button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <DataTable data={stores || []} columns={columns} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default StoreList;
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useStores, Store, useDeleteStore } from '../api/storesApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { FloatingActionButton } from '../../../components/common/FloatingActionButton';
import { StatusBadge } from '../../../components/common/StatusBadge';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';

const StoreList = () => {
    const navigate = useNavigate();
    const { data: stores, isLoading } = useStores();
    const deleteMutation = useDeleteStore();

    const handleDelete = async (id: string) => {
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
            cell: (info) => (
                <div className="flex flex-col">
                    <span className="font-medium text-neutral-900 dark:text-white">{info.getValue() as string}</span>
                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{info.row.original.prefix}</span>
                </div>
            )
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
        },
        {
            id: 'modules',
            header: 'Modules',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <span
                        title={info.row.original.has_pos ? 'POS Enabled' : 'POS Disabled'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${info.row.original.has_pos
                            ? 'bg-indigo-50 border-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400'
                            : 'bg-neutral-50 border-zinc-100 text-zinc-300 dark:bg-neutral-800/50 dark:border-mauve-800 dark:text-zinc-700'
                            }`}
                    >
                        <i className="ri-shopping-cart-line text-sm" />
                    </span>
                    <span
                        title={info.row.original.has_kds ? 'KDS Enabled' : 'KDS Disabled'}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${info.row.original.has_kds
                            ? 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'
                            : 'bg-neutral-50 border-zinc-100 text-zinc-300 dark:bg-neutral-800/50 dark:border-mauve-800 dark:text-zinc-700'
                            }`}
                    >
                        <i className="ri-restaurant-2-line text-sm" />
                    </span>
                </div>
            )
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: (info) => (
                <div className="flex flex-col gap-1 items-start">
                    <StatusBadge status={info.getValue() ? 'Active' : 'Inactive'} variant={info.getValue() ? 'success' : 'neutral'} />
                    {info.row.original.maintenance_mode && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-1.5 py-0.5 rounded">
                            <i className="ri-tools-line text-xs" /> Maint.
                        </span>
                    )}
                </div>
            )
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
        <Container>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">Stores</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage your store locations and configurations.</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => navigate('/stores/new')}
                    className="hidden sm:flex"
                >
                    <i className="ri-add-line mr-2" /> Add Store
                </Button>
            </div>

            <div className='border border-mauve-200 dark:border-zinc-700 rounded-lg'>
                <DataTable data={stores || []} columns={columns} isLoading={isLoading} />
            </div>

            <FloatingActionButton to="/stores/new" label="Add Store" />
        </Container>
    );
};

export default StoreList;
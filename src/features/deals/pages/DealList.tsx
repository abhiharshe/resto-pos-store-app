import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useDeals, useDeleteDeal, Deal } from '../api/dealsApi';
import { useStores } from '../../stores/api/storesApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { FloatingActionButton } from '../../../components/common/FloatingActionButton';
import { Input } from '../../../components/common/Input';
import { StatusBadge } from '../../../components/common/StatusBadge';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';

const DealList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: deals, isLoading } = useDeals({ q: debouncedSearch });
    const { data: stores } = useStores();
    const deleteMutation = useDeleteDeal();

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this deal?')) {
            await toast.promise(deleteMutation.mutateAsync(id), {
                loading: 'Deleting deal...',
                success: 'Deal deleted successfully!',
                error: 'Failed to delete deal.',
            });
        }
    };

    const columns: ColumnDef<Deal>[] = [
        {
            id: 'banner',
            header: 'Banner',
            cell: (info) => (
                <div className="w-16 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                    {info.row.original.featured_image ? (
                        <img src={info.row.original.featured_image} alt="Deal" className="w-full h-full object-cover" />
                    ) : (
                        <i className="ri-percent-line text-zinc-400" />
                    )}
                </div>
            )
        },
        {
            accessorKey: 'title',
            header: 'Deal Name',
            cell: (info) => (
                <div className="flex flex-col">
                    <span className="font-bold text-zinc-900 dark:text-white">{info.getValue() as string}</span>
                    <span className="text-xs text-zinc-500 line-clamp-1">{info.row.original.description || 'No description'}</span>
                </div>
            )
        },
        {
            id: 'price',
            header: 'Price Range',
            cell: (info) => {
                const prices = info.row.original.store_prices.map(sp => sp.price);
                if (prices.length === 0) return <span className="text-zinc-400 italic">Not set</span>;
                const min = Math.min(...prices);
                const max = Math.max(...prices);
                return (
                    <span className="font-black text-indigo-600 dark:text-indigo-400">
                        {min === max ? `₹${min.toFixed(2)}` : `₹${min.toFixed(2)} - ₹${max.toFixed(2)}`}
                    </span>
                );
            }
        },
        {
            id: 'stores',
            header: 'Stores',
            cell: (info) => (
                <div className="flex flex-wrap gap-1">
                    {info.row.original.store_prices.length > 0 ? (
                        <span className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">
                            {info.row.original.store_prices.length} {info.row.original.store_prices.length === 1 ? 'Store' : 'Stores'}
                        </span>
                    ) : (
                        <span className="text-zinc-400 italic text-[10px]">None</span>
                    )}
                </div>
            )
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: (info) => (
                <StatusBadge
                    status={info.getValue() ? 'Active' : 'Inactive'}
                    variant={info.getValue() ? 'success' : 'neutral'}
                />
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
                        onClick={() => navigate(`/deals/edit/${info.row.original.id}`)}
                        className="h-8 py-0 px-3 border-zinc-200 dark:border-zinc-700 hover:border-blue-500 hover:text-blue-500"
                    >
                        <i className="ri-edit-line mr-1 text-sm" /> Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/deals/items/${info.row.original.id}`)}
                        className="h-8 py-0 px-3 border-zinc-200 dark:border-zinc-700 hover:border-indigo-500 hover:text-indigo-500"
                    >
                        <i className="ri-list-settings-line mr-1 text-sm" /> Items
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 h-8 py-0 px-3"
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Deals & Combos</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage meal bundles and special choice-based offers.</p>
                </div>
                <Button
                    onClick={() => navigate('/deals/new')}
                    className="shadow-lg shadow-indigo-500/20 hidden sm:flex"
                >
                    <i className="ri-add-line mr-2" /> Add New Deal
                </Button>
            </div>

            {/* Filters */}
            <div className="bg-white/20 dark:bg-zinc-900/20 backdrop-blur-md p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="max-w-md">
                    <Input
                        label="Search Deals"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon="ri-search-2-line"
                    />
                </div>
            </div>


            <div className='border border-zinc-200 dark:border-zinc-700 rounded-lg'>
                <DataTable
                    data={deals || []}
                    columns={columns}
                    isLoading={isLoading}
                />
            </div>


            {deals?.length === 0 && !isLoading && (
                <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-800/20 rounded-xl border border-zinc-300 dark:border-zinc-800">
                    <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-percent-line text-3xl text-zinc-400"></i>
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">No deals found</h3>
                    <p className="text-zinc-500 mb-6 max-w-sm mx-auto">
                        {searchTerm ? `No deals matching "${searchTerm}"` : "Create your first combo deal to offer more value to your customers."}
                    </p>
                    {!searchTerm && <Button onClick={() => navigate('/deals/new')} variant="outline">Create Now</Button>}
                </div>
            )}

            <FloatingActionButton to="/deals/new" label="Add New Deal" />
        </Container>
    );
};

export default DealList;

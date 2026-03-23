import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useMenuItems, useDeleteMenuItem, MenuItem } from '../../menu/api/menuApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import toast from 'react-hot-toast';

const ItemList = () => {
    const navigate = useNavigate();
    const { data: items, isLoading } = useMenuItems();
    const deleteMutation = useDeleteMenuItem();

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            const promise = deleteMutation.mutateAsync(id);
            toast.promise(promise, {
                loading: 'Deleting item...',
                success: 'Item deleted successfully!',
                error: 'Failed to delete item.',
            });
        }
    };

    const columns: ColumnDef<MenuItem>[] = [
        {
            accessorKey: 'images',
            header: 'Image',
            cell: (info) => {
                const images = info.getValue() as any[];
                return (
                    <div className="w-12 h-12 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                        {images && images.length > 0 ? (
                            <img src={images[0].image_url.startsWith('http') ? images[0].image_url : `http://127.0.0.1:8000${images[0].image_url}`} alt="Item" className="w-full h-full object-cover" />
                        ) : (
                            <i className="ri-image-line text-zinc-400 text-lg" />
                        )}
                    </div>
                );
            }
        },
        {
            accessorKey: 'name',
            header: 'Item name',
            cell: (info) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900 dark:text-white">{info.getValue() as string}</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{info.row.original.category?.name}</span>
                </div>
            )
        },
        {
            accessorKey: 'variants',
            header: 'Price Range',
            cell: (info) => {
                const variants = info.getValue() as any[];
                if (!variants || variants.length === 0) return <span>-</span>;
                if (variants.length === 1) return <span className="text-zinc-900 dark:text-white font-medium">₹{variants[0].price}</span>;
                
                const minPrice = Math.min(...variants.map(v => v.price));
                const maxPrice = Math.max(...variants.map(v => v.price));
                return <span className="text-zinc-900 dark:text-white font-medium">₹{minPrice} - ₹{maxPrice}</span>;
            }
        },
        {
            accessorKey: 'is_active',
            header: 'Status',
            cell: (info) => (
                <StatusBadge
                    status={info.getValue() ? 'Available' : 'Unavailable'}
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
                        onClick={() => navigate(`/menu/items/edit/${info.row.original.id}`)}
                        className="h-8 py-0 px-3"
                    >
                        <i className="ri-edit-line mr-1 text-sm" /> Edit
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
        <div className="p-4 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Menu Items</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your menu offerings, prices and availability.</p>
                </div>
                <Button onClick={() => navigate('/menu/items/new')}>
                    <i className="ri-add-line mr-2" /> Add New Item
                </Button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <DataTable data={items || []} columns={columns} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default ItemList;
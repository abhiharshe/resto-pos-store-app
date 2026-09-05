import { useNavigate } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { useMenuItems, useDeleteMenuItem, MenuItem, Asset } from '../../menu/api/menuApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { FloatingActionButton } from '../../../components/common/FloatingActionButton';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';

const ItemList = () => {
    const navigate = useNavigate();
    const { data: items, isLoading } = useMenuItems();
    const deleteMutation = useDeleteMenuItem();

    const handleDelete = async (id: string) => {
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
            accessorKey: 'featured_image',
            header: 'Item',
            cell: (info) => {
                const image = info.getValue() as Asset;
                return (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden border border-zinc-200 dark:border-zinc-700">
                            {image?.url ? (
                                <img src={image.url} alt="Item" className="w-full h-full object-cover" />
                            ) : (
                                <i className="ri-image-line text-zinc-400" />
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="font-semibold text-zinc-900 dark:text-white line-clamp-1">{info.row.original.name}</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{info.row.original.category?.name}</span>
                        </div>
                    </div>
                );
            }
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
                        styleType='outline'
                        variant='success'
                        size='sm'
                        onClick={() => navigate(`/menu/items/${info.row.original.id}/pricing`)}
                        className="h-8 py-0 px-2"
                        title="Edit Pricing"
                    >
                        <i className="ri-currency-line text-sm" />
                    </Button>
                    <Button
                        styleType='outline'
                        variant="info"
                        size="sm"
                        onClick={() => navigate(`/menu/items/edit/${info.row.original.id}`)}
                        className="h-8 py-0 px-2"
                        title='Edit the menu'
                    >               
                        <i className="ri-edit-line text-sm" />
                    </Button>
                    <Button
                        styleType='outline'
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(info.row.original.id)}
                        isLoading={deleteMutation.isPending}
                        className="h-8 py-0 px-2"
                        title="Delete the item?"
                    >
                        <i className="ri-delete-bin-line text-sm" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Container>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Menu Items</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage your menu offerings, prices and availability.</p>
                </div>
                <Button onClick={() => navigate('/menu/items/new')} className="hidden sm:flex">
                    <i className="ri-add-line mr-2" /> Add New Item
                </Button>
            </div>

            <div className='border border-zinc-200 dark:border-zinc-700 rounded-lg'>
                <DataTable data={items || []} columns={columns} isLoading={isLoading} />
            </div>

            <FloatingActionButton to="/menu/items/new" label="Add New Item" />
        </Container>
    );
};

export default ItemList;
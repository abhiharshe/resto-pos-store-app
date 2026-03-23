import { useNavigate } from 'react-router-dom';
import { useCategories, useDeleteCategory, Category } from '../../menu/api/menuApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';

const CategoryList = () => {
    const navigate = useNavigate();
    const { data: categories, isLoading } = useCategories();
    const deleteMutation = useDeleteCategory();

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            const promise = deleteMutation.mutateAsync(id);

            toast.promise(promise, {
                loading: 'Deleting category...',
                success: 'Category deleted successfully!',
                error: 'Failed to delete category.',
            });

            try {
                await promise;
            } catch (error) {
                console.error('Delete failed:', error);
            }
        }
    };

    const columns: ColumnDef<Category>[] = [
        {
            accessorKey: 'image_url',
            header: 'Image',
            cell: (info) => (
                <div className="w-10 h-10 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                    {info.getValue() ? (
                        <img src={`http://127.0.0.1:8000${info.getValue()}`} alt="Category" className="w-full h-full object-cover" />
                    ) : (
                        <i className="ri-image-line text-zinc-400" />
                    )}
                </div>
            )
        },
        {
            accessorKey: 'name',
            header: 'Category Name',
            cell: (info) => <span className="font-medium text-zinc-900 dark:text-white">{info.getValue() as string}</span>
        },
        {
            accessorKey: 'menu.title',
            header: 'Assigned Menu',
            cell: (info) => <span className="text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider">{info.getValue() as string || 'N/A'}</span>
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
                        onClick={() => navigate(`/menu/categories/edit/${info.row.original.id}`)}
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
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Categories</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">Organize your menu items into logical groups.</p>
                </div>
                <Button onClick={() => navigate('/menu/categories/new')}>
                    <i className="ri-add-line mr-2" /> Add Category
                </Button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <DataTable data={categories || []} columns={columns} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default CategoryList;

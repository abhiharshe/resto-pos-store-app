import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories, useDeleteCategory, Category, useMenus } from '../../menu/api/menuApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { ColumnDef } from '@tanstack/react-table';
import { FloatingActionButton } from '../../../components/common/FloatingActionButton';
import { useAppSelector } from '../../../app/hooks';
import ScopeBadge from '../../approvals/components/ScopeBadge';
import ApprovalStatusBadge from '../../approvals/components/ApprovalStatusBadge';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';

const CategoryList = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const { data: categories, isLoading } = useCategories();
    const { data: menus } = useMenus();
    const deleteMutation = useDeleteCategory();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMenuId, setSelectedMenuId] = useState<string>('');
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const filteredCategories = useMemo(() => {
        if (!categories) return [];
        return categories.filter((category) => {
            const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesMenu = selectedMenuId ? category.menu_id === selectedMenuId : true;
            return matchesSearch && matchesMenu;
        });
    }, [categories, searchQuery, selectedMenuId]);

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
            accessorKey: 'image.url',
            header: 'Category',
            cell: (info) => (
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                        {info.row.original.image?.url ? (
                            <img src={info.row.original.image.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <i className="ri-image-line text-zinc-400 text-sm"></i>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-white">
                            {info.row.original.name}
                        </span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'menu.title',
            header: 'Assigned Menu',
            cell: (info) => <span className="text-zinc-500 dark:text-zinc-400 text-sm uppercase tracking-wider">{info.getValue() as string || 'N/A'}</span>
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
            accessorKey: 'is_active',
            header: 'Status',
            cell: (info) => <StatusBadge status={info.getValue() ? 'Active' : 'Inactive'} variant={info.getValue() ? 'success' : 'neutral'} />
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: (info) => {
                const category = info.row.original;
                const isGlobal = !category.store_id;
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
                            onClick={() => navigate(`/menu/categories/edit/${category.id}`)}
                        >
                            <i className="ri-edit-line mr-1 text-sm" />
                            {category.approval_status === 'REJECTED' ? 'Edit & Resubmit' : 'Edit'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10"
                            onClick={() => handleDelete(category.id)}
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
                    <h3 className="text-2xl font-semibold text-zinc-900 dark:text-white">Categories</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">Organize your menu items into logical groups.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant={isFilterVisible ? 'secondary' : 'outline'}
                        icon="ri-filter-3-line"
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                    >
                        {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
                    </Button>
                    <Button onClick={() => navigate('/menu/categories/new')} className="hidden sm:flex">
                        <i className="ri-add-line mr-2" /> Add Category
                    </Button>
                </div>
            </div>

            {isFilterVisible && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
                    <div className="w-full sm:w-64">
                        <Input
                            name="search"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e: any) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="sm:w-64">
                        <Select
                            placeholder="All Menus"
                            options={[{ label: 'All Menus', value: '' }, ...(menus?.map(m => ({ label: m.title, value: m.id })) || [])]}
                            value={selectedMenuId}
                            onChange={(val) => setSelectedMenuId(val as string)}
                        />
                    </div>
                    {(searchQuery || selectedMenuId) && (
                        <Button
                            variant="ghost"
                            className="text-red-500 hover:text-red-600 sm:w-auto"
                            onClick={() => { setSearchQuery(''); setSelectedMenuId(''); }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            )}

            <div className='border border-zinc-200 dark:border-zinc-700 rounded-lg'>
                <DataTable data={filteredCategories} columns={columns} isLoading={isLoading} />
            </div>

            <FloatingActionButton to="/menu/categories/new" label="Add Category" />
        </Container>
    );
};

export default CategoryList;

import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common/Button';
import Card from '../../../components/common/Card';
import { useMenus, Menu } from '../api/menuApi';
import { DataTable } from '../../../components/common/DataTable';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
import { FloatingActionButton } from '../../../components/common/FloatingActionButton';

const columns: ColumnDef<Menu>[] = [
    {
        accessorKey: 'title',
        header: 'Menu Title',
        cell: (info) => <span className="font-medium text-zinc-900 dark:text-white uppercase tracking-wider">{info.getValue() as string}</span>
    },
    {
        accessorKey: 'serving_from',
        header: 'From',
    },
    {
        accessorKey: 'serving_to',
        header: 'To',
    },
    {
        accessorKey: 'is_active',
        header: 'Status',
        cell: (info) => <StatusBadge status={info.getValue() ? 'Active' : 'Inactive'} variant={info.getValue() ? 'success' : 'neutral'} />
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: (info) => <ActionButtons menu={info.row.original} />
    }
];

import toast from 'react-hot-toast';
import { useDeleteMenu } from '../api/menuApi';
import Container from '../../../components/shared/Container';

const ActionButtons = ({ menu }: { menu: Menu }) => {
    const navigate = useNavigate();
    const deleteMutation = useDeleteMenu();

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete "${menu.title}"?`)) {
            const promise = deleteMutation.mutateAsync(menu.id);
            toast.promise(promise, {
                loading: 'Deleting menu...',
                success: 'Menu deleted successfully!',
                error: 'Failed to delete menu.',
            });
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/menu/edit/${menu.id}`)}>
                <i className="ri-edit-line mr-1 text-sm" /> Edit
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="text-red-500 hover:text-red-600 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
            >
                <i className="ri-delete-bin-line mr-1 text-sm" /> Delete
            </Button>
        </div>
    );
};

const MenuList = () => {
    const navigate = useNavigate();
    const { data: menus, isLoading } = useMenus();

    const sections = [
        {
            title: 'Categories',
            description: 'Manage menu categories (e.g. Starters, Main Course)',
            icon: 'ri-folders-line',
            link: '/menu/categories',
            countKey: 'categories'
        },
        {
            title: 'Menu Items',
            description: 'Manage individual dishes and prices',
            icon: 'ri-restaurant-line',
            link: '/menu/items',
            countKey: 'items'
        },
        {
            title: 'Add-On Groups',
            description: 'Manage customizations like toppings or variations',
            icon: 'ri-list-settings-line',
            link: '/menu/addon-groups',
            countKey: 'addon_groups'
        },
        {
            title: 'Deals & Combos',
            description: 'Create meal bundles and choice-based offers',
            icon: 'ri-percent-line',
            link: '/deals',
            countKey: 'deals'
        }
    ];

    return (
        <Container>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Menu Overview</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage categories, items, deals and menu schedules.</p>
                </div>
                <Button onClick={() => navigate('/menu/new')} variant="primary" className="hidden sm:flex">
                    <i className="ri-add-line mr-2"></i>
                    Add Menu
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {sections.map((section) => (
                    <Card key={section.title} className="hover:border-indigo-500 transition-colors cursor-pointer" onClick={() => navigate(section.link || '/')}>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center shrink-0">
                                <i className={`${section.icon} text-indigo-600 dark:text-indigo-400 text-2xl`} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{section.title}</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4">{section.description}</p>
                                <Button variant="outline" size="sm">Manage {section.title}</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Menu</h3>
                    <span className="text-xs text-zinc-500">Fetched: {menus?.length || 0} records</span>
                </div>
                <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg">
                    <DataTable data={menus || []} columns={columns} isLoading={isLoading} />
                </div>
            </div>

            <FloatingActionButton to="/menu/new" label="Add Menu" />
        </Container>
    );
};

export default MenuList;
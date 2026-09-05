import { AddonGroup, useAddonGroups, useDeleteAddonGroup } from '../../menu/api/menuApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { AddonGroupForm } from '../components/AddonGroupForm';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import Container from '../../../components/shared/Container';

const AddonGroupList = () => {
    const { data: groups, isLoading } = useAddonGroups();
    const deleteMutation = useDeleteAddonGroup();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<AddonGroup | null>(null);

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this add-on group? This will remove it from all associated items.')) {
            const promise = deleteMutation.mutateAsync(id);
            toast.promise(promise, {
                loading: 'Deleting group...',
                success: 'Group deleted successfully!',
                error: 'Failed to delete group.',
            });
        }
    };

    const columns: ColumnDef<AddonGroup>[] = [
        {
            accessorKey: 'name',
            header: 'Group Name',
            cell: (info) => <span className="font-semibold text-zinc-900 dark:text-white">{info.getValue() as string}</span>
        },
        {
            accessorKey: 'addons',
            header: 'Add-Ons',
            cell: (info) => {
                const addons = (info.getValue() as any[]) || [];
                const displayedAddons = addons.slice(0, 3);
                const remaining = addons.length - displayedAddons.length;
                return (
                    <div className="flex flex-wrap gap-1">
                        {displayedAddons.map((addon) => (
                            <span key={addon.id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                                {addon.name} (₹{addon.price})
                            </span>
                        ))}
                        {remaining > 0 && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">…</span>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Selection',
            cell: (info) => (
                <span className="text-sm text-zinc-500">
                    {info.row.original.min_selection} - {info.row.original.max_selection}
                </span>
            )
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setEditingGroup(info.row.original);
                            setIsFormOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600 border-red-100 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10"
                        onClick={() => handleDelete(info.row.original.id)}
                        isLoading={deleteMutation.isPending}
                    >
                        Delete
                    </Button>
                </div>
            )
        }
    ];

    return (
        <Container>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Add-On Groups</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage customizable options for your menu items.</p>
                </div>
                <Button onClick={() => {
                    setEditingGroup(null);
                    setIsFormOpen(true);
                }}>
                    <i className="ri-add-line mr-2" /> Create Group
                </Button>
            </div>

            {isFormOpen ? (
                <AddonGroupForm
                    initialValues={editingGroup || undefined}
                    onCancel={() => setIsFormOpen(false)}
                />
            ) : (
                <div>
                    <DataTable data={groups || []} columns={columns} isLoading={isLoading} />
                </div>
            )}
        </Container>
    );
};

export default AddonGroupList;

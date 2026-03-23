import { useNavigate } from 'react-router-dom';
import { useUsers, useDeleteUser, User } from '../api/usersApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';

const UserList = () => {
    const navigate = useNavigate();
    const { data: users, isLoading } = useUsers();
    const deleteMutation = useDeleteUser();

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const promise = deleteMutation.mutateAsync(id);
            toast.promise(promise, {
                loading: 'Deleting user...',
                success: 'User deleted successfully!',
                error: 'Failed to delete user.',
            });
        }
    };

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'full_name',
            header: 'Name',
            cell: (info) => <span className="font-semibold text-zinc-900 dark:text-white">{info.getValue() as string}</span>
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: (info) => <span className="capitalize text-zinc-600 dark:text-zinc-400 font-medium">{info.getValue() as string}</span>
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
                        onClick={() => navigate(`/users/edit/${info.row.original.id}`)}
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
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">User Management</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">Manage staff and administrators for your stores.</p>
                </div>
                <Button onClick={() => navigate('/users/new')}>
                    <i className="ri-user-add-line mr-2" /> Add User
                </Button>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                <DataTable data={users || []} columns={columns} isLoading={isLoading} />
            </div>
        </div>
    );
};

export default UserList;
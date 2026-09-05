import { useNavigate } from 'react-router-dom';
import { useUsers, useDeleteUser, User, UserFilters, usePasswordResetRequests, PasswordResetRequest } from '../api/usersApi';
import { DataTable } from '../../../components/common/DataTable';
import { Button } from '../../../components/common/Button';
import { StatusBadge } from '../../../components/common/StatusBadge';
import { ColumnDef } from '@tanstack/react-table';
import { FloatingActionButton } from '../../../components/common/FloatingActionButton';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useStores } from '../../stores/api/storesApi';
import IconButton from '../../../components/common/IconButton';
import { Select } from '../../../components/common/Select';
import { Input } from '../../../components/common/Input';
import { getApiErrorMessage } from '../../../utils/api';
import AdminResetPasswordModal from '../components/AdminResetPasswordModal';
import PasswordResetRequestsModal from '../components/PasswordResetRequestsModal';

const UserList = () => {
    const navigate = useNavigate();
    const { data: stores } = useStores();
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filters, setFilters] = useState<UserFilters>({
        full_name: '',
        role: '',
        store_id: ''
    });

    const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);
    const [selectedUserForReset, setSelectedUserForReset] = useState<Partial<User> | null>(null);
    const [activeRequestId, setActiveRequestId] = useState<string | null>(null);

    const { data: users, isLoading } = useUsers(filters);
    const { data: pendingRequests } = usePasswordResetRequests('PENDING');
    const deleteMutation = useDeleteUser();

    const pendingCount = pendingRequests?.length || 0;

    const handleFilterChange = (key: string, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            full_name: '',
            role: '',
            store_id: ''
        });
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            const promise = deleteMutation.mutateAsync(id);
            toast.promise(promise, {
                loading: 'Deleting user...',
                success: 'User deleted successfully!',
                error: (err) => getApiErrorMessage(err, 'Failed to delete user.'),
            });
        }
    };

    const roleOptions = [
        { label: 'Super Admin', value: 'SUPER_ADMIN' },
        { label: 'Store Admin', value: 'STORE_ADMIN' },
        { label: 'Manager', value: 'MANAGER' },
        { label: 'Cashier', value: 'CASHIER' },
        { label: 'Kitchen', value: 'KITCHEN' }
    ];

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: 'full_name',
            header: 'Name',
            cell: (info) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0 border border-zinc-200 dark:border-zinc-700">
                        {info.row.original.avatar?.url ? (
                            <img src={info.row.original.avatar.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <i className="ri-user-line text-zinc-400 text-sm"></i>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-white">{info.getValue() as string}</span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">{info.row.original.email}</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'role',
            header: 'Role',
            cell: (info) => (
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${info.getValue() === 'SUPER_ADMIN'
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}>
                    {(info.getValue() as string).replace('_', ' ')}
                </span>
            )
        },
        {
            header: 'Store',
            cell: (info) => (
                <span className={`text-sm font-medium ${!info.row.original.store_id ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-600 dark:text-zinc-400'}`}>
                    {info.row.original.store_id ? stores?.find(s => s.id === info.row.original.store_id)?.name : 'Global / Service'}
                </span>
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
            cell: (info) => (
                <div className="flex items-center gap-2">
                    <IconButton
                        icon="ri-key-line"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            setActiveRequestId(null);
                            setSelectedUserForReset(info.row.original);
                        }}
                        title="Reset Password"
                    />
                    <IconButton
                        icon="ri-edit-line"
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/users/edit/${info.row.original.id}`)}
                        title="Edit User"
                    />
                    <IconButton
                        icon="ri-delete-bin-line"
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(info.row.original.id)}
                        title="Delete User"
                        disabled={deleteMutation.isPending}
                    />
                </div>
            )
        }
    ];

    const handleResetPasswordForRequest = (req: PasswordResetRequest) => {
        setIsRequestsModalOpen(false);
        setActiveRequestId(req.id);
        setSelectedUserForReset(req.user || { id: req.user_id, email: req.user?.email || 'user', full_name: req.user?.full_name });
    };

    return (
        <div className="space-y-6 transition-all duration-300 ease-in-out">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white">User Management</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Manage staff and administrators for your stores.</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <Button
                        variant="outline"
                        icon="ri-shield-keyhole-line"
                        onClick={() => setIsRequestsModalOpen(true)}
                        className="relative"
                    >
                        <span>Password Requests</span>
                        {pendingCount > 0 && (
                            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-black animate-pulse">
                                {pendingCount}
                            </span>
                        )}
                    </Button>
                    <Button
                        variant={isFilterVisible ? 'secondary' : 'outline'}
                        icon="ri-filter-3-line"
                        onClick={() => setIsFilterVisible(!isFilterVisible)}
                    >
                        {isFilterVisible ? 'Hide Filters' : 'Filters'}
                    </Button>
                    <Button onClick={() => navigate('/users/new')} icon="ri-user-add-line" className="hidden sm:flex">
                        Add User
                    </Button>
                </div>
            </div>

            {isFilterVisible && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border dark:border-zinc-700 animate-in slide-in-from-top-2 duration-200">
                    <Input
                        label="Search Name"
                        placeholder="Type name..."
                        value={filters.full_name}
                        onChange={(e) => handleFilterChange('full_name', e.target.value)}
                    />
                    <Select
                        label="Store"
                        placeholder="All Stores"
                        options={[{ label: 'Global / All', value: '' }, ...(stores?.map(s => ({ label: s.name, value: s.id })) || [])]}
                        value={filters.store_id}
                        onChange={(val) => handleFilterChange('store_id', val)}
                    />
                    <Select
                        label="Role"
                        placeholder="All Roles"
                        options={[{ label: 'All Roles', value: '' }, ...roleOptions]}
                        value={filters.role}
                        onChange={(val) => handleFilterChange('role', val)}
                    />
                    <div className="flex items-end pb-1">
                        <button
                            onClick={clearFilters}
                            className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 ml-auto"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            <DataTable data={users || []} columns={columns} isLoading={isLoading} />

            <FloatingActionButton to="/users/new" label="Add User" />

            {/* Modals */}
            <PasswordResetRequestsModal
                isOpen={isRequestsModalOpen}
                onClose={() => setIsRequestsModalOpen(false)}
                onResetPasswordForRequest={handleResetPasswordForRequest}
            />

            <AdminResetPasswordModal
                isOpen={Boolean(selectedUserForReset)}
                onClose={() => {
                    setSelectedUserForReset(null);
                    setActiveRequestId(null);
                }}
                user={selectedUserForReset}
                requestId={activeRequestId}
            />
        </div>
    );
};

export default UserList;
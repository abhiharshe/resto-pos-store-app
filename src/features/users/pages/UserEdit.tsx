import { useNavigate, useParams } from 'react-router-dom';
import { useUsers, useUpdateUser } from '../api/usersApi';
import { UserForm as SharedUserForm } from '../components/UserForm';
import toast from 'react-hot-toast';

const UserEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: users, isLoading: usersLoading } = useUsers();
    const updateMutation = useUpdateUser();

    const user = users?.find(u => u.id === parseInt(id || ''));

    const handleSubmit = async (values: any) => {
        if (!id) return;
        const storeId = values.store_id ? parseInt(values.store_id) : null;

        const promise = updateMutation.mutateAsync({
            id: parseInt(id),
            ...values,
            store_id: isNaN(Number(storeId)) ? null : storeId
        });

        toast.promise(promise, {
            loading: 'Updating user...',
            success: 'User updated successfully!',
            error: 'Failed to update user.',
        });

        try {
            await promise;
            navigate('/users');
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    if (usersLoading) return <div className="py-10 text-center">Loading user...</div>;
    if (!user) return <div className="py-10 text-center">User not found.</div>;

    return (
        <div className="p-4 space-y-6">
            <SharedUserForm
                title="Edit User"
                initialValues={user}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isPending}
                onCancel={() => navigate('/users')}
            />
        </div>
    );
};

export default UserEdit;

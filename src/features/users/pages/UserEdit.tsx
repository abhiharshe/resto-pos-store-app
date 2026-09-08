import { useNavigate, useParams } from 'react-router-dom';
import { useUsers, useUpdateUser } from '../api/usersApi';
import { UserForm } from '../components/UserForm';
import { UserCustomPermissionsCard } from '../../permissions/components/UserCustomPermissionsCard';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';
import { getApiErrorMessage } from '../../../utils/api';
import { useHasPermission } from '../../../hooks/usePermission';

const UserEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: users, isLoading: usersLoading } = useUsers();
    const updateMutation = useUpdateUser();
    const canManagePermissions = useHasPermission('permissions:manage');

    const user = users?.find(u => u.id === id);

    const handleSubmit = async (values: any) => {
        if (!id) return;
        const { isNew, ...restValues } = values;
        const payload = {
            id,
            ...restValues,
            store_id: values.store_id && String(values.store_id).trim() !== '' ? String(values.store_id) : null,
        };

        const promise = updateMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: 'Updating user...',
            success: 'User updated successfully!',
            error: (err) => getApiErrorMessage(err, 'Failed to update user.'),
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
        <Container>
            <div className="space-y-8">
                <UserForm
                    title="Edit User"
                    initialValues={user}
                    onSubmit={handleSubmit}
                    isLoading={updateMutation.isPending}
                    onCancel={() => navigate('/users')}
                />

                {canManagePermissions && (
                    <UserCustomPermissionsCard
                        userId={user.id}
                        userRole={user.role}
                        userName={user.full_name || user.email}
                    />
                )}
            </div>
        </Container>
    );
};

export default UserEdit;

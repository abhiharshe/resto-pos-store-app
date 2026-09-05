import { useNavigate, useParams } from 'react-router-dom';
import { useUsers, useUpdateUser } from '../api/usersApi';
import { UserForm } from '../components/UserForm';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';
import { getApiErrorMessage } from '../../../utils/api';

const UserEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: users, isLoading: usersLoading } = useUsers();
    const updateMutation = useUpdateUser();

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
            <UserForm
                title="Edit User"
                initialValues={user}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isPending}
                onCancel={() => navigate('/users')}
            />
        </Container>
    );
};

export default UserEdit;

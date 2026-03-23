import { useNavigate } from 'react-router-dom';
import { useCreateUser } from '../api/usersApi';
import { UserForm } from '../components/UserForm';
import toast from 'react-hot-toast';

const UserCreate = () => {
    const navigate = useNavigate();
    const createMutation = useCreateUser();

    const handleSubmit = async (values: any) => {
        const storeId = values.store_id ? parseInt(values.store_id) : null;
        const promise = createMutation.mutateAsync({
            ...values,
            store_id: isNaN(Number(storeId)) ? null : storeId
        });

        toast.promise(promise, {
            loading: 'Creating user...',
            success: 'User created successfully!',
            error: 'Failed to create user.',
        });

        try {
            await promise;
            navigate('/users');
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <UserForm
                title="Add New User"
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending}
                onCancel={() => navigate('/users')}
            />
        </div>
    );
};

export default UserCreate;

import { useNavigate } from 'react-router-dom';
import { useCreateUser } from '../api/usersApi';
import { UserForm } from '../components/UserForm';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';
import { getApiErrorMessage } from '../../../utils/api';

const UserCreate = () => {
    const navigate = useNavigate();
    const createMutation = useCreateUser();

    const handleSubmit = async (values: any) => {
        const { isNew, ...restValues } = values;
        const payload = {
            ...restValues,
            store_id: values.store_id && String(values.store_id).trim() !== '' ? String(values.store_id) : null,
        };

        const promise = createMutation.mutateAsync(payload);

        toast.promise(promise, {
            loading: 'Creating user...',
            success: 'User created successfully!',
            error: (err) => getApiErrorMessage(err, 'Failed to create user.'),
        });

        try {
            await promise;
            navigate('/users');
        } catch (error) {
            console.error('Error creating user:', error);
        }
    };

    return (
        <Container>
            <UserForm
                title="Add New User"
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending}
                onCancel={() => navigate('/users')}
            />
        </Container>
    );
};

export default UserCreate;

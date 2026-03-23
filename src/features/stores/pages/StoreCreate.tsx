import { useNavigate } from 'react-router-dom';
import { useCreateStore, StoreFormValues } from '../api/storesApi';
import { StoreForm } from '../components/StoreForm';
import Card from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import toast from 'react-hot-toast';

const StoreCreatePage = () => {
    const navigate = useNavigate();
    const createMutation = useCreateStore();

    const handleSubmit = async (data: StoreFormValues) => {
        const promise = createMutation.mutateAsync(data);

        toast.promise(promise, {
            loading: 'Creating store...',
            success: 'Store created successfully!',
            error: 'Failed to create store.',
        });

        try {
            await promise;
            navigate('/stores');
        } catch (error) {
            console.error('Error creating store:', error);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <StoreForm
                title={`Create New Store`}
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending}
            />
        </div>
    );
};

export default StoreCreatePage;

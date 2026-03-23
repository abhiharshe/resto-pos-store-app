import { useParams, useNavigate } from 'react-router-dom';
import { useStore, useUpdateStore, StoreFormValues } from '../api/storesApi';
import { StoreForm } from '../components/StoreForm';
import Card from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import toast from 'react-hot-toast';

const StoreEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const storeId = parseInt(id || '0');

    const { data: store, isLoading: isFetching } = useStore(storeId);
    const updateMutation = useUpdateStore();

    const handleSubmit = async (data: Partial<StoreFormValues>) => {
        const promise = updateMutation.mutateAsync({ id: storeId, data });

        toast.promise(promise, {
            loading: 'Updating store...',
            success: 'Store updated successfully!',
            error: 'Failed to update store.',
        });

        try {
            await promise;
            navigate('/stores');
        } catch (error) {
            console.error('Error updating store:', error);
        }
    };

    if (isFetching) {
        return <div className="p-8 text-center"><i className="ri-loader-4-line animate-spin text-2xl text-indigo-600" /></div>;
    }

    if (!store) {
        return <div className="p-8 text-center text-red-500">Store not found</div>;
    }

    return (
        <div className="p-4 space-y-6">
            <StoreForm
                title="Edit Store"
                initialData={store}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isPending}
            />
        </div>
    );
};

export default StoreEdit;

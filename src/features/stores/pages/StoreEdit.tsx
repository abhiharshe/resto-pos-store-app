import { useParams, useNavigate } from 'react-router-dom';
import { useStore, useUpdateStore, StoreFormValues } from '../api/storesApi';
import { StoreForm } from '../components/StoreForm';
import { StoreChargesOverride } from '../components/StoreChargesOverride';
import { StoreMaintenanceCard } from '../components/StoreMaintenanceCard';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';

const StoreEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const storeId = id || '';

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
        <Container>
            <div className="space-y-8">
                <StoreForm
                    title="Edit Store"
                    initialData={store}
                    onSubmit={handleSubmit}
                    isLoading={updateMutation.isPending}
                />

                <StoreMaintenanceCard store={store} />

                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8">
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">Store Delivery & Packaging Overrides</h3>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                            Configure store-specific fee overrides or inherit the global configurations.
                        </p>
                    </div>
                    <StoreChargesOverride storeId={store.id} storeName={store.name} />
                </div>
            </div>
        </Container>
    );
};

export default StoreEdit;

import { useNavigate, useParams } from 'react-router-dom';
import { useMenuItems, useUpdateMenuItem } from '../../menu/api/menuApi';
import { useStores } from '../../stores/api/storesApi';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';
import { Button } from '../../../components/common/Button';
import ItemPricingForm from '../components/ItemPricingForm';

const ItemPricing = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: items, isLoading: isFetching } = useMenuItems();
    const { data: stores } = useStores();
    const updateMutation = useUpdateMenuItem();

    const item = items?.find(i => i.id === id);

    const handleSubmit = async (values: any) => {
        const promise = updateMutation.mutateAsync({
            id: id || '',
            variants: values.variants.map((v: any) => ({
                ...v,
                price: parseFloat(v.price)
            }))
        });

        toast.promise(promise, {
            loading: 'Saving pricing...',
            success: 'Pricing updated successfully!',
            error: 'Failed to update pricing.',
        });

        try {
            await promise;
            navigate('/menu/items');
        } catch (error) {
            console.error('Error updating pricing:', error);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Item not found</h3>
                <button onClick={() => navigate('/menu/items')} className="mt-4 text-indigo-600 hover:text-indigo-700">Go back to list</button>
            </div>
        );
    }

    return (
        <Container>
            <div className="w-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Manage Pricing for {item.name}</h3>
                        <p className="text-zinc-500 dark:text-zinc-400">Set base price and store-wise overrides.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            icon='ri-arrow-left-line'
                            onClick={() => navigate('/menu/items')}
                        >
                            Back to List
                        </Button>
                    </div>
                </div>
                <ItemPricingForm
                    item={item}
                    stores={stores}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/menu/items')}
                    isSaving={updateMutation.isPending}
                />
            </div>
        </Container >
    );
};

export default ItemPricing;

import { useNavigate, useParams } from 'react-router-dom';
import { useMenuItems, useUpdateMenuItem } from '../../menu/api/menuApi';
import { ItemForm } from '../components/ItemForm';
import toast from 'react-hot-toast';

const ItemEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: items, isLoading: isFetching } = useMenuItems();
    const updateMutation = useUpdateMenuItem();

    const item = items?.find(i => i.id === parseInt(id || '0'));

    const handleSubmit = async (values: any) => {
        const promise = updateMutation.mutateAsync({
            id: parseInt(id || '0'),
            ...values,
            variants: values.variants.map((v: any) => ({
                ...v,
                price: parseFloat(v.price)
            })),
            category_id: parseInt(values.category_id)
        });

        toast.promise(promise, {
            loading: 'Updating item...',
            success: 'Item updated successfully!',
            error: 'Failed to update item.',
        });

        try {
            await promise;
            navigate('/menu/items');
        } catch (error) {
            console.error('Error updating item:', error);
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
        <div className="p-4 space-y-6">
            <ItemForm
                title="Edit Menu Item"
                initialValues={{
                    ...item,
                    image_urls: item.images?.map(img => img.image_url) || []
                }}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isPending}
            />
        </div>
    );
};

export default ItemEdit;

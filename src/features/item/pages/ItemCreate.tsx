import { useNavigate } from 'react-router-dom';
import { useCreateMenuItem } from '../../menu/api/menuApi';
import { ItemForm } from '../components/ItemForm';
import toast from 'react-hot-toast';

const ItemCreate = () => {
    const navigate = useNavigate();
    const createMutation = useCreateMenuItem();

    const handleSubmit = async (values: any) => {
        const promise = createMutation.mutateAsync({
            ...values,
            variants: values.variants.map((v: any) => ({
                ...v,
                price: parseFloat(v.price)
            })),
            category_id: parseInt(values.category_id)
        });

        toast.promise(promise, {
            loading: 'Creating item...',
            success: 'Item created successfully!',
            error: 'Failed to create item.',
        });

        try {
            await promise;
            navigate('/menu/items');
        } catch (error) {
            console.error('Error creating item:', error);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <ItemForm
                title="Create New Item"
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending}
            />
        </div>
    );
};

export default ItemCreate;

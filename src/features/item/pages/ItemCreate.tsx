import { useNavigate } from 'react-router-dom';
import { useCreateMenuItem } from '../../menu/api/menuApi';
import { ItemForm } from '../components/ItemForm';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';

const ItemCreate = () => {
    const navigate = useNavigate();
    const createMutation = useCreateMenuItem();

    const handleSubmit = async (values: any) => {
        const promise = createMutation.mutateAsync({
            ...values,
            category_id: values.category_id
        });

        toast.promise(promise, {
            loading: 'Creating item...',
            success: 'Item created successfully!',
            error: 'Failed to create item.',
        });

        try {
            const createdItem = await promise;
            navigate(`/menu/items/${createdItem.id}/pricing`);
        } catch (error) {
            console.error('Error creating item:', error);
        }
    };

    return (
        <Container>
            <ItemForm
                title="Create New Item"
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending}
            />
        </Container>
    );
};

export default ItemCreate;

import { useNavigate } from 'react-router-dom';
import { useCreateCategory } from '../../menu/api/menuApi';
import { CategoryForm } from '../components/CategoryForm';
import toast from 'react-hot-toast';

const CategoryCreate = () => {
    const navigate = useNavigate();
    const createMutation = useCreateCategory();

    const handleSubmit = async (values: any) => {
        const promise = createMutation.mutateAsync(values);

        toast.promise(promise, {
            loading: 'Creating category...',
            success: 'Category created successfully!',
            error: 'Failed to create category.',
        });

        try {
            await promise;
            navigate('/menu/categories');
        } catch (error) {
            console.error('Error creating category:', error);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <CategoryForm
                title="Add New Category"
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending}
                onCancel={() => navigate('/menu/categories')}
            />
        </div>
    );
};

export default CategoryCreate;

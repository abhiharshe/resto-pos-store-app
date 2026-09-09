import { useNavigate, useParams } from 'react-router-dom';
import { useCategories, useUpdateCategory } from '../../menu/api/menuApi';
import { CategoryForm } from '../components/CategoryForm';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';

const CategoryEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: categories, isLoading: isFetching } = useCategories();
    const updateMutation = useUpdateCategory();

    const category = categories?.find(c => c.id === id);

    const handleSubmit = async (values: any) => {
        if (!id) return;

        const promise = updateMutation.mutateAsync({ id: Number(id), ...values });

        toast.promise(promise, {
            loading: 'Updating category...',
            success: 'Category updated successfully!',
            error: 'Failed to update category.',
        });

        try {
            await promise;
            navigate('/menu/categories');
        } catch (error) {
            console.error('Error updating category:', error);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Category not found</h2>
                <button
                    onClick={() => navigate('/menu/categories')}
                    className="mt-4 text-indigo-600 hover:text-indigo-700"
                >
                    Back to Categories
                </button>
            </div>
        );
    }

    return (
        <Container>
            <CategoryForm
                title="Edit Category"
                initialValues={category}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isPending}
                onCancel={() => navigate('/menu/categories')}
            />
        </Container>
    );
};

export default CategoryEdit;

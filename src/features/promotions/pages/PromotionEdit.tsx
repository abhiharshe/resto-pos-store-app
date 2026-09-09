import { useParams, useNavigate } from 'react-router-dom';
import { usePromotion, useUpdatePromotion, PromotionCreate as PromotionUpdateType } from '../api/promotionsApi';
import { PromotionForm } from '../components/PromotionForm';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';

const PromotionEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: promotion, isLoading } = usePromotion(id);
    const updateMutation = useUpdatePromotion();

    const handleSubmit = async (values: PromotionUpdateType) => {
        if (!id) return;
        try {
            await updateMutation.mutateAsync({ id, ...values });
            toast.success('Promotion updated successfully!');
            navigate('/promotions');
        } catch (err) {
            toast.error('Failed to update promotion');
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <i className="ri-loader-4-line animate-spin text-4xl text-indigo-600"></i>
            </div>
        );
    }

    if (!promotion) {
        return (
            <div className="text-center p-8 bg-white dark:bg-mauve-900 rounded-2xl shadow-sm border border-zinc-100 dark:border-mauve-800">
                <i className="ri-error-warning-line text-4xl text-red-500 mb-4"></i>
                <h2 className="text-xl font-semibold dark:text-white mb-2">Promotion Not Found</h2>
                <button onClick={() => navigate('/promotions')} className="text-indigo-600 font-semibold hover:underline">
                    Back to Promotions
                </button>
            </div>
        );
    }

    return (
        <Container>
            <PromotionForm
                title="Edit Promotion"
                initialData={promotion}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isPending}
            />
        </Container>
    );
};

export default PromotionEdit;

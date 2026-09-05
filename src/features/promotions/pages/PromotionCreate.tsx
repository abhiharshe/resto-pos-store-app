import { useNavigate } from 'react-router-dom';
import { useCreatePromotion, PromotionCreate as PromotionCreateType } from '../api/promotionsApi';
import { PromotionForm } from '../components/PromotionForm';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';

const PromotionCreate = () => {
    const navigate = useNavigate();
    const createMutation = useCreatePromotion();

    const handleSubmit = async (values: PromotionCreateType) => {
        try {
            await createMutation.mutateAsync(values);
            toast.success('Promotion created successfully!');
            navigate('/promotions');
        } catch (err) {
            toast.error('Failed to create promotion');
            console.error(err);
        }
    };

    return (
        <Container>
            <PromotionForm
                title="Create Promotion"
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending}
            />
        </Container>
    );
};

export default PromotionCreate;

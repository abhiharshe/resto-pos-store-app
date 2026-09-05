import { useNavigate } from 'react-router-dom';
import { useCreateCoupon, CouponCreate as CouponCreateData } from '../api/couponsApi';
import { CouponForm } from '../components/CouponForm';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';

const CouponCreate = () => {
    const navigate = useNavigate();
    const createMutation = useCreateCoupon();

    const handleSubmit = async (data: CouponCreateData) => {
        const promise = createMutation.mutateAsync(data);

        toast.promise(promise, {
            loading: 'Creating coupon...',
            success: 'Coupon created successfully!',
            error: (err: any) => err.response?.data?.detail || 'Failed to create coupon.',
        });

        try {
            await promise;
            navigate('/coupons');
        } catch (error) {
            console.error('Error creating coupon:', error);
        }
    };

    return (
        <Container>
            <CouponForm
                title="Create New Coupon"
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending}
            />
        </Container>
    );
};

export default CouponCreate;

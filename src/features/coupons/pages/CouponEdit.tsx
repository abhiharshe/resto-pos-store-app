import { useParams, useNavigate } from 'react-router-dom';
import { useCoupon, useUpdateCoupon, CouponCreate } from '../api/couponsApi';
import { CouponForm } from '../components/CouponForm';
import toast from 'react-hot-toast';
import { Skeleton } from '../../../components/common/Skeleton';
import Container from '../../../components/shared/Container';

const CouponEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: coupon, isLoading } = useCoupon(id);
    const updateMutation = useUpdateCoupon();

    const handleSubmit = async (data: CouponCreate) => {
        if (!id) return;
        const promise = updateMutation.mutateAsync({ id, ...data });

        toast.promise(promise, {
            loading: 'Updating coupon...',
            success: 'Coupon updated successfully!',
            error: (err: any) => err.response?.data?.detail || 'Failed to update coupon.',
        });

        try {
            await promise;
            navigate('/coupons');
        } catch (error) {
            console.error('Error updating coupon:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="p-4 space-y-6 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-4">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    if (!coupon) {
        return (
            <div className="p-4 text-center">
                <p className="text-zinc-500">Coupon not found.</p>
                <button
                    onClick={() => navigate('/coupons')}
                    className="mt-4 text-indigo-600 font-medium"
                >
                    Back to List
                </button>
            </div>
        );
    }

    return (
        <Container>
            <CouponForm
                title={`Edit Coupon: ${coupon.code}`}
                initialData={coupon}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isPending}
            />
        </Container>
    );
};

export default CouponEdit;

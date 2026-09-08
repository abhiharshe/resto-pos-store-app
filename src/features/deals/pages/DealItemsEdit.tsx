import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal, useUpdateDealItems } from '../api/dealsApi';
import { DealItemsForm } from '../components/DealItemsForm';
import Container from '../../../components/shared/Container';
import toast from 'react-hot-toast';

const DealItemsEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: deal, isLoading: isFetching } = useDeal(id);
    const updateMutation = useUpdateDealItems();

    const handleSubmit = async (values: any) => {
        if (!id) return;
        try {
            await updateMutation.mutateAsync({
                id,
                items: values
            });
            toast.success('Deal items updated successfully!');
            navigate('/deals');
        } catch (err) {
            toast.error('Failed to update deal items. Please check your inputs.');
            console.error(err);
        }
    };

    if (isFetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!deal) {
        return (
            <Container>
                <div className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200">
                    <p className="text-red-600 font-semibold uppercase tracking-widest text-xs">Deal not found</p>
                    <button onClick={() => navigate('/deals')} className="mt-4 text-indigo-600 font-semibold hover:underline">Back to Deals</button>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <div className="mb-8">
                <div className="flex items-center gap-2 text-zinc-500 mb-2">
                    <button onClick={() => navigate('/deals')} className="hover:text-indigo-600 transition-colors">Deals</button>
                    <i className="ri-arrow-right-s-line"></i>
                    <span className="text-zinc-900 dark:text-white font-medium">{deal.title}</span>
                </div>
                <h1 className="text-3xl font-black text-zinc-900 dark:text-white">Manage Deal Items</h1>
                <p className="text-zinc-500 mt-1 uppercase tracking-widest text-[10px] font-black underline decoration-indigo-500 decoration-2 underline-offset-4">Standalone Group Management</p>
            </div>

            <DealItemsForm
                initialData={deal}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isPending}
                onCancel={() => navigate('/deals')}
            />
        </Container>
    );
};

export default DealItemsEdit;

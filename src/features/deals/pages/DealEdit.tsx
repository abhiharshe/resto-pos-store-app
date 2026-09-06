import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDeal, useUpdateDeal, DealCreate as DealCreateType } from '../api/dealsApi';
import { DealEditForm } from '../components/DealEditForm';
import toast from 'react-hot-toast';
import Container from '../../../components/shared/Container';

const DealEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: deal, isLoading: isFetching } = useDeal(id);
    const updateMutation = useUpdateDeal();

    const handleSubmit = async (values: DealCreateType) => {
        if (!id) return;
        try {
            await updateMutation.mutateAsync({ id, deal: values });
            toast.success('Deal updated successfully!');
            navigate('/deals');
        } catch (err) {
            toast.error('Failed to update deal. Please check your inputs.');
            console.error(err);
        }
    };

    if (isFetching) return <div className="p-8 text-center text-zinc-500 font-bold animate-pulse uppercase tracking-[0.2em]">Retrieving deal data...</div>;
    if (!deal) return <div className="p-8 text-center text-red-500">Deal not found.</div>;

    return (
        <Container>
            <DealEditForm
                title="Edit Deal"
                initialData={deal}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isPending}
            />
        </Container>
    );
};

export default DealEdit;

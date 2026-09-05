import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateDeal, DealCreate as DealCreateType } from '../api/dealsApi';
import { DealCreateForm } from '../components/DealCreateForm';
import toast from 'react-hot-toast';

const DealCreate = () => {
    const navigate = useNavigate();
    const createMutation = useCreateDeal();

    const handleSubmit = async (values: DealCreateType) => {
        try {
            await createMutation.mutateAsync(values);
            toast.success('Deal created successfully!');
            navigate('/deals');
        } catch (err) {
            toast.error('Failed to create deal. Please check your inputs.');
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 transition-all duration-300 ease-in-out">
            <DealCreateForm
                title="Create New Deal"
                onSubmit={handleSubmit}
                isLoading={createMutation.isPending}
            />
        </div>
    );
};

export default DealCreate;

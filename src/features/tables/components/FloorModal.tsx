import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { Floor, FloorCreateInput, FloorUpdateInput, useCreateFloor, useUpdateFloor } from '../api/tablesApi';
import Modal from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { NumberInput } from '../../../components/common/NumberInput';
import { Select } from '../../../components/common/Select';
import Button from '../../../components/common/Button';

interface FloorModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
    floorToEdit?: Floor | null;
}

const validationSchema = Yup.object({
    name: Yup.string().required('Floor name is required').max(100, 'Max 100 characters'),
    floor_number: Yup.number().integer().required('Floor number is required'),
    display_order: Yup.number().integer().min(0),
    description: Yup.string().nullable(),
    status: Yup.string().oneOf(['ACTIVE', 'INACTIVE']).required(),
});

export const FloorModal: React.FC<FloorModalProps> = ({
    isOpen,
    onClose,
    storeId,
    floorToEdit,
}) => {
    const createFloor = useCreateFloor();
    const updateFloor = useUpdateFloor();

    const isEditing = !!floorToEdit;

    const formik = useFormik({
        initialValues: {
            name: floorToEdit?.name || '',
            floor_number: floorToEdit?.floor_number ?? 0,
            display_order: floorToEdit?.display_order ?? 0,
            description: floorToEdit?.description || '',
            status: floorToEdit?.status || 'ACTIVE',
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            try {
                if (isEditing && floorToEdit) {
                    await updateFloor.mutateAsync({
                        floorId: floorToEdit.id,
                        storeId,
                        data: values as FloorUpdateInput,
                    });
                    toast.success('Floor updated successfully');
                } else {
                    await createFloor.mutateAsync({
                        storeId,
                        data: values as FloorCreateInput,
                    });
                    toast.success('Floor created successfully');
                }
                onClose();
            } catch (err: any) {
                toast.error(err?.response?.data?.detail || 'Failed to save floor');
            }
        },
    });

    const isSubmitting = createFloor.isPending || updateFloor.isPending;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Floor' : 'Add New Floor'}
            size="md"
        >
            <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
                <Input
                    label="Floor Name"
                    name="name"
                    required
                    placeholder="e.g. Ground Floor, Rooftop, Terrace"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.name && formik.errors.name ? formik.errors.name : undefined}
                />

                <div className="grid grid-cols-2 gap-3">
                    <NumberInput
                        label="Floor Level / No."
                        name="floor_number"
                        placeholder="0"
                        value={formik.values.floor_number}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.floor_number && formik.errors.floor_number ? String(formik.errors.floor_number) : undefined}
                    />
                    <NumberInput
                        label="Display Order"
                        name="display_order"
                        placeholder="0"
                        value={formik.values.display_order}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.display_order && formik.errors.display_order ? String(formik.errors.display_order) : undefined}
                    />
                </div>

                <Select
                    label="Status"
                    value={formik.values.status}
                    onChange={(val) => formik.setFieldValue('status', val)}
                    options={[
                        { label: 'ACTIVE', value: 'ACTIVE' },
                        { label: 'INACTIVE', value: 'INACTIVE' },
                    ]}
                />

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                        Description / Notes
                    </label>
                    <textarea
                        name="description"
                        rows={3}
                        placeholder="Optional notes regarding this floor..."
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        className="block w-full sm:text-sm rounded-md transition-colors py-2 px-4 border border-mauve-200 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-neutral-800 resize-none"
                    />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-mauve-800 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isSubmitting}
                    >
                        {isEditing ? 'Save Changes' : 'Create Floor'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default FloorModal;

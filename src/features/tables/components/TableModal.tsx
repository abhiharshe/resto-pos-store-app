import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import {
    Floor,
    TableDetail,
    useCreateTable,
    useUpdateTable,
} from '../api/tablesApi';
import Modal from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { NumberInput } from '../../../components/common/NumberInput';
import { Select } from '../../../components/common/Select';
import { Checkbox } from '../../../components/common/Checkbox';
import Button from '../../../components/common/Button';

interface TableModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
    floors: Floor[];
    selectedFloorId?: string;
    tableToEdit?: TableDetail | null;
}

const validationSchema = Yup.object({
    floor_id: Yup.string().required('Floor is required'),
    table_number: Yup.string().required('Table number/code is required').max(50, 'Max 50 characters'),
    name: Yup.string().nullable(),
    capacity: Yup.number().integer().min(1, 'Capacity must be at least 1').required('Capacity is required'),
    min_capacity: Yup.number().integer().min(1, 'Minimum capacity must be at least 1'),
    shape: Yup.string().oneOf(['RECTANGLE', 'ROUND', 'SQUARE']).required(),
    status: Yup.string().oneOf(['ACTIVE', 'INACTIVE', 'MAINTENANCE']).required(),
    display_order: Yup.number().integer().min(0),
    description: Yup.string().nullable(),
    generate_seats: Yup.boolean(),
});

export const TableModal: React.FC<TableModalProps> = ({
    isOpen,
    onClose,
    storeId,
    floors,
    selectedFloorId,
    tableToEdit,
}) => {
    const createTable = useCreateTable();
    const updateTable = useUpdateTable();

    const isEditing = !!tableToEdit;

    const formik = useFormik({
        initialValues: {
            floor_id: tableToEdit?.floor_id || selectedFloorId || floors[0]?.id || '',
            table_number: tableToEdit?.table_number || '',
            name: tableToEdit?.name || '',
            capacity: tableToEdit?.capacity ?? 4,
            min_capacity: tableToEdit?.min_capacity ?? 1,
            shape: tableToEdit?.shape || 'RECTANGLE',
            status: tableToEdit?.status || 'ACTIVE',
            display_order: tableToEdit?.display_order ?? 0,
            description: tableToEdit?.description || '',
            generate_seats: true,
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            try {
                if (isEditing && tableToEdit) {
                    await updateTable.mutateAsync({
                        tableId: tableToEdit.id,
                        storeId,
                        data: {
                            floor_id: values.floor_id,
                            table_number: values.table_number,
                            name: values.name || null,
                            capacity: values.capacity,
                            min_capacity: values.min_capacity,
                            shape: values.shape as any,
                            status: values.status as any,
                            display_order: values.display_order,
                            description: values.description || null,
                        },
                    });
                    toast.success('Table updated successfully');
                } else {
                    await createTable.mutateAsync({
                        storeId,
                        data: {
                            floor_id: values.floor_id,
                            table_number: values.table_number,
                            name: values.name || null,
                            capacity: values.capacity,
                            min_capacity: values.min_capacity,
                            shape: values.shape as any,
                            status: values.status as any,
                            display_order: values.display_order,
                            description: values.description || null,
                            generate_seats: values.generate_seats,
                        },
                    });
                    toast.success('Table created successfully');
                }
                onClose();
            } catch (err: any) {
                toast.error(err?.response?.data?.detail || 'Failed to save table');
            }
        },
    });

    const isSubmitting = createTable.isPending || updateTable.isPending;

    const floorOptions = floors.map((f) => ({
        label: `${f.name}${f.status === 'INACTIVE' ? ' (Inactive)' : ''}`,
        value: f.id,
    }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Edit Table' : 'Add New Table'}
            size="lg"
        >
            <form onSubmit={formik.handleSubmit} className="p-6 space-y-4">
                <Select
                    label="Floor Location"
                    required
                    value={formik.values.floor_id}
                    onChange={(val) => formik.setFieldValue('floor_id', val)}
                    options={floorOptions}
                    error={formik.touched.floor_id && formik.errors.floor_id ? formik.errors.floor_id : undefined}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                        label="Table Number / Code"
                        name="table_number"
                        required
                        placeholder="e.g. T01, G-12"
                        value={formik.values.table_number}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.table_number && formik.errors.table_number ? formik.errors.table_number : undefined}
                    />
                    <Input
                        label="Display Label / Name"
                        name="name"
                        placeholder="e.g. Window Booth 1"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <NumberInput
                        label="Capacity (Max)"
                        name="capacity"
                        min={1}
                        value={formik.values.capacity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.capacity && formik.errors.capacity ? String(formik.errors.capacity) : undefined}
                    />
                    <NumberInput
                        label="Min Capacity"
                        name="min_capacity"
                        min={1}
                        value={formik.values.min_capacity}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.min_capacity && formik.errors.min_capacity ? String(formik.errors.min_capacity) : undefined}
                    />
                    <Select
                        label="Shape"
                        value={formik.values.shape}
                        onChange={(val) => formik.setFieldValue('shape', val)}
                        options={[
                            { label: 'Rectangle', value: 'RECTANGLE' },
                            { label: 'Round', value: 'ROUND' },
                            { label: 'Square', value: 'SQUARE' },
                        ]}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                        label="Status"
                        value={formik.values.status}
                        onChange={(val) => formik.setFieldValue('status', val)}
                        options={[
                            { label: 'ACTIVE', value: 'ACTIVE' },
                            { label: 'MAINTENANCE', value: 'MAINTENANCE' },
                            { label: 'INACTIVE', value: 'INACTIVE' },
                        ]}
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

                {!isEditing && (
                    <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-zinc-100 dark:border-mauve-800 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-neutral-900 dark:text-zinc-100">
                                Auto-Generate Individual Seats
                            </p>
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                                Creates {formik.values.capacity} seat records (S1, S2, ...) for individual physical tracking.
                            </p>
                        </div>
                        <Checkbox
                            name="generate_seats"
                            checked={formik.values.generate_seats}
                            onChange={(e) => formik.setFieldValue('generate_seats', e.target.checked)}
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                        Description / Special Attributes
                    </label>
                    <textarea
                        name="description"
                        rows={2}
                        placeholder="e.g. Near window, outdoor patio seating, power outlet available..."
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
                        {isEditing ? 'Save Changes' : 'Create Table'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default TableModal;

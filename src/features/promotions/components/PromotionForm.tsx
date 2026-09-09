import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Promotion, PromotionCreate } from '../api/promotionsApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { useMenuItems, useUploadImage } from '../../menu/api/menuApi';
import { useStores } from '../../stores/api/storesApi';
import Card from '../../../components/common/Card';
import { useNavigate } from 'react-router-dom';
import { getMediaURL } from '../../../utils/api';

const PromotionSchema = Yup.object().shape({
    title: Yup.string().required('Title is required').max(255),
    type: Yup.string().required('Type is required'),
    store_id: Yup.string().required('Store is required'),
    buy_item_id: Yup.string().nullable().when('type', {
        is: (val: string) => val === 'BXGY' || val === 'ITEM_DISCOUNT',
        then: (schema) => schema.required('Trigger item is required'),
    }),
    buy_quantity: Yup.number().min(1, 'Min 1').required(),
    get_item_id: Yup.string().nullable().when('type', {
        is: 'BXGY',
        then: (schema) => schema.required('Free item is required'),
    }),
    get_quantity: Yup.number().when('type', {
        is: 'BXGY',
        then: (schema) => schema.min(1, 'Min 1').required(),
        otherwise: (schema) => schema.notRequired(),
    }),
    discount_percentage: Yup.number().when('type', {
        is: 'ITEM_DISCOUNT',
        then: (schema) => schema.min(0).max(100).required(),
        otherwise: (schema) => schema.notRequired(),
    }),
});

export interface PromotionFormProps {
    initialData?: Promotion;
    onSubmit: (values: any) => Promise<void> | void;
    isLoading?: boolean;
    title: string;
    onCancel?: () => void;
}

export const PromotionForm: React.FC<PromotionFormProps> = ({
    initialData,
    onSubmit,
    isLoading,
    title,
    onCancel
}) => {
    const navigate = useNavigate();
    const { data: menuItems } = useMenuItems();
    const { data: stores } = useStores();
    const uploadImageMutation = useUploadImage();

    const itemOptions = [
        { label: 'Select an item...', value: '' },
        ...(menuItems?.map(item => ({ label: item.name, value: item.id })) || [])
    ];

    const storeOptions = [
        { label: 'Select a store...', value: '' },
        ...(stores?.map(s => ({ label: s.name, value: s.id })) || [])
    ];

    const typeOptions = [
        { label: 'Buy X Get Y Free (BXGY)', value: 'BXGY' },
        { label: 'Item Level Discount', value: 'ITEM_DISCOUNT' }
    ];

    const initialValues: PromotionCreate = {
        title: initialData?.title || '',
        description: initialData?.description || '',
        image_url: initialData?.image_url || '',
        type: initialData?.type || 'BXGY',
        buy_item_id: initialData?.buy_item_id || '',
        buy_quantity: initialData?.buy_quantity || 1,
        get_item_id: initialData?.get_item_id || '',
        get_quantity: initialData?.get_quantity || 1,
        discount_percentage: initialData?.discount_percentage || 0,
        max_applications: initialData?.max_applications || 1,
        is_stackable: initialData?.is_stackable ?? false,
        is_active: initialData?.is_active ?? true,
        store_id: initialData?.store_id || (stores && stores[0] ? stores[0].id : ''),
        start_date: initialData?.start_date ? initialData.start_date.split('T')[0] : '',
        end_date: initialData?.end_date ? initialData.end_date.split('T')[0] : '',
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setFieldValue: any) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const res = await uploadImageMutation.mutateAsync(file);
                setFieldValue('image_url', res.url);
            } catch (err) {
                console.error('Image upload failed', err);
            }
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-zinc-500 font-medium">{initialData ? `Editing promotion: ${initialData.title}` : 'Launch a new automated store offer'}</p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/promotions')} icon="ri-arrow-left-line">
                    Back to List
                </Button>
            </div>
            <Card className="w-full mb-6">
                <Formik
                    initialValues={initialValues}
                    validationSchema={PromotionSchema}
                    onSubmit={(values) => {
                        const formatted: PromotionCreate = {
                            ...values,
                            buy_item_id: values.buy_item_id || undefined,
                            get_item_id: (values.type === 'BXGY' && values.get_item_id) ? values.get_item_id : undefined,
                            get_quantity: values.type === 'BXGY' ? Number(values.get_quantity) : 0,
                            discount_percentage: values.type === 'ITEM_DISCOUNT' ? Number(values.discount_percentage) : 0,
                            description: values.description || undefined,
                            image_url: values.image_url || undefined,
                            start_date: values.start_date || undefined,
                            end_date: values.end_date || undefined,
                        };
                        onSubmit(formatted);
                    }}
                    enableReinitialize
                >
                    {({ values, errors, touched, setFieldValue, isSubmitting, handleChange }) => (
                        <Form className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Offer Title"
                                    name="title"
                                    placeholder="Summer Burger Mania"
                                    required
                                    value={values.title}
                                    onChange={handleChange}
                                    error={touched.title && errors.title ? (errors.title as string) : undefined}
                                />
                                <Select
                                    label="Store Location"
                                    options={storeOptions}
                                    value={values.store_id}
                                    onChange={(val) => setFieldValue('store_id', val)}
                                    required
                                    error={touched.store_id && errors.store_id ? (errors.store_id as string) : undefined}
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="Description"
                                        name="description"
                                        placeholder="Briefly describe the offer for customers..."
                                        value={values.description}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Offer Banner Image</label>
                                <div className="flex items-center gap-6 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-dashed border-mauve-200 dark:border-zinc-700">
                                    {values.image_url ? (
                                        <div className="relative group">
                                            <img src={getMediaURL(values.image_url)} alt="Promotion" className="w-24 h-24 object-cover rounded-xl shadow-md" />
                                            <button
                                                type="button"
                                                onClick={() => setFieldValue('image_url', '')}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                            >
                                                <i className="ri-close-line"></i>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24 bg-neutral-100 dark:bg-mauve-900 rounded-xl flex items-center justify-center text-zinc-300">
                                            <i className="ri-image-add-line text-3xl"></i>
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            id="image-upload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleImageUpload(e, setFieldValue)}
                                        />
                                        <label
                                            htmlFor="image-upload"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-zinc-700 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer hover:bg-neutral-50 transition-colors shadow-sm"
                                        >
                                            <i className="ri-upload-2-line"></i>
                                            {uploadImageMutation.isPending ? 'Uploading...' : 'Upload Image'}
                                        </label>
                                        <p className="mt-1 text-xs text-zinc-400">PNG, JPG up to 2MB. Recommended: 800x400px</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-zinc-100 dark:border-mauve-800 space-y-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <i className="ri-percent-line text-indigo-500 text-xl"></i>
                                    <h4 className="text-sm font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">Promotion Configuration</h4>
                                </div>

                                <Select
                                    label="Promotion Type"
                                    options={typeOptions}
                                    value={values.type}
                                    onChange={(val) => setFieldValue('type', val)}
                                    required
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select
                                        label="Trigger Item (Buy...)"
                                        options={itemOptions}
                                        value={values.buy_item_id}
                                        onChange={(val) => setFieldValue('buy_item_id', val)}
                                        required
                                    />
                                    <Input
                                        label="Required Quantity"
                                        name="buy_quantity"
                                        type="number"
                                        value={values.buy_quantity}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {values.type === 'BXGY' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100/50 dark:border-indigo-900/20">
                                        <Select
                                            label="Free Item (Get...)"
                                            options={itemOptions}
                                            value={values.get_item_id}
                                            onChange={(val) => setFieldValue('get_item_id', val)}
                                            required
                                        />
                                        <Input
                                            label="Free Quantity"
                                            name="get_quantity"
                                            type="number"
                                            value={values.get_quantity}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                ) : (
                                    <div className="p-4 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100/50 dark:border-green-900/20">
                                        <Input
                                            label="Discount Percentage (%)"
                                            name="discount_percentage"
                                            type="number"
                                            placeholder="10"
                                            value={values.discount_percentage}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-zinc-100 dark:border-mauve-800">
                                <Input
                                    label="Start Date"
                                    name="start_date"
                                    type="date"
                                    value={values.start_date || ''}
                                    onChange={(e) => setFieldValue('start_date', e.target.value)}
                                />
                                <Input
                                    label="End Date"
                                    name="end_date"
                                    type="date"
                                    value={values.end_date || ''}
                                    onChange={(e) => setFieldValue('end_date', e.target.value)}
                                />
                                <Input
                                    label="Max Uses Per Order"
                                    name="max_applications"
                                    type="number"
                                    value={values.max_applications}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-zinc-100 dark:border-mauve-800">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={values.is_active}
                                            onChange={(e) => setFieldValue('is_active', e.target.checked)}
                                        />
                                        <div className="w-10 h-6 bg-neutral-200 peer-focus:outline-none dark:bg-neutral-700 peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">Active Status</p>
                                        <p className="text-xs text-zinc-500 font-medium">Allow this offer to be applied to orders.</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={values.is_stackable}
                                            onChange={(e) => setFieldValue('is_stackable', e.target.checked)}
                                        />
                                        <div className="w-10 h-6 bg-neutral-200 peer-focus:outline-none dark:bg-neutral-700 peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-neutral-900 dark:text-white">Stackable</p>
                                        <p className="text-xs text-zinc-500 font-medium">Can be combined with manual coupons.</p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t dark:border-mauve-800">
                                <Button type="button" variant="ghost" onClick={onCancel || (() => navigate('/promotions'))}>
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={isLoading || isSubmitting} icon="ri-save-line">
                                    {initialData ? 'Update Offer' : 'Launch Offer'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </div>
    );
};

export default PromotionForm;

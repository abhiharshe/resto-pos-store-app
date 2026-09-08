import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Select } from '../../../components/common/Select';
import { Coupon, CouponCreate } from '../api/couponsApi';
import { useStores } from '../../stores/api/storesApi';
import Card from '../../../components/common/Card';
import { useNavigate } from 'react-router-dom';

interface CouponFormProps {
    title: string;
    initialData?: Coupon;
    onSubmit: (data: CouponCreate) => void;
    isLoading?: boolean;
}

const CouponSchema = Yup.object().shape({
    code: Yup.string().required('Coupon code is required').max(50, 'Max 50 characters'),
    discount_type: Yup.string().oneOf(['FLAT', 'PERCENTAGE']).required('Required'),
    discount_value: Yup.number().positive('Must be positive').required('Required'),
    min_order_amount: Yup.number().min(0, 'Min 0').required('Required'),
    max_discount_amount: Yup.number().nullable().min(0, 'Min 0'),
    usage_limit_per_user: Yup.number().min(1, 'Min 1').required('Required'),
    total_usage_limit: Yup.number().nullable().min(1, 'Min 1'),
});

export const CouponForm: React.FC<CouponFormProps> = ({ title, initialData, onSubmit, isLoading }) => {
    const navigate = useNavigate();
    const { data: stores } = useStores();

    const initialValues: CouponCreate = {
        code: initialData?.code || '',
        description: initialData?.description || '',
        discount_type: initialData?.discount_type || 'FLAT',
        discount_value: initialData?.discount_value || 0,
        max_discount_amount: initialData?.max_discount_amount || undefined,
        min_order_amount: initialData?.min_order_amount || 0,
        is_first_order_only: initialData?.is_first_order_only ?? false,
        usage_limit_per_user: initialData?.usage_limit_per_user || 1,
        total_usage_limit: initialData?.total_usage_limit || undefined,
        start_date: initialData?.start_date ? initialData.start_date.split('T')[0] : '',
        end_date: initialData?.end_date ? initialData.end_date.split('T')[0] : '',
        is_active: initialData?.is_active ?? true,
        store_id: initialData?.store_id || undefined,
    };

    const storeOptions = [
        { label: 'All Stores', value: '' },
        ...(stores?.map(s => ({ label: s.name, value: s.id })) || [])
    ];

    const discountTypeOptions = [
        { label: 'Flat Amount (₹)', value: 'FLAT' },
        { label: 'Percentage (%)', value: 'PERCENTAGE' }
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        {initialData ? `Editing coupon ${initialData.code}` : 'Create a new promotional discount'}
                    </p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/coupons')} icon="ri-arrow-left-line">
                    Back to List
                </Button>
            </div>

            <Card className='w-full mb-6'>
                <Formik
                    initialValues={initialValues}
                    validationSchema={CouponSchema}
                    onSubmit={(values) => {
                        // Convert empty strings back to undefined for the API
                        const formattedValues = {
                            ...values,
                            store_id: values.store_id ? Number(values.store_id) : undefined,
                            max_discount_amount: values.max_discount_amount || undefined,
                            total_usage_limit: values.total_usage_limit || undefined,
                            start_date: values.start_date || undefined,
                            end_date: values.end_date || undefined,
                        };
                        onSubmit(formattedValues);
                    }}
                    enableReinitialize
                >
                    {({ errors, touched, setFieldValue, values }) => (
                        <Form className="space-y-8">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Coupon Code"
                                    name="code"
                                    placeholder="E.g. WELCOME50"
                                    value={values.code}
                                    onChange={(e) => setFieldValue('code', e.target.value.toUpperCase())}
                                    error={touched.code && errors.code ? (errors.code as string) : undefined}
                                    required
                                />
                                <Select
                                    label="Applicable Store"
                                    options={storeOptions}
                                    value={values.store_id || ''}
                                    onChange={(val) => setFieldValue('store_id', val)}
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="Description"
                                        name="description"
                                        placeholder="Short description for internal use"
                                        value={values.description}
                                        onChange={(e) => setFieldValue('description', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Discount Rules */}
                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <i className="ri-percent-line text-indigo-500"></i>
                                    Discount Configuration
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Select
                                        label="Discount Type"
                                        options={discountTypeOptions}
                                        value={values.discount_type}
                                        onChange={(val) => setFieldValue('discount_type', val)}
                                        required
                                    />
                                    <Input
                                        label={`Value (${values.discount_type === 'FLAT' ? '₹' : '%'})`}
                                        name="discount_value"
                                        type="number"
                                        value={values.discount_value}
                                        onChange={(e) => setFieldValue('discount_value', parseFloat(e.target.value) || 0)}
                                        error={touched.discount_value && errors.discount_value ? (errors.discount_value as string) : undefined}
                                        required
                                    />
                                    {values.discount_type === 'PERCENTAGE' && (
                                        <Input
                                            label="Max Discount Cap (₹)"
                                            name="max_discount_amount"
                                            type="number"
                                            value={values.max_discount_amount}
                                            onChange={(e) => setFieldValue('max_discount_amount', parseFloat(e.target.value) || undefined)}
                                            placeholder="No limit"
                                        />
                                    )}
                                    <Input
                                        label="Min Order Amount (₹)"
                                        name="min_order_amount"
                                        type="number"
                                        value={values.min_order_amount}
                                        onChange={(e) => setFieldValue('min_order_amount', parseFloat(e.target.value) || 0)}
                                        error={touched.min_order_amount && errors.min_order_amount ? (errors.min_order_amount as string) : undefined}
                                    />
                                </div>
                            </div>

                            {/* Limits & Dates */}
                            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-8">
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <i className="ri-timer-2-line text-indigo-500"></i>
                                    Validity & Limits
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <Input
                                        label="Start Date"
                                        name="start_date"
                                        type="date"
                                        value={values.start_date}
                                        onChange={(e) => setFieldValue('start_date', e.target.value)}
                                    />
                                    <Input
                                        label="End Date"
                                        name="end_date"
                                        type="date"
                                        value={values.end_date}
                                        onChange={(e) => setFieldValue('end_date', e.target.value)}
                                    />
                                    <Input
                                        label="Limit per User"
                                        name="usage_limit_per_user"
                                        type="number"
                                        value={values.usage_limit_per_user}
                                        onChange={(e) => setFieldValue('usage_limit_per_user', parseInt(e.target.value) || 1)}
                                        error={touched.usage_limit_per_user && errors.usage_limit_per_user ? (errors.usage_limit_per_user as string) : undefined}
                                    />
                                    <Input
                                        label="Global Total Limit"
                                        name="total_usage_limit"
                                        type="number"
                                        value={values.total_usage_limit}
                                        onChange={(e) => setFieldValue('total_usage_limit', parseInt(e.target.value) || undefined)}
                                        placeholder="No limit"
                                    />
                                </div>
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={values.is_first_order_only}
                                            onChange={(e) => setFieldValue('is_first_order_only', e.target.checked)}
                                        />
                                        <div className="w-10 h-6 bg-zinc-200 peer-focus:outline-none dark:bg-zinc-700 peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">First Order Only</p>
                                        <p className="text-xs text-zinc-500">Only for new customers</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={values.is_active}
                                            onChange={(e) => setFieldValue('is_active', e.target.checked)}
                                        />
                                        <div className="w-10 h-6 bg-zinc-200 peer-focus:outline-none dark:bg-zinc-700 peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">Active Status</p>
                                        <p className="text-xs text-zinc-500">Enable/Disable coupon</p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <Button type="submit" isLoading={isLoading} icon="ri-save-line">
                                    {initialData ? 'Update Coupon' : 'Create Coupon'}
                                </Button>
                                <Button variant="ghost" type="button" onClick={() => navigate('/coupons')}>
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </div>
    );
};

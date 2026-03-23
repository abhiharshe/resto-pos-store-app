import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Store, StoreFormValues } from '../api/storesApi';
import Card from '../../../components/common/Card';
import { useNavigate } from 'react-router-dom';

interface StoreFormProps {
    title: string;
    initialData?: Store;
    onSubmit: (data: StoreFormValues) => void;
    isLoading?: boolean;
}

const StoreSchema = Yup.object().shape({
    name: Yup.string().required('Store name is required'),
    phone: Yup.string().required('Phone is required'),
    address: Yup.string().required('Address is required'),
    tax_percentage: Yup.number().min(0, 'Min 0').max(100, 'Max 100'),
    service_charge_percentage: Yup.number().min(0, 'Min 0').max(100, 'Max 100'),
});

export const StoreForm: React.FC<StoreFormProps> = ({ title, initialData, onSubmit, isLoading }) => {
    const navigate = useNavigate();
    const initialValues: StoreFormValues = {
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        address: initialData?.address || '',
        currency: initialData?.currency || '',
        tax_percentage: initialData?.tax_percentage || 0,
        service_charge_percentage: initialData?.service_charge_percentage || 0,
        opening_time: initialData?.opening_time || '',
        closing_time: initialData?.closing_time || '',
        logo_url: initialData?.logo_url || '',
        is_active: initialData?.is_active ?? true,
    };

    return (
        <Card className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">{initialData ? 'Update configuration for ' + initialData.name : 'Fill the form to create a new store'}</p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/stores')} icon="ri-arrow-left-line">
                    Back to List
                </Button>
            </div>
            <Formik
                initialValues={initialValues}
                validationSchema={StoreSchema}
                onSubmit={(values) => onSubmit(values)}
                enableReinitialize
            >
                {({ errors, touched, setFieldValue, values }) => (
                    <Form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Store Name"
                                name="name"
                                value={values.name}
                                onChange={(e) => setFieldValue('name', e.target.value)}
                                error={touched.name && errors.name ? (errors.name as string) : undefined}
                                required
                            />
                            <Input
                                label="Phone Number"
                                name="phone"
                                value={values.phone}
                                onChange={(e) => setFieldValue('phone', e.target.value)}
                                error={touched.phone && errors.phone ? (errors.phone as string) : undefined}
                                required
                            />
                            <div className="md:col-span-2">
                                <Input
                                    label="Address"
                                    name="address"
                                    value={values.address}
                                    onChange={(e) => setFieldValue('address', e.target.value)}
                                    error={touched.address && errors.address ? (errors.address as string) : undefined}
                                    required
                                />
                            </div>
                        </div>

                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
                            <h3 className="text-lg font-medium mb-4 text-zinc-900 dark:text-white">Configuration</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Input
                                    label="Currency (e.g. USD, ₹)"
                                    name="currency"
                                    value={values.currency}
                                    onChange={(e) => setFieldValue('currency', e.target.value)}
                                />
                                <Input
                                    label="Tax Percentage (%)"
                                    name="tax_percentage"
                                    type="number"
                                    step="0.01"
                                    value={values.tax_percentage}
                                    onChange={(e) => setFieldValue('tax_percentage', parseFloat(e.target.value) || 0)}
                                />
                                <Input
                                    label="Service Charge (%)"
                                    name="service_charge_percentage"
                                    type="number"
                                    step="0.01"
                                    value={values.service_charge_percentage}
                                    onChange={(e) => setFieldValue('service_charge_percentage', parseFloat(e.target.value) || 0)}
                                />
                                <Input
                                    label="Opening Time"
                                    name="opening_time"
                                    placeholder="09:00 AM"
                                    value={values.opening_time}
                                    onChange={(e) => setFieldValue('opening_time', e.target.value)}
                                />
                                <Input
                                    label="Closing Time"
                                    name="closing_time"
                                    placeholder="11:00 PM"
                                    value={values.closing_time}
                                    onChange={(e) => setFieldValue('closing_time', e.target.value)}
                                />
                                <Input
                                    label="Logo URL"
                                    name="logo_url"
                                    value={values.logo_url}
                                    onChange={(e) => setFieldValue('logo_url', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" isLoading={isLoading}>
                                {initialData ? 'Save Configuration' : 'Create Store'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Card>
    );
};

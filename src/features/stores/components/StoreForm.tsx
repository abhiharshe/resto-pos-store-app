import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Input } from '../../../components/common/Input';
import { PhoneInput } from '../../../components/common/PhoneInput';
import { Button } from '../../../components/common/Button';
import { Store, StoreFormValues } from '../api/storesApi';
import Card from '../../../components/common/Card';
import { useNavigate } from 'react-router-dom';
import AssetUpload from '../../../components/common/AssetUpload';

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
    prefix: Yup.string()
        .required('Prefix is required')
        .min(2, 'Min 2 characters')
        .max(6, 'Max 6 characters')
        .matches(/^[A-Za-z0-9]+$/, 'Only alphanumeric characters allowed'),
    tax_percentage: Yup.number().min(0, 'Min 0').max(100, 'Max 100'),
    service_charge_percentage: Yup.number().min(0, 'Min 0').max(100, 'Max 100'),
});

export const StoreForm: React.FC<StoreFormProps> = ({ title, initialData, onSubmit, isLoading }) => {
    const navigate = useNavigate();
    const initialValues: StoreFormValues = {
        name: initialData?.name || '',
        phone: initialData?.phone || '',
        address: initialData?.address || '',
        prefix: initialData?.prefix || '',
        tax_percentage: initialData?.tax_percentage || 0,
        service_charge_percentage: initialData?.service_charge_percentage || 0,
        opening_time: initialData?.opening_time || '',
        closing_time: initialData?.closing_time || '',
        logo_url: initialData?.logo_url || '',
        banner_url: initialData?.banner_url || '',
        logo_file: null,
        banner_file: null,
        has_pos: initialData?.has_pos ?? true,
        has_kds: initialData?.has_kds ?? true,
        is_active: initialData?.is_active ?? true,
    };

    const generatePrefix = (setFieldValue: (field: string, value: any) => void) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFieldValue('prefix', result);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">{initialData ? 'Update configuration for ' + initialData.name : 'Fill the form to create a new store'}</p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/stores')} icon="ri-arrow-left-line">
                    Back to List
                </Button>
            </div>
            <div className="w-full mb-6">
                <Formik
                    initialValues={initialValues}
                    validationSchema={StoreSchema}
                    onSubmit={(values) => onSubmit(values)}
                    enableReinitialize
                >
                    {({ errors, touched, setFieldValue, values }) => (
                        <Form className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-3">
                                <Card className='flex-1 space-y-4'>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input
                                            label="Store Name"
                                            name="name"
                                            value={values.name}
                                            onChange={(e) => setFieldValue('name', e.target.value)}
                                            error={touched.name && errors.name ? (errors.name as string) : undefined}
                                            required
                                        />
                                        <PhoneInput
                                            label="Phone Number"
                                            value={values.phone}
                                            onChange={(val) => setFieldValue('phone', val)}
                                            error={touched.phone && errors.phone ? (errors.phone as string) : undefined}
                                        />
                                        <div className="md:col-span-1">
                                            <Input
                                                label="Store Prefix (2-6 Chars)"
                                                name="prefix"
                                                placeholder="e.g. RPOS or ABCXYZ"
                                                value={values.prefix}
                                                onChange={(e) => {
                                                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);
                                                    setFieldValue('prefix', val);
                                                }}
                                                error={touched.prefix && errors.prefix ? (errors.prefix as string) : undefined}
                                                required
                                                rightElement={
                                                    <button
                                                        type="button"
                                                        onClick={() => generatePrefix(setFieldValue)}
                                                        className="text-[10px] font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md hover:bg-indigo-600 hover:text-white transition-all uppercase tracking-tighter"
                                                    >
                                                        Generate
                                                    </button>
                                                }
                                            />
                                            <p className="text-[10px] text-zinc-400 mt-1 font-semibold">Unique 6-letter identifier used for orders</p>
                                        </div>
                                        <div className="md:col-span-1">
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

                                    <div className="border-t border-zinc-200 dark:border-zinc-700 mt-6 pt-2">
                                        <h3 className="text-lg font-medium mb-4 text-zinc-900 dark:text-white">Configuration</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                label="Tax Percentage (%)"
                                                name="tax_percentage"
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                max={100}
                                                placeholder="0.00"
                                                value={values.tax_percentage}
                                                onChange={(e) => setFieldValue('tax_percentage', e.target.value === '' ? '' : Number(e.target.value))}
                                                error={touched.tax_percentage && errors.tax_percentage ? (errors.tax_percentage as string) : undefined}
                                                helper="Applicable GST / VAT rate (0 - 100%)"
                                            />
                                            <Input
                                                label="Service Charge (%)"
                                                name="service_charge_percentage"
                                                type="number"
                                                step="0.01"
                                                min={0}
                                                max={100}
                                                placeholder="0.00"
                                                value={values.service_charge_percentage}
                                                onChange={(e) => setFieldValue('service_charge_percentage', e.target.value === '' ? '' : Number(e.target.value))}
                                                error={touched.service_charge_percentage && errors.service_charge_percentage ? (errors.service_charge_percentage as string) : undefined}
                                                helper="Optional service fee rate (0 - 100%)"
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-zinc-200 dark:border-zinc-700 pt-6">
                                        <h3 className="text-lg font-medium mb-4 text-zinc-900 dark:text-white">Enabled Modules</h3>
                                        <div className="flex flex-wrap gap-8">
                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={values.has_pos}
                                                        onChange={(e) => setFieldValue('has_pos', e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Point of Sale (POS)</span>
                                                    <span className="text-[10px] text-zinc-500">Enable order placement functionality</span>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer group">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        className="sr-only peer"
                                                        checked={values.has_kds}
                                                        onChange={(e) => setFieldValue('has_kds', e.target.checked)}
                                                    />
                                                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-zinc-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-zinc-600 peer-checked:bg-indigo-600"></div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Kitchen Display (KDS)</span>
                                                    <span className="text-[10px] text-zinc-500">Enable real-time order tracking for kitchen</span>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                </Card>

                                <Card className='space-y-4'>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Logo</label>
                                        {values.logo_url && <img src={values.logo_url} alt="Logo" className="h-16 w-16 object-cover rounded mb-2" />}
                                        <AssetUpload
                                            entityType="Store"
                                            entityId={initialData?.id || 'temp'}
                                            autoUpload={!!initialData?.id}
                                            multiple={false}
                                            allowedTypes={['image/*']}
                                            onUploadComplete={(assets) => setFieldValue('logo_url', assets[0].url)}
                                            onFilesChange={(files) => setFieldValue('logo_file', files[0])}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Banner</label>
                                        {values.banner_url && <img src={values.banner_url} alt="Banner" className="h-16 w-32 object-cover rounded mb-2" />}
                                        <AssetUpload
                                            entityType="Store"
                                            entityId={initialData?.id || 'temp'}
                                            autoUpload={!!initialData?.id}
                                            multiple={false}
                                            allowedTypes={['image/*']}
                                            onUploadComplete={(assets) => setFieldValue('banner_url', assets[0].url)}
                                            onFilesChange={(files) => setFieldValue('banner_file', files[0])}
                                        />
                                    </div>
                                </Card>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <Button
                                    type="submit"
                                    isLoading={isLoading}
                                >
                                    {initialData ? 'Save Configuration' : 'Create Store'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/stores')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>

    );
};

import { useFormik } from 'formik';
import { toast } from 'react-hot-toast';
import { useGetSettingsQuery, useUpdateOrderSettingsMutation, useUploadSettingImageMutation } from '../api/settingsApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { getMediaURL } from '../../../utils/api';

const OrderSettings = () => {
    const { data: settings } = useGetSettingsQuery();
    const updateSettings = useUpdateOrderSettingsMutation();
    const uploadImage = useUploadSettingImageMutation();

    const formik = useFormik({
        initialValues: {
            receipt_logo_url: settings?.receipt_logo_url || '',
            receipt_header: settings?.receipt_header || '',
            receipt_footer: settings?.receipt_footer || '',
            order_prefix: settings?.order_prefix || '',
            order_success_email: settings?.order_success_email || '',
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            await toast.promise(
                updateSettings.mutateAsync(values),
                {
                    loading: 'Saving order settings...',
                    success: 'Order settings saved successfully',
                    error: 'Failed to save settings'
                }
            );
        }
    });


    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        toast.promise(
            uploadImage.mutateAsync(formData),
            {
                loading: 'Uploading receipt logo...',
                success: (data) => {
                    formik.setFieldValue('receipt_logo_url', data.url);
                    return 'Logo uploaded';
                },
                error: 'Failed to upload image'
            }
        );
    };

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-8 max-w-3xl">
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-zinc-100">Order Configurations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Order Number Prefix"
                        name="order_prefix"
                        value={formik.values.order_prefix}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. ORD-"
                        helper="Prepended to order receipts."
                    />
                    <Input
                        label="Order Success Email"
                        type="email"
                        name="order_success_email"
                        value={formik.values.order_success_email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="admin@store.com"
                        helper="Admin email to receive copy on every order."
                    />
                </div>
            </div>

            <div className="border-t border-mauve-200 dark:border-zinc-700 pt-8 space-y-4">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-zinc-100">Receipt Printing</h3>

                <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Receipt Logo (Black & White ideal)</label>
                    <div className="flex items-center gap-4">
                        {formik.values.receipt_logo_url && (
                            <img src={getMediaURL(formik.values.receipt_logo_url)} alt="Receipt Logo" className="h-16 w-16 object-contain bg-neutral-100 rounded border" />
                        )}
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Receipt Header Text"
                        name="receipt_header"
                        value={formik.values.receipt_header}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Welcome to our store!"
                    />
                    <Input
                        label="Receipt Footer Text"
                        name="receipt_footer"
                        value={formik.values.receipt_footer}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Thank you for visiting!"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <Button type="submit" isLoading={updateSettings.isPending}>Save Changes</Button>
            </div>
        </form>
    );
};

export default OrderSettings;


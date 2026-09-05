import { useFormik } from 'formik';
import { toast } from 'react-hot-toast';
import { useGetSettingsQuery, useUpdateStorageSettingsMutation } from '../api/settingsApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';

const AssetSettings = () => {
    const { data: settings } = useGetSettingsQuery();
    const updateStorageSettings = useUpdateStorageSettingsMutation();

    const formik = useFormik({
        initialValues: {
            storage_backend: settings?.storage_backend || 'local',
            s3_bucket: settings?.s3_bucket || '',
            s3_region: settings?.s3_region || 'us-east-1',
            s3_access_key: settings?.s3_access_key || '',
            s3_secret_key: settings?.s3_secret_key || '',
            local_storage_path: settings?.local_storage_path || 'uploads',
            cloudinary_cloud_name: settings?.cloudinary_cloud_name || '',
            cloudinary_api_key: settings?.cloudinary_api_key || '',
            cloudinary_api_secret: settings?.cloudinary_api_secret || ''
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            await toast.promise(
                updateStorageSettings.mutateAsync(values),
                {
                    loading: 'Saving asset settings...',
                    success: 'Asset settings saved successfully',
                    error: (err: any) => err.response?.data?.detail || 'Failed to save settings'
                }
            );
        }
    });

    const backend = formik.values.storage_backend;

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-8 max-w-3xl">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">Storage Configuration</h3>
                    <p className="text-sm text-zinc-500">Choose where your assets (images, documents) are stored.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">Storage Provider</label>
                        <select
                            name="storage_backend"
                            value={formik.values.storage_backend}
                            onChange={formik.handleChange}
                            className="w-full h-11 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                        >
                            <option value="local">Local Storage (FileSystem)</option>
                            <option value="cloudinary">Cloudinary (Recommended)</option>
                            <option value="s3">Amazon S3 Bucket</option>
                        </select>
                    </div>

                    {backend === 'local' && (
                        <Input
                            label="Local Storage Path"
                            name="local_storage_path"
                            value={formik.values.local_storage_path}
                            onChange={formik.handleChange}
                            placeholder="e.g. uploads"
                            helperText="Directory where files will be stored on the server."
                        />
                    )}
                </div>

                {backend === 'cloudinary' && (
                    <div className="space-y-6 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                                <i className="ri-cloud-line text-indigo-600 text-xl"></i>
                            </div>
                            <h4 className="font-bold text-zinc-900 dark:text-white">Cloudinary Settings</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Cloud Name"
                                name="cloudinary_cloud_name"
                                value={formik.values.cloudinary_cloud_name}
                                onChange={formik.handleChange}
                                placeholder="your_cloud_name"
                            />
                            <Input
                                label="API Key"
                                name="cloudinary_api_key"
                                value={formik.values.cloudinary_api_key}
                                onChange={formik.handleChange}
                                placeholder="your_api_key"
                            />
                        </div>

                        <Input
                            label="API Secret"
                            name="cloudinary_api_secret"
                            value={formik.values.cloudinary_api_secret}
                            onChange={formik.handleChange}
                            placeholder="your_api_secret"
                            type="password"
                        />

                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex gap-3">
                            <i className="ri-information-line text-blue-600 dark:text-blue-400 text-lg"></i>
                            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                                Cloudinary is ideal for image optimization and CDN delivery. Ensure you have "Unsigned uploading" disabled for better security if using these keys.
                            </p>
                        </div>
                    </div>
                )}

                {backend === 's3' && (
                    <div className="space-y-6 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                <i className="ri-amazon-line text-amber-600 text-xl"></i>
                            </div>
                            <h4 className="font-bold text-zinc-900 dark:text-white">AWS S3 Credentials</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Bucket Name"
                                name="s3_bucket"
                                value={formik.values.s3_bucket}
                                onChange={formik.handleChange}
                                placeholder="my-restaurant-assets"
                            />
                            <Input
                                label="Region"
                                name="s3_region"
                                value={formik.values.s3_region}
                                onChange={formik.handleChange}
                                placeholder="us-east-1"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Access Key"
                                name="s3_access_key"
                                value={formik.values.s3_access_key}
                                onChange={formik.handleChange}
                                placeholder="AKIA..."
                                type="password"
                            />
                            <Input
                                label="Secret Key"
                                name="s3_secret_key"
                                value={formik.values.s3_secret_key}
                                onChange={formik.handleChange}
                                placeholder="********"
                                type="password"
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <Button
                    type="submit"
                    isLoading={updateStorageSettings.isPending}
                    icon="ri-save-line"
                    className="rounded-xl px-8"
                >
                    Save Asset Settings
                </Button>
            </div>
        </form>
    );
};

export default AssetSettings;

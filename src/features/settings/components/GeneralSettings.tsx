import { useFormik } from 'formik';
import { toast } from 'react-hot-toast';
import { useGetSettingsQuery, useUpdateGeneralSettingsMutation, useUploadSettingImageMutation } from '../api/settingsApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { getMediaURL } from '../../../utils/api';

const GeneralSettings = () => {
    const { data: settings } = useGetSettingsQuery();
    const updateSettings = useUpdateGeneralSettingsMutation();
    const uploadImage = useUploadSettingImageMutation();

    const formik = useFormik({
        initialValues: {
            logo_url: settings?.logo_url || '',
            favicon_url: settings?.favicon_url || '',
            currency: settings?.currency || '₹',
            meta_info: (settings?.meta_info as any) || { title: '', description: '' },
            social_links: (settings?.social_links as any) || { facebook: '', instagram: '', twitter: '' }
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            await toast.promise(
                updateSettings.mutateAsync(values),
                {
                    loading: 'Saving general settings...',
                    success: 'General settings saved successfully',
                    error: 'Failed to save settings'
                }
            );
        }
    });


    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo_url' | 'favicon_url') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        toast.promise(
            uploadImage.mutateAsync(formData),
            {
                loading: 'Uploading image...',
                success: (data) => {
                    formik.setFieldValue(field, data.url);
                    return 'Image uploaded';
                },
                error: 'Failed to upload image'
            }
        );
    };

    return (
        <form onSubmit={formik.handleSubmit} className="space-y-8 max-w-3xl">
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Brand Identity</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Main Logo</label>
                        <div className="flex items-center gap-4">
                            {formik.values.logo_url && (
                                <img src={getMediaURL(formik.values.logo_url)} alt="Logo" className="h-16 w-16 object-contain bg-zinc-100 rounded border" />
                            )}
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo_url')} className="text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">Favicon</label>
                        <div className="flex items-center gap-4">
                            {formik.values.favicon_url && (
                                <img src={getMediaURL(formik.values.favicon_url)} alt="Favicon" className="h-8 w-8 object-contain bg-zinc-100 rounded border" />
                            )}
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'favicon_url')} className="text-sm" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-8 space-y-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Meta Information</h3>
                <div className="grid grid-cols-1 gap-4">
                    <Input
                        label="App Title"
                        name="meta_info.title"
                        value={formik.values.meta_info.title}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="My Restaurant"
                    />
                    <Input
                        label="App Description"
                        name="meta_info.description"
                        value={formik.values.meta_info.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Best food in town"
                    />
                </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-8 space-y-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Social Links</h3>
                <div className="grid grid-cols-1 gap-4">
                    <Input
                        label="Facebook URL"
                        name="social_links.facebook"
                        value={formik.values.social_links.facebook}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="https://facebook.com/..."
                    />
                    <Input
                        label="Instagram URL"
                        name="social_links.instagram"
                        value={formik.values.social_links.instagram}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="https://instagram.com/..."
                    />
                    <Input
                        label="Twitter URL"
                        name="social_links.twitter"
                        value={formik.values.social_links.twitter}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="https://twitter.com/..."
                    />
                </div>
            </div>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-8 space-y-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Regional Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Currency Symbol"
                        name="currency"
                        value={formik.values.currency}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. ₹ or $"
                    />
                </div>
            </div>


            <div className="flex justify-end pt-6">
                <Button type="submit" isLoading={updateSettings.isPending}>Save Changes</Button>
            </div>
        </form>
    );
};

export default GeneralSettings;

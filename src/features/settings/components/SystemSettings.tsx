import { useFormik } from 'formik';
import { toast } from 'react-hot-toast';
import { useGetSettingsQuery, useUpdateSystemSettingsMutation } from '../api/settingsApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';

const SystemSettings = () => {
    const { data: settings } = useGetSettingsQuery();
    const updateSettings = useUpdateSystemSettingsMutation();

    const formik = useFormik({
        initialValues: {
            maintenance_mode: settings?.maintenance_mode ?? false,
            pagination_records: settings?.pagination_records ?? 10,
        },
        enableReinitialize: true,
        onSubmit: async (values) => {
            await toast.promise(
                updateSettings.mutateAsync(values),
                {
                    loading: 'Saving system settings...',
                    success: 'System settings saved successfully',
                    error: 'Failed to save settings'
                }
            );
        }
    });


    return (
        <form onSubmit={formik.handleSubmit} className="space-y-8 max-w-3xl">
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-zinc-100">Application State</h3>

                <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-start gap-4">
                    <div className="mt-1">
                        <input
                            type="checkbox"
                            id="maintenance_mode"
                            name="maintenance_mode"
                            className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-600"
                            checked={formik.values.maintenance_mode}
                            onChange={(e) => formik.setFieldValue('maintenance_mode', e.target.checked)}
                        />
                    </div>
                    <div>
                        <label htmlFor="maintenance_mode" className="font-semibold text-red-800 dark:text-red-400 cursor-pointer">
                            Enable Maintenance Mode
                        </label>
                        <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                            Activating this will prevent customers from accessing the store front or placing orders. Only POS admins will have access.
                        </p>
                    </div>
                </div>
            </div>

            <div className="border-t border-mauve-200 dark:border-zinc-700 pt-8 space-y-4">
                <h3 className="text-lg font-medium text-neutral-900 dark:text-zinc-100">UI Constraints</h3>
                <div className="max-w-xs">
                    <Input
                        label="Records Per Page (Datatables)"
                        type="number"
                        min="10"
                        max="200"
                        name="pagination_records"
                        value={formik.values.pagination_records}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        helper="Globally limits standard table page sizes (e.g., 10-200)."
                    />
                </div>
            </div>

            <div className="flex justify-end pt-6">
                <Button type="submit" isLoading={updateSettings.isPending}>Save Changes</Button>
            </div>
        </form>
    );
};

export default SystemSettings;

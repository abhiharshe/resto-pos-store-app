import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { toast } from 'react-hot-toast';
import { useGetEmailSettingsQuery, useUpdateEmailSettingsMutation, useTestEmailMutation } from '../api/settingsApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';

import { getApiErrorMessage } from '../../../utils/api';

const EmailSettings = () => {
    const { data: emailSettings } = useGetEmailSettingsQuery();
    const updateEmailSettings = useUpdateEmailSettingsMutation();
    const testEmailMutation = useTestEmailMutation();
    const [testEmailAddress, setTestEmailAddress] = useState('');

    const formik = useFormik({
        initialValues: {
            smtp_host: '',
            smtp_port: '',
            smtp_encryption: '',
            smtp_username: '',
            smtp_password: '',
            smtp_from_email: '',
        },
        onSubmit: async (values) => {
            await toast.promise(
                updateEmailSettings.mutateAsync(values),
                {
                    loading: 'Saving email settings...',
                    success: 'Email settings saved successfully',
                    error: (err) => getApiErrorMessage(err, 'Failed to save settings')
                }
            );
        }
    });

    useEffect(() => {
        if (emailSettings) {
            formik.setValues({
                smtp_host: emailSettings.smtp_host || '',
                smtp_port: emailSettings.smtp_port || '',
                smtp_encryption: emailSettings.smtp_encryption || '',
                smtp_username: emailSettings.smtp_username || '',
                smtp_password: emailSettings.smtp_password || '',
                smtp_from_email: emailSettings.smtp_from_email || '',
            });
        }
    }, [emailSettings]);

    const handleTestEmail = async () => {
        if (!testEmailAddress) {
            toast.error('Please enter a recipient email to test.');
            return;
        }

        toast.promise(
            testEmailMutation.mutateAsync(testEmailAddress),
            {
                loading: 'Sending test email...',
                success: 'Test email sent successfully!',
                error: (err: any) => getApiErrorMessage(err, 'Failed to send test email'),
            }
        );
    }

    return (
        <div className="space-y-8 max-w-3xl">
            <form onSubmit={formik.handleSubmit} className="space-y-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">SMTP Server Configuration</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                        label="SMTP Host" 
                        name="smtp_host"
                        value={formik.values.smtp_host}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="smtp.gmail.com" 
                        required 
                    />
                    <Input 
                        label="SMTP Port" 
                        name="smtp_port"
                        value={formik.values.smtp_port}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="587" 
                        required 
                    />
                    <Input 
                        label="Encryption (TSL/SSL)" 
                        name="smtp_encryption"
                        value={formik.values.smtp_encryption}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="TLS" 
                    />
                    <Input 
                        label="From Email Address" 
                        type="email" 
                        name="smtp_from_email"
                        value={formik.values.smtp_from_email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="noreply@store.com" 
                        required 
                    />
                    <Input 
                        label="SMTP Username" 
                        name="smtp_username"
                        value={formik.values.smtp_username}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="user@gmail.com" 
                        required 
                    />
                    <Input 
                        label="SMTP Password" 
                        type="password" 
                        name="smtp_password"
                        value={formik.values.smtp_password}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="••••••••" 
                        required 
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" isLoading={updateEmailSettings.isPending}>Save Credentials</Button>
                </div>
            </form>

            <div className="border-t border-zinc-200 dark:border-zinc-700 pt-8 space-y-4">
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Test Connection</h3>
                <p className="text-sm text-zinc-500">Ensure your settings are saved first, then send a test email.</p>
                <div className="flex items-end gap-4 max-w-lg">
                    <div className="flex-1">
                        <Input
                            label="Send to Address"
                            type="email"
                            value={testEmailAddress}
                            onChange={(e) => setTestEmailAddress(e.target.value)}
                            placeholder="your.email@example.com"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestEmail}
                        isLoading={testEmailMutation.isPending}
                    >
                        Send Test
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EmailSettings;

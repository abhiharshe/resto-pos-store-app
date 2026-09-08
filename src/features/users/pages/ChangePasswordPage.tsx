import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useChangePassword } from '../api/usersApi';
import Card from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';

const PasswordSchema = Yup.object().shape({
    current_password: Yup.string().required('Current password is required'),
    new_password: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .max(20, 'Password cannot exceed 20 characters')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least one number')
        .matches(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)')
        .required('New password is required'),
    confirm_password: Yup.string()
        .oneOf([Yup.ref('new_password')], 'Passwords must match')
        .required('Please confirm your new password'),
});

const ChangePasswordPage: React.FC = () => {
    const navigate = useNavigate();
    const changePasswordMutation = useChangePassword();
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const generatePassword = () => {
        const length = 14;
        const charset = {
            upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            lower: "abcdefghijklmnopqrstuvwxyz",
            number: "0123456789",
            special: "@$!%*?&"
        };

        let password = "";
        password += charset.upper.charAt(Math.floor(Math.random() * charset.upper.length));
        password += charset.lower.charAt(Math.floor(Math.random() * charset.lower.length));
        password += charset.number.charAt(Math.floor(Math.random() * charset.number.length));
        password += charset.special.charAt(Math.floor(Math.random() * charset.special.length));

        const allChars = Object.values(charset).join("");
        for (let i = 0; i < length - 4; i++) {
            password += allChars.charAt(Math.floor(Math.random() * allChars.length));
        }

        return password.split('').sort(() => 0.5 - Math.random()).join('');
    };

    const onSubmit = async (values: any) => {
        try {
            await changePasswordMutation.mutateAsync({
                current_password: values.current_password,
                new_password: values.new_password,
            });
            toast.success('Security credentials updated successfully');
            navigate('/profile');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Verification failed');
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-12 px-4">
            <div className="flex items-center gap-4 mb-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                    <i className="ri-arrow-left-line"></i>
                </button>
                <div>
                    <h1 className="text-3xl font-semibold text-zinc-900 dark:text-white">Security Settings</h1>
                    <p className="text-zinc-500">Manage your password and account security</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                <div className="md:col-span-3 space-y-6">
                    <Card className="p-8 border-none shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>

                        <Formik
                            initialValues={{
                                current_password: '',
                                new_password: '',
                                confirm_password: '',
                            }}
                            validationSchema={PasswordSchema}
                            onSubmit={onSubmit}
                        >
                            {({ values, errors, touched, handleChange, handleBlur, setFieldValue, dirty }) => (
                                <Form className="space-y-6 relative z-10">
                                    <Input
                                        label="Current Password"
                                        name="current_password"
                                        type={isPasswordVisible ? "text" : "password"}
                                        placeholder="Enter your existing password"
                                        value={values.current_password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.current_password && errors.current_password ? errors.current_password : undefined}
                                        icon="ri-lock-unlock-line"
                                        required
                                    />

                                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">New Credentials</h3>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const pass = generatePassword();
                                                    setFieldValue('new_password', pass);
                                                    setFieldValue('confirm_password', pass);
                                                    setIsPasswordVisible(true);
                                                    toast.success('Secure password generated!');
                                                }}
                                                className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg transition-colors"
                                            >
                                                <i className="ri-magic-fill"></i> Auto Generate
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            <Input
                                                label="New Password"
                                                name="new_password"
                                                type={isPasswordVisible ? "text" : "password"}
                                                placeholder="Create a strong password"
                                                value={values.new_password}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.new_password && errors.new_password ? (errors.new_password as string) : undefined}
                                                icon="ri-shield-keyhole-line"
                                                required
                                            />

                                            <Input
                                                label="Confirm Password"
                                                name="confirm_password"
                                                type={isPasswordVisible ? "text" : "password"}
                                                placeholder="Verify your new password"
                                                value={values.confirm_password}
                                                onChange={handleChange}
                                                onBlur={handleBlur}
                                                error={touched.confirm_password && errors.confirm_password ? errors.confirm_password : undefined}
                                                icon="ri-checkbox-circle-line"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 py-2">
                                        <input
                                            type="checkbox"
                                            id="show-password"
                                            checked={isPasswordVisible}
                                            onChange={(e) => setIsPasswordVisible(e.target.checked)}
                                            className="w-5 h-5 text-indigo-600 border-zinc-300 rounded-lg focus:ring-indigo-500 transition-all"
                                        />
                                        <label htmlFor="show-password" className="text-sm font-medium text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                                            Reveal password characters
                                        </label>
                                    </div>

                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            isLoading={changePasswordMutation.isPending}
                                            disabled={!dirty}
                                            className="w-full py-4 shadow-xl shadow-indigo-500/20"
                                            icon="ri-refresh-line"
                                        >
                                            Confirm Password Update
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </Card>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <Card className="p-6 border-none shadow-xl bg-zinc-900 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <i className="ri-shield-check-line text-8xl"></i>
                        </div>
                        <h3 className="text-lg font-semibold mb-4 relative z-10">Password Guidelines</h3>
                        <div className="space-y-4 relative z-10">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                                    <i className="ri-check-line text-xs font-semibold"></i>
                                </div>
                                <p className="text-sm text-zinc-400">Length: 8 to 20 characters</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                                    <i className="ri-check-line text-xs font-semibold"></i>
                                </div>
                                <p className="text-sm text-zinc-400">Uppercase letters (A-Z)</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                                    <i className="ri-check-line text-xs font-semibold"></i>
                                </div>
                                <p className="text-sm text-zinc-400">Numbers (0-9)</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                                    <i className="ri-check-line text-xs font-semibold"></i>
                                </div>
                                <p className="text-sm text-zinc-400">Special symbols (@$!%*?&)</p>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-zinc-800">
                            <p className="text-xs text-zinc-500 italic">
                                Last changed: Not available
                            </p>
                        </div>
                    </Card>

                    <Card className="p-6 border-none shadow-xl bg-amber-50 dark:bg-amber-900/10">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0">
                                <i className="ri-error-warning-line text-xl"></i>
                            </div>
                            <div>
                                <h4 className="font-semibold text-amber-800 dark:text-amber-400 text-sm mb-1">Security Warning</h4>
                                <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                                    Changing your password will not log you out of your current session, but will require the new password for future logins.
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ChangePasswordPage;

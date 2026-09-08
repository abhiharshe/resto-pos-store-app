import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../../components/common/Input';
import { useMutation } from '@tanstack/react-query';
import api, { getApiErrorMessage } from '../../../utils/api';
import { useRequestAdminReset } from '../../users/api/usersApi';

const Forgot = () => {
    const [mode, setMode] = useState<'admin_request' | 'email_link'>('admin_request');
    const [email, setEmail] = useState('');
    const [reason, setReason] = useState('');
    const [isSent, setIsSent] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState<string | null>(null);

    const emailResetMutation = useMutation({
        mutationFn: async (email: string) => {
            const response = await api.post('auth/forgot-password', { email });
            return response.data;
        },
        onSuccess: (data) => {
            setIsSent(true);
            setSuccessMessage(data?.message || 'We sent a password reset link to your email address.');
            setError(null);
        },
        onError: (err: any) => {
            setError(getApiErrorMessage(err, 'Failed to send reset link. Please try again.'));
        }
    });

    const adminResetMutation = useRequestAdminReset();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (mode === 'email_link') {
            emailResetMutation.mutate(email);
        } else {
            try {
                const res = await adminResetMutation.mutateAsync({ email, reason });
                setIsSent(true);
                setSuccessMessage(res.message || 'Your reset request has been submitted to the administrator.');
            } catch (err: any) {
                setError(getApiErrorMessage(err, 'Failed to submit reset request. Please try again.'));
            }
        }
    };

    const isPending = emailResetMutation.isPending || adminResetMutation.isPending;

    if (isSent) {
        return (
            <div className="text-center space-y-4">
                <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 text-2xl shadow-sm">
                    <i className="ri-checkbox-circle-fill" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {mode === 'admin_request' ? 'Request Submitted' : 'Check your email'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    {successMessage}
                </p>
                <div className="pt-4">
                    <Link
                        to="/auth/sign-in"
                        className="inline-flex items-center justify-center px-4 py-2 font-medium text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors"
                    >
                        <i className="ri-arrow-left-line mr-1.5" /> Back to sign in
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <Link to="/auth/sign-in" className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-300 mb-4">
                    <i className="ri-arrow-left-line mr-1" /> Back to Sign In
                </Link>
                <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Password Assistance
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-400">
                    {mode === 'admin_request'
                        ? 'Request your store administrator to reset your account password.'
                        : 'Enter your email address and we will send you a self-service reset link.'}
                </p>
            </div>

            {/* Mode Selector Tabs */}
            <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl">
                <button
                    type="button"
                    onClick={() => {
                        setMode('admin_request');
                        setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${mode === 'admin_request'
                            ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                >
                    <i className="ri-shield-user-line" />
                    <span>Request Admin Reset</span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setMode('email_link');
                        setError(null);
                    }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 ${mode === 'email_link'
                            ? 'bg-white dark:bg-zinc-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                >
                    <i className="ri-mail-send-line" />
                    <span>Direct Email Link</span>
                </button>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3.5 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <i className="ri-error-warning-line text-lg shrink-0" />
                        <span>{error}</span>
                    </p>
                </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                        Registered Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        icon="ri-mail-line"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {mode === 'admin_request' && (
                    <div className="space-y-1">
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                            Note for Administrator <span className="text-xs text-zinc-400 font-normal">(Optional)</span>
                        </label>
                        <Input
                            id="reason"
                            name="reason"
                            placeholder="e.g. Forgot cashier password, locked out"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all cursor-pointer"
                    >
                        {isPending
                            ? 'Processing...'
                            : mode === 'admin_request'
                                ? 'Submit Request to Admin'
                                : 'Send Reset Link'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Forgot;

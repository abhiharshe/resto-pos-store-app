import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../../utils/api';
import { Input } from '../../../components/common/Input';

const Recover = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const resetMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await api.post('auth/reset-password', data);
            return response.data;
        },
        onSuccess: () => {
            navigate('/auth/sign-in?reset=success');
        },
        onError: (error: any) => {
            setError(error.response?.data?.detail || 'Failed to reset password. The link may be invalid or expired.');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (!token) {
            setError('Reset token is missing. Please check your email link.');
            return;
        }
        resetMutation.mutate({ token, new_password: password });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Set new password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-400">
                    Your new password must be different from previous used passwords.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <i className="ri-error-warning-line text-lg" />
                        {error}
                    </p>
                </div>
            )}

            {!token ? (
                <div className="text-center py-4">
                    <p className="text-gray-600 dark:text-zinc-400 mb-4">
                        Invalid reset link. Please request a new one.
                    </p>
                    <Link to="/auth/forgot" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        Request reset link
                    </Link>
                </div>
            ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-1">
                        <label htmlFor="password" title="Password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                            New Password
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                placeholder="••••••••"
                                icon="ri-lock-password-line"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="confirmPassword" title="Confirm Password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                            Confirm Password
                        </label>
                        <div className="relative rounded-md shadow-sm">
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                placeholder="••••••••"
                                icon="ri-lock-password-line"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={resetMutation.isPending}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {resetMutation.isPending ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </div>
                    <div className="text-center">
                        <Link to="/auth/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 text-sm">
                            Back to sign in
                        </Link>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Recover;

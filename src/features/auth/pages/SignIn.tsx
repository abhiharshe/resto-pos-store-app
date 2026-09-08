import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Input } from '../../../components/common/Input';
import { useMutation } from '@tanstack/react-query';
import api from '../../../utils/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../slices/authSlice';

const SignIn = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();

    const resetSuccess = searchParams.get('reset') === 'success';

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [loginError, setLoginError] = useState<string | null>(null);

    const loginMutation = useMutation({
        mutationFn: async (credentials: typeof formData) => {
            const params = new URLSearchParams();
            params.append('username', credentials.username);
            params.append('password', credentials.password);

            const response = await api.post('auth/login/access-token', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            return response.data;
        },
        onSuccess: (data) => {
            dispatch(setCredentials({
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                user: data.user
            }));
            navigate('/dashboard');
        },
        onError: (error: any) => {
            setLoginError(error.response?.data?.detail || 'Login failed. Please check your credentials.');
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (loginError) setLoginError(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate(formData);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className='text-center text-3xl font-extrabold text-mauve-600 dark:text-white'>Resto-POS</h1>
                <h2 className="mt-6 text-center text-2xl font-medium text-gray-900 dark:text-white">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-400">
                    Or
                    <Link to="/auth/sign-up" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 ms-3">
                        create a new account
                    </Link>
                </p>
            </div>

            {resetSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-md">
                    <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
                        <i className="ri-checkbox-circle-line text-lg" />
                        Password reset successful. You can now sign in with your new password.
                    </p>
                </div>
            )}

            {loginError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-md">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                        <i className="ri-error-warning-line text-lg" />
                        {loginError}
                    </p>
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-1">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                        Username
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <Input
                            id="username"
                            name="username"
                            type="text"
                            required
                            placeholder="username"
                            icon="ri-user-line"
                            value={formData.username}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label htmlFor="password" title="Password" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                        Password
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            placeholder="••••••••"
                            icon="ri-lock-password-line"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="flex items-center justify-end">
                        <div className="text-sm">
                            <Link to="/auth/forgot" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={loginMutation.isPending}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignIn;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Forgot = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
        }, 1000);
    };

    if (isSent) {
        return (
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900">
                    <i className="ri-check-line text-green-600 dark:text-green-400 text-xl" />
                </div>
                <h3 className="mt-2 text-xl font-bold text-gray-900 dark:text-white">Check your email</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-zinc-400">
                    We sent a password reset link to your email address.
                </p>
                <div className="mt-6">
                    <Link to="/auth/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        Back to sign in
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
                    Reset your password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-400">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                        Email address
                    </label>
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="ri-mail-line text-gray-400" />
                        </div>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md dark:bg-zinc-800 dark:border-zinc-600 dark:text-white"
                            placeholder="you@example.com"
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Forgot;

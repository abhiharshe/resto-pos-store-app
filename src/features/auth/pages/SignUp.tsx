import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../../../components/common/Input';

const SignUp = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 1000);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Create an account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-400">
                    Or{' '}
                    <Link to="/auth/sign-in" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                        sign in to existing account
                    </Link>
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">

                    <div className="relative rounded-md shadow-sm">
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="John Doe"
                            icon="ri-user-line"
                            label="Full Name"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="relative rounded-md shadow-sm">
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="you@example.com"
                            icon="ri-mail-line"
                            label="Email address"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="relative rounded-md shadow-sm">
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            placeholder="••••••••"
                            icon="ri-lock-password-line"
                            label="Password"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="relative rounded-md shadow-sm">
                        <Input
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            placeholder="••••••••"
                            icon="ri-lock-password-line"
                            label="Confirm Password"
                        />
                    </div>
                </div>

                <div className="space-y-1">

                </div>

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {isLoading ? 'Creating account...' : 'Create Account'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SignUp;

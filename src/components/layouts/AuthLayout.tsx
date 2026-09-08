import { Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { toggleTheme } from '../../features/ui/slices/uiSlice';

const AuthLayout = () => {
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state) => state.ui);

    return (
        <div className="min-h-dvh bg-gray-50 dark:bg-zinc-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="absolute top-4 right-4">
                <button
                    onClick={() => dispatch(toggleTheme())}
                    className="w-12 h-12 p-2 rounded-full text-zinc-400 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors"
                    aria-label="Toggle Theme"
                >
                    {theme === 'light' ? (
                        <i className="ri-moon-line text-xl" />
                    ) : (
                        <i className="ri-sun-line text-xl" />
                    )}
                </button>
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-zinc-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-zinc-200 dark:border-zinc-700">
                    <Outlet />
                </div>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md text-center">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    &copy; {new Date().getFullYear()} restopos POS. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;

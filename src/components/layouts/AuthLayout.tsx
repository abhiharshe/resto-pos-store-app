import { Outlet } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { toggleTheme } from '../../features/ui/slices/uiSlice';

const AuthLayout = () => {
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state) => state.ui);

    return (
        <div className="min-h-dvh bg-linear-to-br from-mauve-200 to-mauve-400 dark:from-mauve-800 dark:to-mauve-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
            <div className="absolute top-4 right-4">
                <button
                    onClick={() => dispatch(toggleTheme())}
                    className="w-12 h-12 p-2 rounded-full text-zinc-400 dark:text-zinc-50 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-mauve-200 dark:border-zinc-700 transition-colors"
                    aria-label="Toggle Theme"
                >
                    {theme === 'light' ? (
                        <i className="ri-moon-line"></i>
                    ) : (
                        <i className="ri-sun-line"></i>
                    )}
                </button>
            </div>
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-neutral-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-mauve-200 dark:border-zinc-700">
                    <Outlet />
                </div>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md text-center">
                <p className="text-sm text-zinc-200 dark:text-zinc-400">
                    &copy; {new Date().getFullYear()} restopos POS. All rights reserved.
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;

import React, { useCallback, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { toggleTheme, toggleSidebar } from '../../features/ui/slices/uiSlice';
import moment from 'moment';
import { AnimatePresence, motion } from 'motion/react';
import { logOut } from '../../features/auth/slices/authSlice';

const SessionLayout = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, isSidebarOpen } = useAppSelector((state) => state.ui);
    const { user } = useAppSelector((state) => state.auth);
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const profileRef = React.useRef<HTMLDivElement>(null);

    const [currentTime, setCurrentTime] = React.useState(moment().format('h:mm A'));
    const currentDate = moment().format('ddd, MMM Do, YYYY');
    const [isFullScreen, setIsFullScreen] = React.useState<boolean>(!!document.fullscreenElement);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        dispatch(logOut());
        navigate('/auth/sign-in');
    };

    const enterFullscreen = useCallback(() => {
        const el = document.documentElement; // or use a specific element (e.g., ref.current)
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
            (el as any).webkitRequestFullscreen();
        } else if ((el as any).msRequestFullscreen) {
            (el as any).msRequestFullscreen();
        }
        setIsFullScreen(true);
    }, []);

    // Exit fullscreen
    const exitFullscreen = useCallback(() => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
        }
        setIsFullScreen(false);
    }, []);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        if (document.fullscreenElement) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    }, [enterFullscreen, exitFullscreen]);

    // Sync fullscreen state if user presses ESC
    useEffect(() => {
        const handleChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleChange);
        };
    }, []);

    useEffect(() => {
        // update time every minute
        const timer = setInterval(() => {
            setCurrentTime(moment().format('h:mm A'));
        }, 60000); // Update every minute

        //change date at midnight


        return () => {
            clearInterval(timer);
        };
    }, []);

    return (
        <div className="flex w-full h-screen bg-gray-50 dark:bg-zinc-900 transition-colors duration-200 overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`inset-y-0 left-0 bg-white dark:bg-zinc-800 shadow-lg z-30 flex flex-col
                    transform md:transform-none transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-20'}
                `}
            >
                <div className="h-16 flex items-center justify-center border-b border-zinc-200 dark:border-zinc-700">
                    <h1 className={`font-bold text-2xl text-primary font-sans transition-opacity duration-300 ${!isSidebarOpen ? 'md:hidden opacity-0' : 'opacity-100'}`}>restopos</h1>
                </div>

                <nav className="mt-4 px-2 space-y-1 flex-1 overflow-y-auto">
                    <NavItem to="/dashboard" icon="ri-dashboard-line" label="Dashboard" isOpen={isSidebarOpen} />
                    <NavItem to="/pos" icon="ri-shopping-cart-line" label="POS" isOpen={isSidebarOpen} />
                    <NavItem to="/orders" icon="ri-file-list-3-line" label="Orders" isOpen={isSidebarOpen} />
                    <NavItem to="/kds" icon="ri-restaurant-2-line" label="KDS" isOpen={isSidebarOpen} />
                    <NavItem to="/customers" icon="ri-user-line" label="Customers" isOpen={isSidebarOpen} />
                    <div className="pt-4 pb-2">
                        <p className={`px-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider ${!isSidebarOpen && 'hidden'}`}>
                            Config
                        </p>
                    </div>
                    <NavItem to="/stores" icon="ri-settings-4-line" label="Stores" isOpen={isSidebarOpen} />
                    <NavItem to="/menu" icon="ri-stack-line" label="Menu" isOpen={isSidebarOpen} />
                    <NavItem to="/menu/categories" icon="ri-folders-line" label="Categories" isOpen={isSidebarOpen} />
                    <NavItem to="/menu/items" icon="ri-restaurant-line" label="Items" isOpen={isSidebarOpen} />
                    <NavItem to="/users" icon="ri-settings-4-line" label="Users" isOpen={isSidebarOpen} />
                    <NavItem to="/settings" icon="ri-settings-4-line" label="Settings" isOpen={isSidebarOpen} />
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="bg-white dark:bg-zinc-800 shadow-sm z-20 h-16 flex items-center justify-between px-4 border-b border-zinc-200 dark:border-zinc-700 flex-shrink-0">
                    <div className="flex items-center">
                        <button
                            title="Toggle Sidebar"
                            onClick={() => dispatch(toggleSidebar())}
                            className="p-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none"
                        >
                            <i className={isSidebarOpen ? "ri-menu-fold-line text-xl" : "ri-menu-unfold-line text-xl"} />
                        </button>

                        <div className="ml-4 flex items-center gap-2 text-xs cursor-default">
                            <span className='rounded-2xl px-3 p-1 border border-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400'>{currentDate}</span>
                            <span className='rounded-2xl px-3 p-1 border border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'>{currentTime}</span>
                        </div>

                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                            onClick={toggleFullscreen}
                            className="w-10 h-10 rounded-full text-zinc-500 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                            {
                                isFullScreen ?
                                    <i className="ri-fullscreen-exit-line text-xl" /> : <i className="ri-fullscreen-line text-xl" />
                            }
                        </button>
                        <button
                            title="Toggle Theme"
                            onClick={() => dispatch(toggleTheme())}
                            className="w-10 h-10 rounded-full text-zinc-500 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                        >
                            {theme === 'light' ? <i className="ri-moon-line text-xl" /> : <i className="ri-sun-line text-xl" />}
                        </button>
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className={`flex items-center gap-2 p-1.5 pr-3 border border-zinc-200 dark:border-zinc-700 rounded-full transition-all duration-200 focus:outline-none ${isProfileOpen ? 'bg-zinc-100 dark:bg-zinc-700' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase border border-indigo-200 dark:border-indigo-800">
                                    {user?.name?.[0] || user?.username?.[0] || 'A'}
                                </div>
                                <div className="hidden sm:flex flex-col items-start leading-tight">
                                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                                        {user?.name || user?.username || 'Admin'}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-bold">
                                        {user?.role || 'Staff'}
                                    </span>
                                </div>
                                <i className={`ri-arrow-down-s-line text-zinc-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 rounded-xl shadow-xl py-2 z-50 border border-zinc-200 dark:border-zinc-700 origin-top-right overflow-hidden"
                                    >
                                        <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-700 mb-1">
                                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Signed in as</p>
                                            <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{user?.email}</p>
                                        </div>

                                        <DropdownItem icon="ri-user-settings-line" label="View Profile" onClick={() => { setIsProfileOpen(false); navigate('/profile'); }} />
                                        <DropdownItem icon="ri-lock-password-line" label="Change Password" onClick={() => { setIsProfileOpen(false); navigate('/change-password'); }} />
                                        <DropdownItem icon="ri-settings-5-line" label="Settings" onClick={() => { setIsProfileOpen(false); navigate('/settings'); }} />

                                        <div className="my-1 border-t border-zinc-100 dark:border-zinc-700" />

                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <i className="ri-logout-box-line mr-3 text-lg" />
                                            Sign out
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-auto">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="flex-1">
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

interface NavItemProps {
    to: string;
    icon: string;
    label: string;
    isOpen: boolean;
}

const NavItem = ({ to, icon, label, isOpen }: NavItemProps) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${isActive
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-700 dark:hover:text-white'
            }`
        }
    >
        <i className={`${icon} text-lg ${isOpen ? 'mr-3' : 'mx-auto'}`} />
        <span className={`whitespace-nowrap transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>{label}</span>
    </NavLink>
);

const DropdownItem = ({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex items-center w-full px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors group"
    >
        <i className={`${icon} mr-3 text-lg text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors`} />
        {label}
    </button>
);

export default SessionLayout;

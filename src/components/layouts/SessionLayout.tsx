import React, { useCallback, useEffect } from 'react';
import Tooltip from '../common/Tooltip';
import MaintenanceOverlay from '../common/MaintenanceOverlay';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { useHasPermission } from '../../hooks/usePermission';
import { toggleTheme, toggleSidebar } from '../../features/ui/slices/uiSlice';
import { selectBranding } from '../../features/settings/slices/settingsSlice';
import moment from 'moment';
import { AnimatePresence, motion } from 'motion/react';
import { logOut } from '../../features/auth/slices/authSlice';
import { getMediaURL } from '../../utils/api';
import { useApprovalStats } from '../../features/approvals/api/approvalsApi';

const SessionLayout = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, isSidebarOpen } = useAppSelector((state) => state.ui);
    const { user } = useAppSelector((state) => state.auth);
    const branding = useAppSelector(selectBranding);
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

    // Dynamic Permission Checks
    const canDashboard = useHasPermission('dashboard:view');
    const canPos = useHasPermission('pos:access') && (user?.role === 'SUPER_ADMIN' || user?.store?.has_pos);
    const canOrders = useHasPermission('orders:manage');
    const canKds = useHasPermission('kds:access') && (user?.role === 'SUPER_ADMIN' || user?.store?.has_kds);
    const canRecipes = useHasPermission('recipes:manage');

    const canMenu = useHasPermission('menu:manage');
    const canDeals = useHasPermission('deals:manage');
    const hasMenuSection = canMenu || canDeals;

    const canCustomers = useHasPermission('customers:view');
    const canCoupons = useHasPermission('coupons:manage');
    const canPromotions = useHasPermission('promotions:manage');
    const hasMarketingSection = canCustomers || canCoupons || canPromotions;

    const canStores = user?.role === 'SUPER_ADMIN';
    const canApprovals = user?.role === 'SUPER_ADMIN' || user?.role === 'STORE_ADMIN' || useHasPermission('approvals:manage');
    const canUsers = useHasPermission('users:manage');
    const canAssets = useHasPermission('assets:manage');
    const canSettings = useHasPermission('settings:manage') || (user?.role === 'STORE_ADMIN' && useHasPermission('stores:manage'));
    const canPermissions = useHasPermission('permissions:manage');
    const hasAdminSection = canStores || canApprovals || canUsers || canAssets || canSettings || canPermissions;

    const { data: approvalStats } = useApprovalStats(user?.role === 'SUPER_ADMIN' ? undefined : user?.store_id);

    return (
        <div className={`flex relative w-full h-screen bg-gray-200 dark:bg-zinc-900 transition-colors duration-200 overflow-hidden`}>
            {/* Maintenance Mode Overlay for restricted roles */}
            <MaintenanceOverlay />

            {/* Backdrop for mobile */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => dispatch(toggleSidebar())}
                        className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed md:relative inset-y-0 left-0 z-30 flex flex-col h-full bg-white dark:bg-zinc-900
                    transform transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64 md:translate-x-0 md:w-20'}
                `}
            >
                {/* Logo Section */}
                <div className="h-16 flex items-center justify-center overflow-hidden">
                    <div className="flex items-center min-w-[40px] justify-center">
                        {branding.logoUrl ? (
                            <img
                                src={getMediaURL(branding.logoUrl)}
                                alt="Logo"
                                className="h-8 w-auto min-w-[32px] object-contain transition-transform duration-300 transform rounded"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center border border-primary/20">
                                <span className="text-primary font-semibold text-lg leading-none">
                                    {branding.siteName?.[0] || 'R'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={`transition-all duration-300 ease-in-out ${isSidebarOpen ? 'ml-3 opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none w-0 overflow-hidden'
                        }`}>
                        <h1 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 font-sans tracking-tight truncate max-w-[140px]">
                            {branding.siteName}
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto md:px-2 py-2">
                    {isSidebarOpen ? (
                        /* Grouped Sidebar - Default & Mobile */
                        <div className="space-y-1">
                            {canDashboard && (
                                <NavItem to="/dashboard" icon="ri-dashboard-line" label="Dashboard" isOpen={isSidebarOpen} />
                            )}

                            {(canPos || canOrders || canKds || canRecipes) && (
                                <NavSection label="Operations">
                                    {canPos && (
                                        <NavItem to="/pos" icon="ri-shopping-cart-line" label="POS Terminal" isOpen={isSidebarOpen} />
                                    )}
                                    {canOrders && (
                                        <NavItem to="/orders" icon="ri-file-list-3-line" label="Orders List" isOpen={isSidebarOpen} />
                                    )}
                                    {canKds && (
                                        <NavItem to="/kds" icon="ri-restaurant-2-line" label="Kitchen Display" isOpen={isSidebarOpen} />
                                    )}
                                    {canRecipes && (
                                        <NavItem to="/recipes" icon="ri-book-open-line" label="Recipes" isOpen={isSidebarOpen} />
                                    )}
                                </NavSection>
                            )}

                            {hasMenuSection && (
                                <NavSection label="Menu Management">
                                    {canMenu && (
                                        <>
                                            <NavItem to="/menu" icon="ri-dashboard-2-line" label="Menu Overview" isOpen={isSidebarOpen} />
                                            <NavItem to="/menu/categories" icon="ri-folders-line" label="Categories" isOpen={isSidebarOpen} />
                                            <NavItem to="/menu/addon-groups" icon="ri-puzzle-line" label="Add-On Groups" isOpen={isSidebarOpen} />
                                            <NavItem to="/menu/items" icon="ri-restaurant-line" label="All Items" isOpen={isSidebarOpen} />
                                        </>
                                    )}
                                    {canDeals && (
                                        <NavItem to="/deals" icon="ri-percent-line" label="Deals" isOpen={isSidebarOpen} />
                                    )}
                                </NavSection>
                            )}

                            {hasMarketingSection && (
                                <NavSection label="Marketing">
                                    {canCustomers && (
                                        <NavItem to="/customers" icon="ri-user-heart-line" label="Customers" isOpen={isSidebarOpen} />
                                    )}
                                    {canCoupons && (
                                        <NavItem to="/coupons" icon="ri-price-tag-3-line" label="Coupons" isOpen={isSidebarOpen} />
                                    )}
                                    {canPromotions && (
                                        <NavItem to="/promotions" icon="ri-megaphone-line" label="Promotions" isOpen={isSidebarOpen} />
                                    )}
                                </NavSection>
                            )}

                            {hasAdminSection && (
                                <NavSection label="Administration">
                                    {canStores && (
                                        <NavItem to="/stores" icon="ri-store-2-line" label="Stores List" isOpen={isSidebarOpen} />
                                    )}
                                    {canApprovals && (
                                        <NavItem
                                            to="/approvals"
                                            icon="ri-shield-check-line"
                                            label="Approvals"
                                            isOpen={isSidebarOpen}
                                            badge={approvalStats?.total_pending ? approvalStats.total_pending : undefined}
                                        />
                                    )}
                                    {canUsers && (
                                        <NavItem to="/users" icon="ri-user-settings-line" label="Staff Accounts" isOpen={isSidebarOpen} />
                                    )}
                                    {canAssets && (
                                        <NavItem to="/assets" icon="ri-image-line" label="Media Library" isOpen={isSidebarOpen} />
                                    )}
                                    {canPermissions && (
                                        <NavItem to="/permissions" icon="ri-shield-keyhole-line" label="Access Control" isOpen={isSidebarOpen} />
                                    )}
                                    {canSettings && (
                                        <NavItem to="/settings" icon="ri-equalizer-line" label="Settings" isOpen={isSidebarOpen} />
                                    )}
                                </NavSection>
                            )}
                        </div>
                    ) : (
                        /* Flat Sidebar - Collapsed Desktop */
                        <div className="hidden md:flex flex-col space-y-1 items-center">
                            {canDashboard && (
                                <NavItem to="/dashboard" icon="ri-dashboard-line" label="Dashboard" isOpen={false} />
                            )}

                            {/* Operations */}
                            {canPos && (
                                <NavItem to="/pos" icon="ri-shopping-cart-line" label="POS" isOpen={false} />
                            )}
                            {canOrders && (
                                <NavItem to="/orders" icon="ri-file-list-3-line" label="Orders" isOpen={false} />
                            )}
                            {canKds && (
                                <NavItem to="/kds" icon="ri-restaurant-2-line" label="KDS" isOpen={false} />
                            )}
                            {canRecipes && (
                                <NavItem to="/recipes" icon="ri-book-open-line" label="Recipes" isOpen={false} />
                            )}

                            {/* Menu */}
                            {canMenu && (
                                <>
                                    <NavItem to="/menu" icon="ri-dashboard-2-line" label="Menu" isOpen={false} />
                                    <NavItem to="/menu/categories" icon="ri-folders-line" label="Categories" isOpen={false} />
                                    <NavItem to="/menu/addon-groups" icon="ri-puzzle-line" label="Add-Ons" isOpen={false} />
                                    <NavItem to="/menu/items" icon="ri-restaurant-line" label="Items" isOpen={false} />
                                </>
                            )}
                            {canDeals && (
                                <NavItem to="/deals" icon="ri-percent-line" label="Deals" isOpen={false} />
                            )}

                            {/* Marketing */}
                            {canCustomers && (
                                <NavItem to="/customers" icon="ri-user-heart-line" label="Customers" isOpen={false} />
                            )}
                            {canCoupons && (
                                <NavItem to="/coupons" icon="ri-price-tag-3-line" label="Coupons" isOpen={false} />
                            )}
                            {canPromotions && (
                                <NavItem to="/promotions" icon="ri-megaphone-line" label="Promotions" isOpen={false} />
                            )}

                            {/* Admin */}
                            {canStores && (
                                <NavItem to="/stores" icon="ri-store-2-line" label="Stores" isOpen={false} />
                            )}
                            {canApprovals && (
                                <NavItem
                                    to="/approvals"
                                    icon="ri-shield-check-line"
                                    label="Approvals"
                                    isOpen={false}
                                    badge={approvalStats?.total_pending ? approvalStats.total_pending : undefined}
                                />
                            )}
                            {canUsers && (
                                <NavItem to="/users" icon="ri-user-settings-line" label="Staff" isOpen={false} />
                            )}
                            {canAssets && (
                                <NavItem to="/assets" icon="ri-image-line" label="Media" isOpen={false} />
                            )}
                            {canPermissions && (
                                <NavItem to="/permissions" icon="ri-shield-keyhole-line" label="Access" isOpen={false} />
                            )}
                            {canSettings && (
                                <NavItem to="/settings" icon="ri-equalizer-line" label="Settings" isOpen={false} />
                            )}
                        </div>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden space-y-4 ">
                {/* Topbar */}
                <header className="bg-white dark:bg-zinc-800 z-20 p-2 h-16 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700">
                    <div className="flex items-center">
                        <button
                            title="Toggle Sidebar"
                            onClick={() => dispatch(toggleSidebar())}
                            className="p-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700 focus:outline-none"
                        >
                            <i className={isSidebarOpen ? "ri-menu-fold-line text-xl" : "ri-menu-unfold-line text-xl"} />
                        </button>

                        <div className="ml-4 flex items-center gap-2 text-xs cursor-default">
                            <span className='rounded-2xl px-3 p-1 border border-amber-600 hidden md:block bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400'>{currentDate}</span>
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
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold uppercase border border-indigo-200 dark:border-indigo-800">
                                    {user?.name?.[0] || user?.username?.[0] || 'A'}
                                </div>
                                <div className="hidden sm:flex flex-col items-start leading-tight">
                                    <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                                        {user?.name || user?.username || 'Admin'}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-widest font-semibold">
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
                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">{user?.email}</p>
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
                <main className="flex-1 overflow-auto px-4">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 1 }}
                            transition={{ duration: 1, ease: "easeInOut" }}
                            className="flex-1">
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div >
    );
};

interface NavItemProps {
    to: string;
    icon: string;
    label: string;
    isOpen: boolean;
    isSubItem?: boolean;
    badge?: number | string;
    onClick?: () => void;
}

const NavItem = ({ to, icon, label, isOpen, isSubItem, badge, onClick }: NavItemProps) => (
    <Tooltip content={badge ? `${label} (${badge})` : label} position="right" disabled={isOpen}>
        <div className="relative flex items-center w-full">
            <NavLink
                to={to}
                onClick={onClick}
                className={({ isActive }) =>
                    `flex-1 flex items-center justify-between text-sm font-medium rounded-lg transition-all duration-200 group py-1 ${isSubItem ? 'pl-4 pr-4' : 'pl-2 pr-2'
                    } ${isActive
                        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                    }`
                }
            >
                <div className="flex items-center">
                    <div className="relative">
                        <i className={`${icon} ${isSubItem ? 'text-base' : 'text-lg'} ${isOpen ? 'mr-3' : 'mx-auto'}`} />
                        {!isOpen && badge !== undefined && (
                            <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-sm">
                                {Number(badge) > 99 ? '99+' : badge}
                            </span>
                        )}
                    </div>
                    <span className={`whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`}>{label}</span>
                </div>
                {isOpen && badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        {badge}
                    </span>
                )}
            </NavLink>
        </div>
    </Tooltip>
);

interface NavSectionProps {
    label: string;
    children: React.ReactNode;
}

const NavSection = ({ label, children }: NavSectionProps) => (
    <div className="mt-4 first:mt-0">
        <div className="flex items-center gap-2 px-3 mb-1">
            <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{label}</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700/50" />
        </div>
        <div className="space-y-0.5 flex flex-col">
            {children}
        </div>
    </div>
);

interface NavItemGroupProps {
    icon: string;
    label: string;
    isOpen: boolean;
    children: React.ReactNode;
}

export const NavItemGroup = ({ icon, label, isOpen, children }: NavItemGroupProps) => {
    const location = useLocation();
    const [isHovered, setIsHovered] = React.useState(false);
    const childrenArray = React.Children.toArray(children) as React.ReactElement<any>[];

    // Check if any child is active to auto-expand
    const isAnyChildActive = childrenArray.some((child: any) =>
        location.pathname === child.props?.to || location.pathname.startsWith((child.props?.to || '') + '/')
    );

    const [isExpanded, setIsExpanded] = React.useState(isAnyChildActive);

    // Sync expansion if navigating via other means
    React.useEffect(() => {
        if (isAnyChildActive) setIsExpanded(true);
    }, [isAnyChildActive]);

    // Force collapse labels if sidebar is closed
    if (!isOpen) {
        return (
            <div
                className="relative flex flex-col items-center py-1 group/item"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 ${isAnyChildActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-zinc-400 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 group-hover/item:bg-zinc-100 dark:group-hover/item:bg-zinc-800'} cursor-pointer`}>
                    <i className={`${icon} text-lg`} />
                </div>

                {/* Pop-out menu */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, x: 10, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 10, scale: 0.95 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            className="absolute left-full top-0 ml-3 w-52 bg-white dark:bg-zinc-800 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-zinc-100 dark:border-zinc-700 p-2 z-[100]"
                        >
                            <div className="px-3 py-1 border-b border-zinc-50 dark:border-zinc-700/50 mb-1">
                                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">{label}</span>
                            </div>
                            <div className="space-y-1">
                                {React.Children.map(children, (child) => {
                                    if (React.isValidElement(child)) {
                                        return React.cloneElement(child as React.ReactElement<any>, {
                                            isOpen: true,
                                            isSubItem: true,
                                            onClick: () => setIsHovered(false) // Close pop-out on click
                                        });
                                    }
                                    return child;
                                })}
                            </div>
                            {/* Invisible bridge to prevent hover gaps */}
                            <div className="absolute top-0 -left-4 w-4 h-full" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center justify-between px-2 py-1 text-sm transition-colors duration-200 rounded-lg group text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800`}
            >
                <div className="flex items-center">
                    <i className={`${icon} text-lg mr-3 ${isExpanded ? 'text-indigo-500' : 'text-zinc-400 group-hover:text-zinc-500'}`} />
                    <span className="whitespace-nowrap">{label}</span>
                </div>
                <i className={`ri-arrow-down-s-line transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isExpanded ? 'text-indigo-500' : 'text-zinc-400'}`} />
            </button>
            <motion.div
                initial={false}
                animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden bg-zinc-100/50 dark:bg-zinc-900/20 rounded-lg my-1 space-y-1"
            >
                {children}
            </motion.div>
        </div>
    );
};

const DropdownItem = ({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className="flex items-center w-full px-2 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors group"
    >
        <i className={`${icon} mr-3 text-lg text-zinc-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors`} />
        {label}
    </button>
);

export default SessionLayout;

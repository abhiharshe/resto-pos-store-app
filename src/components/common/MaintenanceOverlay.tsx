import React from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logOut } from '../../features/auth/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { motion, AnimatePresence } from 'motion/react';
import { useGetMeQuery } from '../../features/auth/api/authApi';

export const MaintenanceOverlay: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { refetch, isFetching } = useGetMeQuery();

    const isNonAdminRole = ['MANAGER', 'CASHIER', 'KITCHEN'].includes(user?.role);
    const isUnderMaintenance = Boolean(user?.store?.maintenance_mode);

    // Only block non-admin roles when their assigned store is in maintenance mode
    if (!isNonAdminRole || !isUnderMaintenance) {
        return null;
    }

    const store = user?.store;
    const maintenanceMessage = store?.maintenance_message || 'This store is currently undergoing scheduled maintenance. Panel access is temporarily restricted.';
    const startTime = store?.maintenance_start_time ? moment(store.maintenance_start_time).format('MMM D, YYYY · h:mm A') : null;
    const endTime = store?.maintenance_end_time ? moment(store.maintenance_end_time).format('MMM D, YYYY · h:mm A') : null;

    const handleLogout = () => {
        dispatch(logOut());
        navigate('/auth/sign-in');
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl"
            >
                {/* Decorative background glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="relative w-full max-w-lg bg-white/90 dark:bg-zinc-900/90 border border-amber-500/30 dark:border-amber-500/20 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl text-center overflow-hidden"
                >
                    {/* Top amber accent line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />

                    {/* Icon Badge */}
                    <div className="mx-auto mb-6 w-20 h-20 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-inner">
                        <motion.i
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                            className="ri-tools-fill text-4xl"
                        />
                    </div>

                    {/* Store & Title */}
                    {store?.name && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-300 mb-3 border border-zinc-200 dark:border-zinc-700">
                            <i className="ri-store-2-line text-amber-500" />
                            <span>{store.name}</span>
                        </div>
                    )}

                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-3">
                        Store Under Maintenance
                    </h2>

                    <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed mb-6 whitespace-pre-wrap">
                        {maintenanceMessage}
                    </p>

                    {/* Scheduled Times if present */}
                    {(startTime || endTime) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 text-left mb-6">
                            {startTime && (
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
                                        Started At
                                    </span>
                                    <span className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                                        <i className="ri-time-line text-amber-500" />
                                        {startTime}
                                    </span>
                                </div>
                            )}
                            {endTime && (
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-0.5">
                                        Estimated End
                                    </span>
                                    <span className="text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                                        <i className="ri-hourglass-2-line text-amber-500" />
                                        {endTime}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300 mb-6 flex items-center justify-center gap-2">
                        <i className="ri-information-line text-base flex-shrink-0" />
                        <span>Please contact your Store Administrator if you believe this is in error.</span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <button
                            type="button"
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
                        >
                            <i className={`ri-refresh-line ${isFetching ? 'animate-spin' : ''}`} />
                            <span>Check Status</span>
                        </button>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium text-sm transition-colors"
                        >
                            <i className="ri-logout-box-r-line" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MaintenanceOverlay;

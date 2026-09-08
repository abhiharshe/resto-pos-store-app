import React, { useState, useEffect } from 'react';
import { Store, useUpdateStoreMaintenanceMode } from '../api/storesApi';
import toast from 'react-hot-toast';
import moment from 'moment';

interface StoreMaintenanceCardProps {
    store: Store;
}

export const StoreMaintenanceCard: React.FC<StoreMaintenanceCardProps> = ({ store }) => {
    const updateMaintenanceMutation = useUpdateStoreMaintenanceMode();

    const [isEnabled, setIsEnabled] = useState<boolean>(store.maintenance_mode || false);
    const [message, setMessage] = useState<string>(store.maintenance_message || '');
    const [startTime, setStartTime] = useState<string>(
        store.maintenance_start_time ? moment(store.maintenance_start_time).format('YYYY-MM-DDTHH:mm') : ''
    );
    const [endTime, setEndTime] = useState<string>(
        store.maintenance_end_time ? moment(store.maintenance_end_time).format('YYYY-MM-DDTHH:mm') : ''
    );

    useEffect(() => {
        setIsEnabled(store.maintenance_mode || false);
        setMessage(store.maintenance_message || '');
        setStartTime(store.maintenance_start_time ? moment(store.maintenance_start_time).format('YYYY-MM-DDTHH:mm') : '');
        setEndTime(store.maintenance_end_time ? moment(store.maintenance_end_time).format('YYYY-MM-DDTHH:mm') : '');
    }, [store]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEnabled && !message.trim()) {
            toast.error('Please enter a maintenance message for users.');
            return;
        }

        const promise = updateMaintenanceMutation.mutateAsync({
            id: store.id,
            data: {
                maintenance_mode: isEnabled,
                maintenance_message: isEnabled ? message.trim() : '',
                maintenance_start_time: isEnabled && startTime ? new Date(startTime).toISOString() : undefined,
                maintenance_end_time: isEnabled && endTime ? new Date(endTime).toISOString() : undefined,
            },
        });

        toast.promise(promise, {
            loading: 'Updating maintenance settings...',
            success: isEnabled ? 'Maintenance mode enabled for this store.' : 'Maintenance mode disabled.',
            error: 'Failed to update maintenance settings.',
        });
    };

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <i className="ri-tools-line text-xl" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Store Maintenance Mode</h3>
                            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                                Temporarily restrict POS, Orders, and Kitchen access for store staff.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status indicator badge */}
                <div className="flex items-center gap-2">
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            isEnabled
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${isEnabled ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                        {isEnabled ? 'Maintenance Active' : 'Store Operational'}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6 pt-6">
                {/* Toggle */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60">
                    <div className="space-y-0.5 pr-4">
                        <label className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 cursor-pointer" htmlFor="maintenance-mode-toggle">
                            Enable Maintenance Mode
                        </label>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            When turned on, non-admin users (Cashier, Kitchen, Manager) will see a blocking maintenance screen.
                        </p>
                    </div>

                    <button
                        type="button"
                        id="maintenance-mode-toggle"
                        role="switch"
                        aria-checked={isEnabled}
                        onClick={() => setIsEnabled(!isEnabled)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 ${
                            isEnabled ? 'bg-amber-500' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                    >
                        <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isEnabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>

                {isEnabled && (
                    <div className="space-y-4 animate-in fade-in duration-200">
                        {/* Maintenance Message */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                                Maintenance Message <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                maxLength={500}
                                placeholder="e.g., We are currently performing routine kitchen equipment maintenance. Panels will be accessible again shortly."
                                className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors text-sm"
                            />
                            <div className="flex justify-between items-center mt-1 text-[11px] text-zinc-400">
                                <span>Shown to staff trying to access the store panels.</span>
                                <span>{message.length}/500</span>
                            </div>
                        </div>

                        {/* Scheduled Times */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                                    Start Time (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
                                    Estimated End Time (Optional)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
                                />
                            </div>
                        </div>

                        {/* Warning info callout */}
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                            <i className="ri-alert-line text-base text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold mb-0.5">Admin access remains active</p>
                                <p className="opacity-90">
                                    Super Admins and Store Admins can still navigate the dashboard and manage settings while maintenance mode is active.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={updateMaintenanceMutation.isPending}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-colors shadow-sm disabled:opacity-50"
                    >
                        {updateMaintenanceMutation.isPending ? (
                            <>
                                <i className="ri-loader-4-line animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <i className="ri-save-line" />
                                <span>Save Maintenance Settings</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default StoreMaintenanceCard;

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../../app/hooks';
import { useStores } from '../../stores/api/storesApi';
import {
    DayOfWeek,
    useReservationSettings,
    useUpdateReservationSettings,
    useWeeklyPlan,
    useBatchUpdateWeeklySlots,
} from '../api/reservationsApi';
import Container from '../../../components/shared/Container';
import { Select } from '../../../components/common/Select';
import Button from '../../../components/common/Button';

const DAYS_OF_WEEK: DayOfWeek[] = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
];

export const WeeklyPlanSettings: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const { data: stores = [] } = useStores();
    const [selectedStoreId, setSelectedStoreId] = useState<string>(
        user?.store_id || (stores[0]?.id || '')
    );

    const effectiveStoreId = isSuperAdmin
        ? (selectedStoreId || stores[0]?.id || '')
        : (user?.store_id || '');

    const { data: settings } = useReservationSettings(effectiveStoreId);
    const { data: plan, isLoading: loadingPlan } = useWeeklyPlan(effectiveStoreId);

    const updateSettings = useUpdateReservationSettings();
    const batchUpdateSlots = useBatchUpdateWeeklySlots();

    // Local mutable state for slots
    const [localSlots, setLocalSlots] = useState<
        Array<{ day_of_week: DayOfWeek; start_time: string; end_time: string; is_enabled: boolean }>
    >([]);

    useEffect(() => {
        if (plan?.slots) {
            setLocalSlots(
                plan.slots.map((s) => ({
                    day_of_week: s.day_of_week,
                    start_time: s.start_time,
                    end_time: s.end_time,
                    is_enabled: s.is_enabled,
                }))
            );
        }
    }, [plan]);

    const [activeDay, setActiveDay] = useState<DayOfWeek>('MONDAY');

    const handleToggleSlot = (day: DayOfWeek, startTime: string) => {
        setLocalSlots((prev) =>
            prev.map((s) =>
                s.day_of_week === day && s.start_time === startTime
                    ? { ...s, is_enabled: !s.is_enabled }
                    : s
            )
        );
    };

    const handleBulkDay = (day: DayOfWeek, enabled: boolean) => {
        setLocalSlots((prev) =>
            prev.map((s) => (s.day_of_week === day ? { ...s, is_enabled: enabled } : s))
        );
    };

    const handleCopyDayToAll = (sourceDay: DayOfWeek) => {
        const sourceSlots = localSlots.filter((s) => s.day_of_week === sourceDay);
        setLocalSlots((prev) =>
            prev.map((s) => {
                const match = sourceSlots.find((m) => m.start_time === s.start_time);
                return match ? { ...s, is_enabled: match.is_enabled } : s;
            })
        );
        toast.success(`Copied ${sourceDay} schedule to all weekdays`);
    };

    const handleSaveSchedule = async () => {
        try {
            await batchUpdateSlots.mutateAsync({
                storeId: effectiveStoreId,
                slots: localSlots,
            });
            toast.success('Weekly reservation plan saved successfully');
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to save weekly schedule');
        }
    };

    const handleToggleStoreReservations = async () => {
        if (!settings) return;
        try {
            await updateSettings.mutateAsync({
                storeId: effectiveStoreId,
                data: { reservation_enabled: !settings.reservation_enabled },
            });
            toast.success(
                settings.reservation_enabled
                    ? 'Reservations disabled for this store'
                    : 'Reservations enabled for this store'
            );
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to update settings');
        }
    };

    const currentDaySlots = localSlots.filter((s) => s.day_of_week === activeDay);
    currentDaySlots.sort((a, b) => a.start_time.localeCompare(b.start_time));

    return (
        <Container>
            {/* Header & Store Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">Reservation Schedule & Weekly Plan</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Configure fixed 1-hour reservation slots per weekday and manage store-level booking rules.</p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {isSuperAdmin && stores.length > 0 && (
                        <div className="w-52">
                            <Select
                                placeholder="Select Store"
                                value={effectiveStoreId}
                                onChange={(val) => setSelectedStoreId(val || '')}
                                options={stores.map((s) => ({
                                    label: `${s.name} (${s.prefix})`,
                                    value: s.id,
                                }))}
                            />
                        </div>
                    )}

                    <Button
                        variant="primary"
                        onClick={handleSaveSchedule}
                        isLoading={batchUpdateSlots.isPending}
                    >
                        Save Weekly Plan
                    </Button>
                </div>
            </div>

            {/* Store Reservation Master Toggle Card */}
            <div className="p-6 rounded-2xl bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                    <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${settings?.reservation_enabled
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400'
                            }`}
                    >
                        <i className={settings?.reservation_enabled ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-neutral-900 dark:text-zinc-100">
                                Store Reservations: {settings?.reservation_enabled ? 'ENABLED' : 'DISABLED'}
                            </h3>
                            <span
                                className={`text-xs font-bold px-2 py-0.5 rounded-full ${settings?.reservation_enabled
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                                    }`}
                            >
                                {settings?.reservation_enabled ? 'Accepting Bookings' : 'Closed for Bookings'}
                            </span>
                        </div>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">
                            When disabled, customers and staff cannot create new reservations for this store. Existing historical reservations remain intact.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant={settings?.reservation_enabled ? 'danger' : 'success'}
                        onClick={handleToggleStoreReservations}
                        isLoading={updateSettings.isPending}
                    >
                        {settings?.reservation_enabled ? 'Disable Reservations' : 'Enable Reservations'}
                    </Button>
                </div>
            </div>

            {/* Weekly Schedule Grid */}
            <div className="bg-white dark:bg-mauve-900 rounded-2xl border border-mauve-200 dark:border-mauve-800 p-6 shadow-sm space-y-6">
                {/* Day Navigation Tabs */}
                <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-zinc-100 dark:border-mauve-800 pb-3">
                    <div className="flex items-center gap-2">
                        {DAYS_OF_WEEK.map((day) => {
                            const isCurrent = activeDay === day;
                            const daySlots = localSlots.filter((s) => s.day_of_week === day);
                            const enabledCount = daySlots.filter((s) => s.is_enabled).length;

                            return (
                                <button
                                    key={day}
                                    onClick={() => setActiveDay(day)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${isCurrent
                                        ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                                        : 'bg-neutral-50 dark:bg-neutral-800/60 text-zinc-600 dark:text-zinc-400 hover:bg-neutral-100'
                                        }`}
                                >
                                    <span>{day.substring(0, 3)}</span>
                                    <span
                                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${isCurrent
                                            ? 'bg-white/20 dark:bg-mauve-900/20 text-white dark:text-neutral-900'
                                            : enabledCount > 0
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                : 'bg-neutral-200 text-zinc-500 dark:bg-neutral-700'
                                            }`}
                                    >
                                        {enabledCount} On
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Quick Bulk Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkDay(activeDay, true)}
                            className="text-emerald-600 dark:text-emerald-400"
                        >
                            Enable All
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleBulkDay(activeDay, false)}
                            className="text-red-600 dark:text-red-400"
                        >
                            Disable All
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyDayToAll(activeDay)}
                        >
                            Copy to All Days
                        </Button>
                    </div>
                </div>

                {/* 1-Hour Fixed Slots Matrix */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-neutral-900 dark:text-zinc-100 uppercase tracking-wider">
                            1-Hour Slots for {activeDay}
                        </h4>
                        <span className="text-xs text-zinc-400">
                            Click any slot pill to toggle availability ON or OFF
                        </span>
                    </div>

                    {loadingPlan ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                                <div key={n} className="h-20 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                            {currentDaySlots.map((slot) => {
                                return (
                                    <div
                                        key={slot.start_time}
                                        onClick={() => handleToggleSlot(activeDay, slot.start_time)}
                                        className={`p-4 rounded-2xl border cursor-pointer select-none transition-all flex flex-col justify-between ${slot.is_enabled
                                            ? 'bg-emerald-50/50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800/60 shadow-sm hover:border-emerald-400'
                                            : 'bg-neutral-50 border-mauve-200 dark:bg-neutral-800/40 dark:border-mauve-800 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-xs font-black px-2 py-0.5 rounded-md ${slot.is_enabled
                                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                                                    : 'bg-neutral-200 text-zinc-600 dark:bg-neutral-700 dark:text-zinc-400'
                                                    }`}
                                            >
                                                {slot.is_enabled ? 'OPEN' : 'CLOSED'}
                                            </span>
                                            <i
                                                className={`ri-${slot.is_enabled ? 'checkbox-circle-fill text-emerald-600 dark:text-emerald-400' : 'close-circle-line text-zinc-400'
                                                    } text-lg`}
                                            />
                                        </div>

                                        <div className="mt-3">
                                            <p className="text-base font-black text-neutral-900 dark:text-zinc-100 tracking-tight">
                                                {slot.start_time} - {slot.end_time}
                                            </p>
                                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                Fixed 60 Mins Slot
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </Container>
    );
};
export default WeeklyPlanSettings;

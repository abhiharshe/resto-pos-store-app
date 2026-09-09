import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import moment from 'moment';
import { useAppSelector } from '../../../app/hooks';
import { useStores } from '../../stores/api/storesApi';
import {
    Reservation,
    ReservationStatus,
    useStoreReservations,
    useUpdateReservationStatus,
    useCancelReservation,
} from '../api/reservationsApi';
import { NewReservationModal } from '../components/NewReservationModal';
import Container from '../../../components/shared/Container';
import { Select } from '../../../components/common/Select';
import { Input } from '../../../components/common/Input';
import Button from '../../../components/common/Button';

export const ReservationList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    const { data: stores = [] } = useStores();
    const [selectedStoreId, setSelectedStoreId] = useState<string>(
        user?.store_id || (stores[0]?.id || '')
    );

    const effectiveStoreId = isSuperAdmin
        ? (selectedStoreId || stores[0]?.id || '')
        : (user?.store_id || '');

    // Filter states
    const [filterDate, setFilterDate] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<ReservationStatus | ''>('');
    const [searchTerm, setSearchTerm] = useState<string>('');

    const { data: reservations = [], isLoading } = useStoreReservations(effectiveStoreId, {
        date: filterDate || undefined,
        status: filterStatus || undefined,
        search: searchTerm || undefined,
    });

    const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);

    const updateStatus = useUpdateReservationStatus();
    const cancelReservation = useCancelReservation();

    const handleStatusChange = async (reservation: Reservation, nextStatus: ReservationStatus) => {
        try {
            await updateStatus.mutateAsync({
                reservationId: reservation.id,
                storeId: effectiveStoreId,
                data: { status: nextStatus },
            });
            toast.success(`Reservation marked as ${nextStatus.toLowerCase()}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to update reservation status');
        }
    };

    const handleCancel = async (reservation: Reservation) => {
        const reason = window.prompt('Please provide a cancellation reason (optional):');
        if (reason === null) return;
        try {
            await cancelReservation.mutateAsync({
                reservationId: reservation.id,
                storeId: effectiveStoreId,
                reason: reason || undefined,
            });
            toast.success('Reservation cancelled');
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to cancel reservation');
        }
    };

    // Quick Stats
    const totalCount = reservations.length;
    const confirmedCount = reservations.filter((r) => r.status === 'CONFIRMED').length;
    const seatedCount = reservations.filter((r) => r.status === 'SEATED').length;
    const completedCount = reservations.filter((r) => r.status === 'COMPLETED').length;
    const cancelledCount = reservations.filter((r) => r.status === 'CANCELLED').length;

    return (
        <Container>
            {/* Header & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">Table Reservations</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">View guest bookings, manage seating statuses, and create single or multi-table reservations.</p>
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
                        variant="outline"
                        icon="ri-settings-3-line"
                        onClick={() => navigate('/reservations/settings')}
                    >
                        Weekly Schedule
                    </Button>

                    <Button
                        variant="primary"
                        icon="ri-add-line"
                        onClick={() => setIsNewBookingModalOpen(true)}
                    >
                        New Reservation
                    </Button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
                <div className="p-4 rounded-2xl bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-zinc-300 flex items-center justify-center text-lg">
                        <i className="ri-book-read-line" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Bookings</p>
                        <p className="text-xl font-bold text-neutral-900 dark:text-zinc-100">{totalCount}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center text-lg">
                        <i className="ri-checkbox-circle-line" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Confirmed</p>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{confirmedCount}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center text-lg">
                        <i className="ri-restaurant-2-line" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Seated</p>
                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{seatedCount}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center text-lg">
                        <i className="ri-check-double-line" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Completed</p>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedCount}</p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 flex items-center justify-center text-lg">
                        <i className="ri-close-circle-line" />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Cancelled</p>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">{cancelledCount}</p>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="p-4 rounded-2xl bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                    {/* Search */}
                    <div className="w-full sm:w-64">
                        <Input
                            icon="ri-search-line"
                            placeholder="Search by name, phone, code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Date Picker */}
                    <div className="w-full sm:w-44">
                        <Input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>

                    {/* Status Dropdown */}
                    <div className="w-full sm:w-44">
                        <Select
                            placeholder="All Statuses"
                            value={filterStatus}
                            onChange={(val) => setFilterStatus(val || '')}
                            options={[
                                { label: 'All Statuses', value: '' },
                                { label: 'CONFIRMED', value: 'CONFIRMED' },
                                { label: 'SEATED', value: 'SEATED' },
                                { label: 'COMPLETED', value: 'COMPLETED' },
                                { label: 'CANCELLED', value: 'CANCELLED' },
                                { label: 'NO SHOW', value: 'NO_SHOW' },
                            ]}
                        />
                    </div>

                    {(filterDate || filterStatus || searchTerm) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFilterDate('');
                                setFilterStatus('');
                                setSearchTerm('');
                            }}
                        >
                            Reset Filters
                        </Button>
                    )}
                </div>

                <div className="text-xs text-zinc-400">
                    Showing {reservations.length} reservation{reservations.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Reservations Table */}
            <div className="bg-white dark:bg-mauve-900 rounded-2xl border border-mauve-200 dark:border-mauve-800 overflow-hidden shadow-sm">
                {isLoading ? (
                    <div className="p-8 space-y-4">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <div key={n} className="h-12 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-xl" />
                        ))}
                    </div>
                ) : reservations.length === 0 ? (
                    <div className="text-center py-16 p-8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
                            <i className="ri-calendar-line" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-zinc-100">No Reservations Found</h3>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1 mb-6">
                            No reservations match your current filters or date selection.
                        </p>
                        <Button
                            variant="primary"
                            icon="ri-add-line"
                            size="sm"
                            onClick={() => setIsNewBookingModalOpen(true)}
                        >
                            Book New Reservation
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-mauve-200 dark:border-mauve-800 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                                <tr>
                                    <th className="px-5 py-3.5">Booking / Code</th>
                                    <th className="px-5 py-3.5">Customer</th>
                                    <th className="px-5 py-3.5">Date & 1-Hour Slot</th>
                                    <th className="px-5 py-3.5">Party Size</th>
                                    <th className="px-5 py-3.5">Assigned Tables</th>
                                    <th className="px-5 py-3.5">Status</th>
                                    <th className="px-5 py-3.5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                                {reservations.map((r) => {
                                    return (
                                        <tr key={r.id} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors">
                                            <td className="px-5 py-4 font-mono font-bold text-neutral-900 dark:text-zinc-100">
                                                <span>{r.reservation_number || r.id.substring(0, 8)}</span>
                                                <span className="block font-sans text-[10px] text-zinc-400 font-normal mt-0.5">
                                                    Booked: {moment(r.created_at).format('MMM D, h:mm A')}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-bold text-neutral-900 dark:text-zinc-100 text-sm">
                                                    {r.customer_name}
                                                </p>
                                                <p className="text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mt-0.5">
                                                    <i className="ri-phone-line" />
                                                    {r.customer_phone}
                                                </p>
                                                {r.customer_email && (
                                                    <p className="text-[11px] text-zinc-400">
                                                        {r.customer_email}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-bold text-neutral-900 dark:text-zinc-100">
                                                    {moment(r.reservation_date).format('ddd, MMM D, YYYY')}
                                                </p>
                                                <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-bold text-zinc-700 dark:text-zinc-300">
                                                    {r.start_time} - {r.end_time}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <span className="font-bold text-neutral-900 dark:text-zinc-100">
                                                    {r.guest_count} Guests
                                                </span>
                                                <span className="block text-[11px] text-zinc-400">
                                                    Capacity: {r.total_capacity}p
                                                </span>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {r.tables.map((t) => (
                                                        <span
                                                            key={t.id}
                                                            className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold border border-primary/20 text-[11px]"
                                                        >
                                                            {t.table_number} ({t.capacity}p)
                                                        </span>
                                                    ))}
                                                </div>
                                                {r.tables[0]?.floor_name && (
                                                    <span className="text-[10px] text-zinc-400 block mt-1">
                                                        {r.tables[0].floor_name}
                                                    </span>
                                                )}
                                                {r.special_requests && (
                                                    <span className="text-[11px] text-amber-600 dark:text-amber-400 italic block mt-1">
                                                        "{r.special_requests}"
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <span
                                                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${r.status === 'CONFIRMED'
                                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400'
                                                        : r.status === 'SEATED'
                                                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400'
                                                            : r.status === 'COMPLETED'
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                                                : r.status === 'CANCELLED'
                                                                    ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400'
                                                                    : 'bg-neutral-100 text-zinc-600 dark:bg-neutral-800 dark:text-zinc-400'
                                                        }`}
                                                >
                                                    {r.status}
                                                </span>
                                            </td>

                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {r.status === 'CONFIRMED' && (
                                                        <Button
                                                            size="sm"
                                                            variant="secondary"
                                                            onClick={() => handleStatusChange(r, 'SEATED')}
                                                        >
                                                            Seat
                                                        </Button>
                                                    )}

                                                    {r.status === 'SEATED' && (
                                                        <Button
                                                            size="sm"
                                                            variant="success"
                                                            onClick={() => handleStatusChange(r, 'COMPLETED')}
                                                        >
                                                            Complete
                                                        </Button>
                                                    )}

                                                    {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleCancel(r)}
                                                            className="hover:text-red-600 dark:hover:text-red-400"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* New Reservation Modal */}
            <NewReservationModal
                isOpen={isNewBookingModalOpen}
                onClose={() => setIsNewBookingModalOpen(false)}
                storeId={effectiveStoreId}
            />
        </Container>
    );
};
export default ReservationList;

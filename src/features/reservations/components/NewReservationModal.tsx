import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import moment from 'moment';
import {
    useCheckAvailability,
    useCreateReservation,
    CombinationOption,
} from '../api/reservationsApi';
import Modal from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import { NumberInput } from '../../../components/common/NumberInput';
import Button from '../../../components/common/Button';

interface NewReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    storeId: string;
}

const validationSchema = Yup.object({
    customer_name: Yup.string().required('Guest name is required'),
    customer_phone: Yup.string().required('Phone number is required'),
    customer_email: Yup.string().email('Invalid email').nullable(),
    reservation_date: Yup.string().required('Reservation date is required'),
    start_time: Yup.string().required('Start time slot is required'),
    guest_count: Yup.number().integer().min(1, 'Minimum 1 guest required').required('Guest count is required'),
    special_requests: Yup.string().nullable(),
});

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
    isOpen,
    onClose,
    storeId,
}) => {
    const createReservation = useCreateReservation();

    const [selectedSlot, setSelectedSlot] = useState<string>('19:00');
    const [selectedDate, setSelectedDate] = useState<string>(moment().format('YYYY-MM-DD'));
    const [guestCount, setGuestCount] = useState<number>(4);
    const [chosenCombo, setChosenCombo] = useState<CombinationOption | null>(null);

    // Live Availability Query
    const { data: availability, isLoading: checkingAvailability } = useCheckAvailability(
        storeId,
        selectedDate,
        guestCount,
        selectedSlot
    );

    const formik = useFormik({
        initialValues: {
            customer_name: '',
            customer_phone: '',
            customer_email: '',
            reservation_date: selectedDate,
            start_time: selectedSlot,
            end_time: '20:00',
            guest_count: guestCount,
            special_requests: '',
        },
        enableReinitialize: false,
        validationSchema,
        onSubmit: async (values) => {
            try {
                // If user selected a custom combination, send table_ids, else backend auto-assigns
                const tableIds = chosenCombo ? chosenCombo.tables.map((t) => t.id) : undefined;
                await createReservation.mutateAsync({
                    storeId,
                    data: {
                        ...values,
                        reservation_date: selectedDate,
                        start_time: selectedSlot,
                        end_time: moment(selectedSlot, 'HH:mm').add(1, 'hour').format('HH:mm'),
                        guest_count: guestCount,
                        table_ids: tableIds,
                    },
                });
                toast.success('Table reservation confirmed successfully!');
                onClose();
            } catch (err: any) {
                toast.error(err?.response?.data?.detail || 'Failed to create reservation');
            }
        },
    });

    const availableOptions = availability?.selected_slot_options || [];

    const handleDateChange = (d: string) => {
        setSelectedDate(d);
        formik.setFieldValue('reservation_date', d);
        setChosenCombo(null);
    };

    const handleSlotChange = (slotTime: string) => {
        setSelectedSlot(slotTime);
        formik.setFieldValue('start_time', slotTime);
        const nextEnd = moment(slotTime, 'HH:mm').add(1, 'hour').format('HH:mm');
        formik.setFieldValue('end_time', nextEnd);
        setChosenCombo(null);
    };

    const handleGuestCountChange = (count: number) => {
        setGuestCount(count);
        formik.setFieldValue('guest_count', count);
        setChosenCombo(null);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Book a Table Reservation"
            size="xl"
        >
            <form onSubmit={formik.handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {/* Date & Party Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Reservation Date"
                        type="date"
                        required
                        value={selectedDate}
                        min={moment().format('YYYY-MM-DD')}
                        onChange={(e) => handleDateChange(e.target.value)}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                            Party Size / Guests <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <div className="w-24">
                                <NumberInput
                                    min={1}
                                    max={100}
                                    value={guestCount}
                                    onChange={(e) => handleGuestCountChange(parseInt(e.target.value) || 1)}
                                />
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                                {[2, 4, 6, 8, 12, 18].map((n) => (
                                    <Button
                                        key={n}
                                        type="button"
                                        size="sm"
                                        variant={guestCount === n ? 'primary' : 'outline'}
                                        onClick={() => handleGuestCountChange(n)}
                                    >
                                        {n}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Time Slot Picker */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-2">
                        Select 1-Hour Time Slot ({selectedDate})
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-1">
                        {availability?.slots?.map((s) => {
                            const isSelected = selectedSlot === s.start_time;
                            return (
                                <button
                                    key={s.start_time}
                                    type="button"
                                    disabled={!s.is_enabled || !s.is_available}
                                    onClick={() => handleSlotChange(s.start_time)}
                                    className={`p-2 rounded-xl border text-center transition-all ${!s.is_enabled
                                        ? 'bg-neutral-100 dark:bg-neutral-800/50 border-mauve-200 dark:border-mauve-800 text-zinc-400 cursor-not-allowed opacity-50'
                                        : !s.is_available
                                            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/30 text-red-500 cursor-not-allowed'
                                            : isSelected
                                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm font-bold scale-[1.02]'
                                                : 'bg-neutral-50 dark:bg-neutral-800 text-zinc-700 dark:text-zinc-200 border-mauve-200 dark:border-zinc-700 hover:border-indigo-500/50'
                                        }`}
                                >
                                    <span className="text-xs font-bold block">{s.start_time}</span>
                                    <span className="text-[10px] block opacity-80">
                                        {!s.is_enabled ? 'Closed' : !s.is_available ? 'Full' : `${s.options_count} Opts`}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Available Combinations Recommendation Banner */}
                <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-mauve-200 dark:border-zinc-700 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <i className="ri-magic-line text-indigo-600 dark:text-indigo-400" />
                            Available Table Combinations ({selectedSlot} - {moment(selectedSlot, 'HH:mm').add(1, 'hour').format('HH:mm')})
                        </span>
                        {checkingAvailability && (
                            <span className="text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                <i className="ri-loader-4-line animate-spin" /> Checking...
                            </span>
                        )}
                    </div>

                    {availableOptions.length === 0 ? (
                        <div className="py-4 text-center text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                            No available single table or combinable tables found for {guestCount} guests at this time slot. Try another slot or date.
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {availableOptions.map((opt, idx) => {
                                const isChosen = chosenCombo ? (
                                    chosenCombo.tables.map(t => t.id).sort().join(',') === opt.tables.map(t => t.id).sort().join(',')
                                ) : idx === 0;

                                return (
                                    <div
                                        key={idx}
                                        onClick={() => setChosenCombo(opt)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${isChosen
                                            ? 'bg-indigo-50/70 border-indigo-400 shadow-sm dark:bg-indigo-950/30 dark:border-indigo-800'
                                            : 'bg-white dark:bg-mauve-900 border-mauve-200 dark:border-zinc-700 hover:border-zinc-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs ${isChosen
                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                    : 'border-zinc-300 dark:border-zinc-600 bg-white dark:bg-neutral-800'
                                                    }`}
                                            >
                                                {isChosen && <i className="ri-check-line font-bold" />}
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {opt.tables.map((t) => (
                                                        <span
                                                            key={t.id}
                                                            className="px-2 py-0.5 rounded-md text-xs font-bold bg-neutral-100 dark:bg-neutral-800 text-zinc-800 dark:text-zinc-200 border border-mauve-200 dark:border-zinc-700"
                                                        >
                                                            {t.table_number} ({t.capacity}p)
                                                        </span>
                                                    ))}
                                                    {idx === 0 && (
                                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                                                            Recommended (Best Fit)
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                                                    Floor: {opt.floor_names.join(', ')} • {opt.tables_count} Table{opt.tables_count > 1 ? 's combined' : ''}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <span className="text-xs font-bold text-neutral-900 dark:text-zinc-100 block">
                                                {opt.total_capacity} Capacity
                                            </span>
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                                                Fits {guestCount} guests
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Customer Information Form */}
                <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Customer / Guest Details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                            label="Customer Name"
                            name="customer_name"
                            required
                            placeholder="Full Name"
                            value={formik.values.customer_name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.customer_name && formik.errors.customer_name ? formik.errors.customer_name : undefined}
                        />

                        <Input
                            label="Phone Number"
                            name="customer_phone"
                            required
                            placeholder="Phone / Mobile"
                            value={formik.values.customer_phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.customer_phone && formik.errors.customer_phone ? formik.errors.customer_phone : undefined}
                        />
                    </div>

                    <Input
                        label="Email (Optional)"
                        type="email"
                        name="customer_email"
                        placeholder="guest@example.com"
                        value={formik.values.customer_email}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.customer_email && formik.errors.customer_email ? formik.errors.customer_email : undefined}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                            Special Requests / Dietary Notes
                        </label>
                        <textarea
                            name="special_requests"
                            rows={2}
                            placeholder="e.g. Birthday celebration, High chair needed, Quiet table..."
                            value={formik.values.special_requests}
                            onChange={formik.handleChange}
                            className="block w-full sm:text-sm rounded-md transition-colors py-2 px-4 border border-mauve-200 dark:border-zinc-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-neutral-800 resize-none"
                        />
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-mauve-800 mt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={createReservation.isPending}
                        disabled={availableOptions.length === 0}
                    >
                        Confirm Reservation
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

export default NewReservationModal;

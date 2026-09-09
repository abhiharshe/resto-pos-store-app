import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
    TableDetail,
    Seat,
    useCreateSeat,
    useUpdateSeat,
    useDeleteSeat,
} from '../api/tablesApi';
import Modal from '../../../components/common/Modal';
import { Input } from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import IconButton from '../../../components/common/IconButton';

interface SeatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: TableDetail;
    storeId: string;
}

export const SeatsModal: React.FC<SeatsModalProps> = ({
    isOpen,
    onClose,
    table,
    storeId,
}) => {
    const createSeat = useCreateSeat();
    const updateSeat = useUpdateSeat();
    const deleteSeat = useDeleteSeat();

    const [newSeatNumber, setNewSeatNumber] = useState('');
    const [newSeatName, setNewSeatName] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleAddSeat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSeatNumber.trim()) {
            toast.error('Seat number is required');
            return;
        }

        try {
            await createSeat.mutateAsync({
                tableId: table.id,
                storeId,
                data: {
                    seat_number: newSeatNumber.trim(),
                    name: newSeatName.trim() || null,
                    status: 'ACTIVE',
                },
            });
            toast.success(`Seat ${newSeatNumber.trim()} added`);
            setNewSeatNumber('');
            setNewSeatName('');
            setIsAdding(false);
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to add seat');
        }
    };

    const handleToggleStatus = async (seat: Seat) => {
        const nextStatus = seat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await updateSeat.mutateAsync({
                seatId: seat.id,
                storeId,
                data: { status: nextStatus },
            });
            toast.success(`Seat marked ${nextStatus.toLowerCase()}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to update seat status');
        }
    };

    const handleDeleteSeat = async (seatId: string) => {
        if (!window.confirm('Are you sure you want to remove this seat?')) return;
        try {
            await deleteSeat.mutateAsync({ seatId, storeId });
            toast.success('Seat removed');
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to remove seat');
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Seats for Table ${table.table_number}`}
            size="md"
        >
            <div className="p-6">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-mauve-800">
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {table.floor_name || 'Floor'} • Capacity: {table.capacity} guests
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                        {table.seats.length} / {table.capacity} Seats
                    </span>
                </div>

                {/* Seat List */}
                <div className="mt-4 space-y-2 max-h-64 overflow-y-auto pr-1">
                    {table.seats.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-mauve-200 dark:border-mauve-800 rounded-xl">
                            <i className="ri-chair-line text-3xl text-zinc-300 dark:text-zinc-600 mb-1 block" />
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                No individual seats registered yet.
                            </p>
                        </div>
                    ) : (
                        table.seats.map((seat) => (
                            <div
                                key={seat.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-zinc-100 dark:border-mauve-800"
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${seat.status === 'ACTIVE'
                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40'
                                            : 'bg-neutral-200 text-zinc-500 dark:bg-neutral-800 dark:text-zinc-500 border border-zinc-300 dark:border-zinc-700'
                                            }`}
                                    >
                                        <i className="ri-chair-fill" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                                            {seat.seat_number}
                                        </p>
                                        {seat.name && (
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {seat.name}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleToggleStatus(seat)}
                                        className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${seat.status === 'ACTIVE'
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 hover:bg-emerald-100'
                                            : 'bg-neutral-100 text-zinc-600 dark:bg-neutral-800 dark:text-zinc-400 hover:bg-neutral-200'
                                            }`}
                                    >
                                        {seat.status}
                                    </button>
                                    <IconButton
                                        icon="ri-delete-bin-line"
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleDeleteSeat(seat.id)}
                                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Seat Form / Button */}
                {isAdding ? (
                    <form onSubmit={handleAddSeat} className="mt-4 pt-4 border-t border-zinc-100 dark:border-mauve-800 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                placeholder="Seat Code (e.g. S5)"
                                value={newSeatNumber}
                                onChange={(e) => setNewSeatNumber(e.target.value)}
                            />
                            <Input
                                placeholder="Seat Label (Optional)"
                                value={newSeatName}
                                onChange={(e) => setNewSeatName(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setIsAdding(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                isLoading={createSeat.isPending}
                            >
                                Add Seat
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-mauve-800 flex justify-between items-center">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            icon="ri-add-line"
                            onClick={() => setIsAdding(true)}
                            className="text-indigo-600 dark:text-indigo-400"
                        >
                            Add Seat
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onClose}
                        >
                            Close
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default SeatsModal;

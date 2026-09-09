import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
    TableDetail,
    useBatchUpdateCombinations,
} from '../api/tablesApi';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';

interface TableCombinationModalProps {
    isOpen: boolean;
    onClose: () => void;
    table: TableDetail;
    allTables: TableDetail[];
    storeId: string;
}

export const TableCombinationModal: React.FC<TableCombinationModalProps> = ({
    isOpen,
    onClose,
    table,
    allTables,
    storeId,
}) => {
    const batchUpdateCombinations = useBatchUpdateCombinations();

    // Candidate tables in the same store except itself
    const candidateTables = allTables.filter((t) => t.id !== table.id);

    const [selectedIds, setSelectedIds] = useState<string[]>(table.combined_table_ids || []);

    const handleToggle = (targetId: string) => {
        if (selectedIds.includes(targetId)) {
            setSelectedIds(selectedIds.filter((id) => id !== targetId));
        } else {
            setSelectedIds([...selectedIds, targetId]);
        }
    };

    const handleSave = async () => {
        try {
            await batchUpdateCombinations.mutateAsync({
                storeId,
                tableId: table.id,
                combinedTableIds: selectedIds,
            });
            toast.success('Table combinations updated successfully');
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to update combinations');
        }
    };

    const combinedCapacity = table.capacity + candidateTables
        .filter((t) => selectedIds.includes(t.id))
        .reduce((sum, t) => sum + t.capacity, 0);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Combinable Tables: Table ${table.table_number}`}
            size="lg"
        >
            <div className="p-6">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">
                    Select physically adjacent tables on the floor that can be joined with Table {table.table_number} to accommodate large party reservations.
                </p>

                {/* Combined Capacity Banner */}
                <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base">
                            <i className="ri-link" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-neutral-900 dark:text-zinc-100">
                                {selectedIds.length === 0 ? 'Standalone Table' : `${selectedIds.length + 1} Tables Combined`}
                            </p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Total party capacity when merged
                            </p>
                        </div>
                    </div>
                    <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg bg-white dark:bg-neutral-800 border border-indigo-100 dark:border-indigo-800 shadow-sm">
                        {combinedCapacity} Seats Total
                    </span>
                </div>

                {/* Candidate Selection List */}
                <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
                    {candidateTables.length === 0 ? (
                        <div className="text-center py-6 text-xs text-zinc-400">
                            No other tables available in this store to combine.
                        </div>
                    ) : (
                        candidateTables.map((t) => {
                            const isSelected = selectedIds.includes(t.id);
                            return (
                                <div
                                    key={t.id}
                                    onClick={() => handleToggle(t.id)}
                                    className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
                                        ? 'bg-indigo-50/50 border-indigo-300 dark:bg-indigo-950/20 dark:border-indigo-800'
                                        : 'bg-neutral-50 dark:bg-neutral-800/30 border-mauve-200 dark:border-mauve-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`w-5 h-5 rounded-md flex items-center justify-center border text-xs transition-colors ${isSelected
                                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                                : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-mauve-900'
                                                }`}
                                        >
                                            {isSelected && <i className="ri-check-line font-bold" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-neutral-900 dark:text-zinc-100">
                                                    Table {t.table_number}
                                                </span>
                                                {t.name && (
                                                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                                        ({t.name})
                                                    </span>
                                                )}
                                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-700 text-zinc-600 dark:text-zinc-300 font-medium">
                                                    {t.floor_name || 'Floor'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                                                Capacity: {t.capacity} guests • {t.shape.toLowerCase()}
                                            </p>
                                        </div>
                                    </div>

                                    <span
                                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${isSelected
                                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                            : 'text-zinc-400'
                                            }`}
                                    >
                                        +{t.capacity} Seats
                                    </span>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-mauve-800 mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleSave}
                        isLoading={batchUpdateCombinations.isPending}
                    >
                        Save Combinations
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default TableCombinationModal;

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppSelector } from '../../../app/hooks';
import { useStores } from '../../stores/api/storesApi';
import {
    Floor,
    TableDetail,
    useStoreFloors,
    useStoreTables,
    useUpdateTable,
    useDeleteTable,
    useDeleteFloor,
} from '../api/tablesApi';
import { FloorModal } from '../components/FloorModal';
import { TableModal } from '../components/TableModal';
import { SeatsModal } from '../components/SeatsModal';
import { TableCombinationModal } from '../components/TableCombinationModal';
import Container from '../../../components/shared/Container';
import { Select } from '../../../components/common/Select';

export const FloorTableManagement: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    // Store Selection
    const { data: stores = [] } = useStores();
    const [selectedStoreId, setSelectedStoreId] = useState<string>(
        user?.store_id || (stores[0]?.id || '')
    );

    // Active store ID to query
    const effectiveStoreId = isSuperAdmin
        ? (selectedStoreId || stores[0]?.id || '')
        : (user?.store_id || '');

    // Floors & Tables Queries
    const { data: floors = [], isLoading: loadingFloors } = useStoreFloors(effectiveStoreId, true);
    const { data: tables = [], isLoading: loadingTables } = useStoreTables(effectiveStoreId);

    const [activeFloorId, setActiveFloorId] = useState<string | null>(null);

    // If activeFloorId is not set, default to first floor
    const currentFloorId = activeFloorId || floors[0]?.id || '';
    const currentFloor = floors.find((f) => f.id === currentFloorId);
    const floorTables = tables.filter((t) => t.floor_id === currentFloorId);

    // Modals state
    const [isFloorModalOpen, setIsFloorModalOpen] = useState(false);
    const [floorToEdit, setFloorToEdit] = useState<Floor | null>(null);

    const [isTableModalOpen, setIsTableModalOpen] = useState(false);
    const [tableToEdit, setTableToEdit] = useState<TableDetail | null>(null);

    const [isSeatsModalOpen, setIsSeatsModalOpen] = useState(false);
    const [seatsTable, setSeatsTable] = useState<TableDetail | null>(null);

    const [isCombinationModalOpen, setIsCombinationModalOpen] = useState(false);
    const [combinationTable, setCombinationTable] = useState<TableDetail | null>(null);

    // Mutation hooks
    const updateTable = useUpdateTable();
    const deleteTable = useDeleteTable();
    const deleteFloor = useDeleteFloor();

    // Floor Metrics
    const totalCapacity = tables.reduce((acc, t) => acc + (t.status === 'ACTIVE' ? t.capacity : 0), 0);
    const activeTablesCount = tables.filter((t) => t.status === 'ACTIVE').length;

    const handleDeleteTable = async (table: TableDetail) => {
        if (!window.confirm(`Are you sure you want to remove Table ${table.table_number}?`)) return;
        try {
            await deleteTable.mutateAsync({ tableId: table.id, storeId: effectiveStoreId });
            toast.success(`Table ${table.table_number} deleted`);
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to delete table');
        }
    };

    const handleDeleteFloor = async (floor: Floor) => {
        if (!window.confirm(`Are you sure you want to delete "${floor.name}"?`)) return;
        try {
            await deleteFloor.mutateAsync({ floorId: floor.id, storeId: effectiveStoreId });
            toast.success(`Floor "${floor.name}" deleted`);
            setActiveFloorId(null);
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to delete floor');
        }
    };

    const handleToggleTableStatus = async (table: TableDetail) => {
        const nextStatus = table.status === 'ACTIVE' ? 'MAINTENANCE' : table.status === 'MAINTENANCE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await updateTable.mutateAsync({
                tableId: table.id,
                storeId: effectiveStoreId,
                data: { status: nextStatus },
            });
            toast.success(`Table marked ${nextStatus.toLowerCase()}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || 'Failed to update table status');
        }
    };

    return (
        <Container>
            {/* Header & Store Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">Floors & Table Management</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Configure restaurant floors, table seating capacity, individual seats, and combinable party groups.</p>
                </div>

                <div className="flex items-center gap-3">
                    {isSuperAdmin && stores.length > 0 && (
                        <div className="w-52">
                            <Select
                                placeholder="Select Store"
                                value={effectiveStoreId}
                                onChange={(val) => {
                                    setSelectedStoreId(val || '');
                                    setActiveFloorId(null);
                                }}
                                options={stores.map((s) => ({
                                    label: `${s.name} (${s.prefix})`,
                                    value: s.id,
                                }))}
                            />
                        </div>
                    )}

                    <button
                        onClick={() => {
                            setFloorToEdit(null);
                            setIsFloorModalOpen(true);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-mauve-200 dark:border-zinc-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-zinc-800 dark:text-zinc-200 text-sm font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                        <i className="ri-add-line font-bold" />
                        Add Floor
                    </button>

                    <button
                        onClick={() => {
                            setTableToEdit(null);
                            setIsTableModalOpen(true);
                        }}
                        disabled={floors.length === 0}
                        className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <i className="ri-add-line font-bold" />
                        Add Table
                    </button>
                </div>
            </div>

            {/* Quick Summary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 shadow-sm flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center text-xl">
                        <i className="ri-building-line" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                            Total Floors
                        </p>
                        <p className="text-xl font-bold text-neutral-900 dark:text-zinc-100">
                            {floors.length}
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 shadow-sm flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center text-xl">
                        <i className="ri-layout-masonry-line" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                            Active Tables
                        </p>
                        <p className="text-xl font-bold text-neutral-900 dark:text-zinc-100">
                            {activeTablesCount} / {tables.length}
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 shadow-sm flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 flex items-center justify-center text-xl">
                        <i className="ri-team-line" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                            Total Capacity
                        </p>
                        <p className="text-xl font-bold text-neutral-900 dark:text-zinc-100">
                            {totalCapacity} Guests
                        </p>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 shadow-sm flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 flex items-center justify-center text-xl">
                        <i className="ri-links-line" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                            Combinable Tables
                        </p>
                        <p className="text-xl font-bold text-neutral-900 dark:text-zinc-100">
                            {tables.filter((t) => t.combined_table_ids.length > 0).length} Tables
                        </p>
                    </div>
                </div>
            </div>

            {/* Floor Tabs */}
            {loadingFloors ? (
                <div className="h-12 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-2xl" />
            ) : floors.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-mauve-900 rounded-2xl border border-mauve-200 dark:border-mauve-800 p-8 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 text-2xl">
                        <i className="ri-building-line" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 dark:text-zinc-100">No Floors Created Yet</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-md mx-auto mt-1 mb-6">
                        Start by creating your first restaurant floor (e.g., Ground Floor, Main Dining, Rooftop).
                    </p>
                    <button
                        onClick={() => {
                            setFloorToEdit(null);
                            setIsFloorModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:shadow"
                    >
                        Create Floor Now
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Tabs Bar */}
                    <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
                        <div className="flex items-center gap-2">
                            {floors.map((floor) => {
                                const isCurrent = floor.id === currentFloorId;
                                return (
                                    <button
                                        key={floor.id}
                                        onClick={() => setActiveFloorId(floor.id)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${isCurrent
                                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm'
                                            : 'bg-white dark:bg-mauve-900 text-zinc-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-mauve-200 dark:border-mauve-800'
                                            }`}
                                    >
                                        <span>{floor.name}</span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full font-bold ${isCurrent
                                                ? 'bg-white/20 dark:bg-mauve-900/20'
                                                : 'bg-neutral-100 dark:bg-neutral-800 text-zinc-500'
                                                }`}
                                        >
                                            {floor.tables_count} Tables
                                        </span>
                                        {floor.status === 'INACTIVE' && (
                                            <span className="w-2 h-2 rounded-full bg-red-500" title="Floor Inactive" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {currentFloor && (
                            <div className="flex items-center gap-1.5 ml-auto">
                                <button
                                    onClick={() => {
                                        setFloorToEdit(currentFloor);
                                        setIsFloorModalOpen(true);
                                    }}
                                    className="p-2 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-mauve-200 dark:border-mauve-800 bg-white dark:bg-mauve-900 text-sm font-medium transition-colors"
                                    title="Edit Floor"
                                >
                                    <i className="ri-edit-line" />
                                </button>
                                <button
                                    onClick={() => handleDeleteFloor(currentFloor)}
                                    className="p-2 rounded-xl text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 border border-mauve-200 dark:border-mauve-800 bg-white dark:bg-mauve-900 text-sm font-medium transition-colors"
                                    title="Delete Floor"
                                >
                                    <i className="ri-delete-bin-line" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Table Cards Canvas / Grid */}
                    {loadingTables ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((n) => (
                                <div key={n} className="h-44 bg-neutral-100 dark:bg-neutral-800 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : floorTables.length === 0 ? (
                        <div className="text-center py-14 bg-white dark:bg-mauve-900 rounded-2xl border border-mauve-200 dark:border-mauve-800 p-8 shadow-sm">
                            <div className="w-14 h-14 rounded-full bg-neutral-100 dark:bg-neutral-800 text-zinc-400 flex items-center justify-center mx-auto mb-3 text-2xl">
                                <i className="ri-restaurant-line" />
                            </div>
                            <h4 className="text-base font-bold text-neutral-900 dark:text-zinc-100">
                                No Tables on {currentFloor?.name}
                            </h4>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto mt-1 mb-5">
                                Add physical dining tables with capacities, shapes, and seats to this floor.
                            </p>
                            <button
                                onClick={() => {
                                    setTableToEdit(null);
                                    setIsTableModalOpen(true);
                                }}
                                className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm hover:shadow"
                            >
                                + Add Table to {currentFloor?.name}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {floorTables.map((table) => {
                                const isMaint = table.status === 'MAINTENANCE';
                                const isInactive = table.status === 'INACTIVE';
                                return (
                                    <div
                                        key={table.id}
                                        className={`group relative p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-mauve-900 ${isInactive
                                            ? 'border-mauve-200 dark:border-mauve-800 opacity-60'
                                            : isMaint
                                                ? 'border-amber-300 dark:border-amber-800/60 shadow-sm'
                                                : 'border-mauve-200 dark:border-mauve-800 shadow-sm hover:shadow-md hover:border-primary/40'
                                            }`}
                                    >
                                        {/* Table Shape Icon & Code */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-12 h-12 flex items-center justify-center text-xl font-bold transition-transform group-hover:scale-105 ${table.shape === 'ROUND' ? 'rounded-full' : 'rounded-xl'
                                                        } ${isInactive
                                                            ? 'bg-neutral-100 text-zinc-400 dark:bg-neutral-800 dark:text-zinc-500'
                                                            : isMaint
                                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
                                                                : 'bg-primary/10 text-primary'
                                                        }`}
                                                >
                                                    {table.shape === 'ROUND' ? (
                                                        <i className="ri-circle-line" />
                                                    ) : table.shape === 'SQUARE' ? (
                                                        <i className="ri-square-line" />
                                                    ) : (
                                                        <i className="ri-table-fill" />
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-1.5">
                                                        <h4 className="text-base font-black text-neutral-900 dark:text-zinc-100 tracking-tight">
                                                            {table.table_number}
                                                        </h4>
                                                        <span
                                                            onClick={() => handleToggleTableStatus(table)}
                                                            className={`cursor-pointer text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${table.status === 'ACTIVE'
                                                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                                                : table.status === 'MAINTENANCE'
                                                                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                                                                    : 'bg-neutral-100 text-zinc-600 dark:bg-neutral-800 dark:text-zinc-400'
                                                                }`}
                                                            title="Click to toggle status"
                                                        >
                                                            {table.status}
                                                        </span>
                                                    </div>
                                                    {table.name && (
                                                        <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate max-w-[140px]">
                                                            {table.name}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Top Actions */}
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => {
                                                        setTableToEdit(table);
                                                        setIsTableModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                                    title="Edit Table"
                                                >
                                                    <i className="ri-edit-line text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTable(table)}
                                                    className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                                    title="Delete Table"
                                                >
                                                    <i className="ri-delete-bin-line text-sm" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Capacity & Attributes */}
                                        <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-mauve-800 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
                                                <i className="ri-user-line text-primary" />
                                                <span>Capacity: <strong>{table.capacity}</strong></span>
                                                {table.min_capacity > 1 && (
                                                    <span className="text-[11px] text-zinc-400">(Min {table.min_capacity})</span>
                                                )}
                                            </div>

                                            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 capitalize">
                                                {table.shape.toLowerCase()}
                                            </span>
                                        </div>

                                        {/* Action Buttons for Seats & Combinations */}
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => {
                                                    setSeatsTable(table);
                                                    setIsSeatsModalOpen(true);
                                                }}
                                                className="px-2.5 py-1.5 rounded-xl border border-mauve-200 dark:border-zinc-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1 transition-colors"
                                            >
                                                <i className="ri-chair-line text-primary" />
                                                Seats ({table.seats?.length || 0})
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setCombinationTable(table);
                                                    setIsCombinationModalOpen(true);
                                                }}
                                                className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${table.combined_table_ids?.length > 0
                                                    ? 'bg-primary/5 border-primary/30 text-primary dark:bg-primary/10'
                                                    : 'border-mauve-200 dark:border-zinc-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 text-zinc-700 dark:text-zinc-300'
                                                    }`}
                                            >
                                                <i className="ri-link" />
                                                Combine ({table.combined_table_ids?.length || 0})
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <FloorModal
                isOpen={isFloorModalOpen}
                onClose={() => setIsFloorModalOpen(false)}
                storeId={effectiveStoreId}
                floorToEdit={floorToEdit}
            />

            <TableModal
                isOpen={isTableModalOpen}
                onClose={() => setIsTableModalOpen(false)}
                storeId={effectiveStoreId}
                floors={floors}
                selectedFloorId={currentFloorId}
                tableToEdit={tableToEdit}
            />

            {seatsTable && (
                <SeatsModal
                    isOpen={isSeatsModalOpen}
                    onClose={() => {
                        setIsSeatsModalOpen(false);
                        setSeatsTable(null);
                    }}
                    table={seatsTable}
                    storeId={effectiveStoreId}
                />
            )}

            {combinationTable && (
                <TableCombinationModal
                    isOpen={isCombinationModalOpen}
                    onClose={() => {
                        setIsCombinationModalOpen(false);
                        setCombinationTable(null);
                    }}
                    table={combinationTable}
                    allTables={tables}
                    storeId={effectiveStoreId}
                />
            )}
        </Container>
    );
};
export default FloorTableManagement;

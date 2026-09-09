import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

export type FloorStatus = 'ACTIVE' | 'INACTIVE';
export type TableStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
export type TableShape = 'RECTANGLE' | 'ROUND' | 'SQUARE';
export type SeatStatus = 'ACTIVE' | 'INACTIVE';

export interface Seat {
    id: string;
    store_id: string;
    floor_id: string;
    table_id: string;
    seat_number: string;
    name?: string | null;
    status: SeatStatus;
    created_at?: string;
    updated_at?: string;
}

export interface TableDetail {
    id: string;
    store_id: string;
    floor_id: string;
    table_number: string;
    name?: string | null;
    capacity: number;
    min_capacity: number;
    shape: TableShape;
    position_x: number;
    position_y: number;
    description?: string | null;
    status: TableStatus;
    display_order: number;
    floor_name?: string | null;
    seats: Seat[];
    combined_table_ids: string[];
    created_at?: string;
    updated_at?: string;
}

export interface Floor {
    id: string;
    store_id: string;
    name: string;
    floor_number: number;
    description?: string | null;
    display_order: number;
    status: FloorStatus;
    tables_count: number;
    total_capacity: number;
    tables: TableDetail[];
    created_at?: string;
    updated_at?: string;
}

export interface FloorCreateInput {
    name: string;
    floor_number?: number;
    description?: string | null;
    display_order?: number;
    status?: FloorStatus;
}

export interface FloorUpdateInput {
    name?: string;
    floor_number?: number;
    description?: string | null;
    display_order?: number;
    status?: FloorStatus;
}

export interface TableCreateInput {
    floor_id: string;
    table_number: string;
    name?: string | null;
    capacity: number;
    min_capacity?: number;
    shape?: TableShape;
    position_x?: number;
    position_y?: number;
    description?: string | null;
    status?: TableStatus;
    display_order?: number;
    generate_seats?: boolean;
}

export interface TableUpdateInput {
    floor_id?: string;
    table_number?: string;
    name?: string | null;
    capacity?: number;
    min_capacity?: number;
    shape?: TableShape;
    position_x?: number;
    position_y?: number;
    description?: string | null;
    status?: TableStatus;
    display_order?: number;
}

export interface SeatCreateInput {
    seat_number: string;
    name?: string | null;
    status?: SeatStatus;
}

export interface SeatUpdateInput {
    seat_number?: string;
    name?: string | null;
    status?: SeatStatus;
}

export const useStoreFloors = (storeId?: string, includeInactive = false) => {
    return useQuery({
        queryKey: ['floors', storeId, includeInactive],
        queryFn: async () => {
            if (!storeId) return [];
            const { data } = await api.get<Floor[]>(`/table-management/stores/${storeId}/floors`, {
                params: { include_inactive: includeInactive },
            });
            return data;
        },
        enabled: !!storeId,
    });
};

export const useStoreTables = (storeId?: string) => {
    return useQuery({
        queryKey: ['tables', storeId],
        queryFn: async () => {
            if (!storeId) return [];
            const { data } = await api.get<TableDetail[]>(`/table-management/stores/${storeId}/tables`);
            return data;
        },
        enabled: !!storeId,
    });
};

export const useCreateFloor = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ storeId, data }: { storeId: string; data: FloorCreateInput }) => {
            const res = await api.post<Floor>(`/table-management/stores/${storeId}/floors`, data);
            return res.data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['floors', vars.storeId] });
        },
    });
};

export const useUpdateFloor = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ floorId, data }: { floorId: string; storeId: string; data: FloorUpdateInput }) => {
            const res = await api.put<Floor>(`/table-management/floors/${floorId}`, data);
            return res.data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['floors', vars.storeId] });
        },
    });
};

export const useDeleteFloor = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ floorId }: { floorId: string; storeId: string }) => {
            await api.delete(`/table-management/floors/${floorId}`);
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['floors', vars.storeId] });
            qc.invalidateQueries({ queryKey: ['tables', vars.storeId] });
        },
    });
};

export const useCreateTable = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ storeId, data }: { storeId: string; data: TableCreateInput }) => {
            const res = await api.post<TableDetail>(`/table-management/stores/${storeId}/tables`, data);
            return res.data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['tables', vars.storeId] });
            qc.invalidateQueries({ queryKey: ['floors', vars.storeId] });
        },
    });
};

export const useUpdateTable = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ tableId, data }: { tableId: string; storeId: string; data: TableUpdateInput }) => {
            const res = await api.put<TableDetail>(`/table-management/tables/${tableId}`, data);
            return res.data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['tables', vars.storeId] });
            qc.invalidateQueries({ queryKey: ['floors', vars.storeId] });
        },
    });
};

export const useDeleteTable = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ tableId }: { tableId: string; storeId: string }) => {
            await api.delete(`/table-management/tables/${tableId}`);
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['tables', vars.storeId] });
            qc.invalidateQueries({ queryKey: ['floors', vars.storeId] });
        },
    });
};

export const useCreateSeat = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ tableId, data }: { tableId: string; storeId: string; data: SeatCreateInput }) => {
            const res = await api.post<Seat>(`/table-management/tables/${tableId}/seats`, data);
            return res.data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['tables', vars.storeId] });
            qc.invalidateQueries({ queryKey: ['floors', vars.storeId] });
        },
    });
};

export const useUpdateSeat = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ seatId, data }: { seatId: string; storeId: string; data: SeatUpdateInput }) => {
            const res = await api.put<Seat>(`/table-management/seats/${seatId}`, data);
            return res.data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['tables', vars.storeId] });
            qc.invalidateQueries({ queryKey: ['floors', vars.storeId] });
        },
    });
};

export const useDeleteSeat = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ seatId }: { seatId: string; storeId: string }) => {
            await api.delete(`/table-management/seats/${seatId}`);
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['tables', vars.storeId] });
            qc.invalidateQueries({ queryKey: ['floors', vars.storeId] });
        },
    });
};

export const useBatchUpdateCombinations = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            storeId,
            tableId,
            combinedTableIds,
        }: {
            storeId: string;
            tableId: string;
            combinedTableIds: string[];
        }) => {
            await api.put(`/table-management/stores/${storeId}/table-combinations/batch`, {
                table_id: tableId,
                combined_table_ids: combinedTableIds,
            });
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['tables', vars.storeId] });
            qc.invalidateQueries({ queryKey: ['floors', vars.storeId] });
        },
    });
};

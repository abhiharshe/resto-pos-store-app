import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../utils/api';

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export type DayOfWeek = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface ReservationSettings {
    id: string;
    store_id: string;
    reservation_enabled: boolean;
    slot_duration_minutes: number;
    min_advance_hours: number;
    max_advance_days: number;
    allow_auto_assignment: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ReservationWeeklySlot {
    id: string;
    weekly_plan_id: string;
    day_of_week: DayOfWeek;
    start_time: string;
    end_time: string;
    is_enabled: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface ReservationWeeklyPlan {
    id: string;
    store_id: string;
    name: string;
    is_active: boolean;
    slots: ReservationWeeklySlot[];
    created_at?: string;
    updated_at?: string;
}

export interface ReservationTableAssigned {
    id: string;
    reservation_id: string;
    store_id: string;
    floor_id: string;
    table_id: string;
    table_number?: string;
    table_name?: string;
    capacity?: number;
    floor_name?: string;
}

export interface Reservation {
    id: string;
    reservation_number?: string;
    store_id: string;
    customer_id?: string;
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    reservation_date: string;
    start_time: string;
    end_time: string;
    guest_count: number;
    status: ReservationStatus;
    special_requests?: string;
    cancelled_at?: string;
    cancellation_reason?: string;
    created_at?: string;
    updated_at?: string;
    tables: ReservationTableAssigned[];
    total_capacity: number;
}

export interface TableOption {
    id: string;
    table_number: string;
    name?: string | null;
    capacity: number;
    floor_id: string;
    floor_name?: string | null;
}

export interface CombinationOption {
    tables: TableOption[];
    total_capacity: number;
    tables_count: number;
    floor_names: string[];
    score: number;
}

export interface SlotAvailability {
    start_time: string;
    end_time: string;
    is_enabled: boolean;
    is_available: boolean;
    options_count: number;
    best_option?: CombinationOption | null;
}

export interface AvailabilityResponse {
    store_id: string;
    reservation_date: string;
    guest_count: number;
    day_of_week: DayOfWeek;
    reservation_enabled: boolean;
    slots: SlotAvailability[];
    selected_slot_options: CombinationOption[];
}

export interface ReservationCreateInput {
    customer_name: string;
    customer_phone: string;
    customer_email?: string;
    reservation_date: string;
    start_time: string;
    end_time: string;
    guest_count: number;
    special_requests?: string;
    customer_id?: string;
    table_ids?: string[];
}

export interface ReservationStatusUpdateInput {
    status: ReservationStatus;
    cancellation_reason?: string;
}

export const useReservationSettings = (storeId?: string) => {
    return useQuery({
        queryKey: ['reservationSettings', storeId],
        queryFn: async () => {
            if (!storeId) return null;
            const { data } = await api.get<ReservationSettings>(`/table-management/stores/${storeId}/reservation-settings`);
            return data;
        },
        enabled: !!storeId,
    });
};

export const useUpdateReservationSettings = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ storeId, data }: { storeId: string; data: Partial<ReservationSettings> }) => {
            const res = await api.put<ReservationSettings>(`/table-management/stores/${storeId}/reservation-settings`, data);
            return res.data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['reservationSettings', vars.storeId] });
        },
    });
};

export const useWeeklyPlan = (storeId?: string) => {
    return useQuery({
        queryKey: ['weeklyPlan', storeId],
        queryFn: async () => {
            if (!storeId) return null;
            const { data } = await api.get<ReservationWeeklyPlan>(`/table-management/stores/${storeId}/weekly-plan`);
            return data;
        },
        enabled: !!storeId,
    });
};

export const useBatchUpdateWeeklySlots = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            storeId,
            slots,
        }: {
            storeId: string;
            slots: Array<{ day_of_week: DayOfWeek; start_time: string; end_time: string; is_enabled: boolean }>;
        }) => {
            const res = await api.put<ReservationWeeklyPlan>(`/table-management/stores/${storeId}/weekly-plan/slots`, { slots });
            return res.data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['weeklyPlan', vars.storeId] });
        },
    });
};

export const useCheckAvailability = (storeId?: string, date?: string, guestCount?: number, timeSlot?: string) => {
    return useQuery({
        queryKey: ['reservationAvailability', storeId, date, guestCount, timeSlot],
        queryFn: async () => {
            if (!storeId || !date || !guestCount) return null;
            const { data } = await api.get<AvailabilityResponse>(`/table-management/stores/${storeId}/reservations/availability`, {
                params: {
                    reservation_date: date,
                    guest_count: guestCount,
                    time_slot: timeSlot || undefined,
                },
            });
            return data;
        },
        enabled: !!storeId && !!date && !!guestCount && guestCount > 0,
    });
};

export const useStoreReservations = (
    storeId?: string,
    filters?: {
        date?: string;
        status?: ReservationStatus;
        floorId?: string;
        search?: string;
    }
) => {
    return useQuery({
        queryKey: ['reservations', storeId, filters],
        queryFn: async () => {
            if (!storeId) return [];
            const { data } = await api.get<Reservation[]>(`/table-management/stores/${storeId}/reservations`, {
                params: {
                    reservation_date: filters?.date || undefined,
                    status: filters?.status || undefined,
                    floor_id: filters?.floorId || undefined,
                    search: filters?.search || undefined,
                },
            });
            return data;
        },
        enabled: !!storeId,
    });
};

export const useCreateReservation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ storeId, data }: { storeId: string; data: ReservationCreateInput }) => {
            const res = await api.post<Reservation>(`/table-management/stores/${storeId}/reservations`, data);
            return res.data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['reservations', vars.storeId] });
            qc.invalidateQueries({ queryKey: ['reservationAvailability'] });
        },
    });
};

export const useUpdateReservationStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            reservationId,
            data,
        }: {
            reservationId: string;
            storeId: string;
            data: ReservationStatusUpdateInput;
        }) => {
            const res = await api.put<Reservation>(`/table-management/reservations/${reservationId}/status`, data);
            return res.data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['reservations', vars.storeId] });
            qc.invalidateQueries({ queryKey: ['reservationAvailability'] });
        },
    });
};

export const useCancelReservation = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({
            reservationId,
            reason,
        }: {
            reservationId: string;
            storeId: string;
            reason?: string;
        }) => {
            const res = await api.post<Reservation>(`/table-management/reservations/${reservationId}/cancel`, null, {
                params: { reason },
            });
            return res.data;
        },
        onSuccess: (_, vars) => {
            qc.invalidateQueries({ queryKey: ['reservations', vars.storeId] });
            qc.invalidateQueries({ queryKey: ['reservationAvailability'] });
        },
    });
};

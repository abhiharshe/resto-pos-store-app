import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useOrders, Order } from '../../orders/api/ordersApi';
import { useStores } from '../../stores/api/storesApi';
import { KdsCard } from '../components/KdsCard';
import { Select } from '../../../components/common/Select';
import { Skeleton } from '../../../components/common/Skeleton';
import { useQueryClient } from '@tanstack/react-query';
import { KdsSidebar } from '../components/KdsSidebar';
import IconButton from '../../../components/common/IconButton';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { toggleTheme } from '../../ui/slices/uiSlice';

const KdsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { theme } = useAppSelector((state) => state.ui);
    const { user } = useAppSelector((state) => state.auth);
    const queryClient = useQueryClient();
    const { data: stores, isLoading: storesLoading } = useStores();
    const [selectedStoreId, setSelectedStoreId] = useState<string>('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isFullScreen, setIsFullScreen] = useState<boolean>(!!document.fullscreenElement);

    // Initial store selection
    useEffect(() => {
        if (user?.store_id) {
            setSelectedStoreId(user.store_id);
        } else if (stores && stores.length > 0 && !selectedStoreId) {
            setSelectedStoreId(stores[0].id);
        }
    }, [stores, selectedStoreId, user]);

    // Fetch active orders (those not completed or cancelled)
    const { data: orders, isLoading: ordersLoading } = useOrders({
        store_id: selectedStoreId || undefined,
    });

    // Real-time updates via WebSocket
    useEffect(() => {
        if (!selectedStoreId) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
        const wsUrl = `${protocol}//${host}/api/v1/ws/kitchen/${selectedStoreId}`;

        const ws = new WebSocket(wsUrl);

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (['new_order', 'order_updated', 'order_item_updated'].includes(data.type)) {
                queryClient.invalidateQueries({ queryKey: ['orders'] });
            }
        };

        return () => ws.close();
    }, [selectedStoreId, queryClient]);

    // Filter orders to show only those being prepared (not completed/cancelled)
    const kdsOrders = useMemo(() => {
        if (!orders) return [];
        return orders.filter(order =>
            !['COMPLETED', 'CANCELLED', 'DRAFT', 'OUT_FOR_DELIVERY'].includes(order.status)
        ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }, [orders]);

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
    };

    const handleLogout = () => {
        navigate('/auth/sign-in');
    }

    const enterFullscreen = useCallback(() => {
        const el = document.documentElement; // or use a specific element (e.g., ref.current)
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
            (el as any).webkitRequestFullscreen();
        } else if ((el as any).msRequestFullscreen) {
            (el as any).msRequestFullscreen();
        }
        setIsFullScreen(true);
    }, []);

    // Exit fullscreen
    const exitFullscreen = useCallback(() => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
        }
        setIsFullScreen(false);
    }, []);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        if (document.fullscreenElement) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    }, [enterFullscreen, exitFullscreen]);

    // Sync fullscreen state if user presses ESC
    useEffect(() => {
        const handleChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleChange);
        };
    }, []);

    if (storesLoading) {
        return <div className="p-8"><Skeleton className="h-10 w-48 mb-6" /></div>;
    }

    return (
        <div className="h-full flex flex-col bg-zinc-50 dark:bg-black">
            {/* Header / Toolbar */}
            <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-4 sticky top-0 z-10">
                <div className="mx-auto flex flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                            <i className="ri-restaurant-2-line text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white leading-tight">KDS</h1>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{kdsOrders.length} active orders</p>
                        </div>
                        <div className="flex items-center gap-2 min-w-[200px]">
                            {user?.role === 'SUPER_ADMIN' ? (
                                <Select
                                    options={stores?.map(s => ({ label: s.name, value: s.id })) || []}
                                    value={selectedStoreId}
                                    onChange={(val) => setSelectedStoreId(String(val))}
                                />
                            ) : (
                                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                                    <i className="ri-store-2-line text-emerald-500" />
                                    <span>{user?.store?.name || stores?.find(s => s.id === selectedStoreId)?.name || 'Allocated Store'}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className='flex gap-2'>
                        <IconButton
                            variant="outline"
                            icon={theme === 'light' ? "ri-moon-line text-xl" : "ri-sun-line text-xl"}
                            size='sm'
                            onClick={() => dispatch(toggleTheme())}
                            aria-label="Toggle Theme"
                            title="Toggle Theme"
                        />
                        <IconButton
                            variant='outline'
                            onClick={toggleFullscreen}
                            icon={isFullScreen ? "ri-fullscreen-exit-line text-xl" : "ri-fullscreen-line text-xl"}
                            size='sm'
                            title="Toggle Fullscreen"
                            aria-label="Toggle Fullscreen"
                        />
                        <IconButton
                            variant="danger"
                            icon={"ri-logout-box-line text-xl"}
                            size='sm'
                            onClick={handleLogout}
                            aria-label="Logout"
                            title="Logout"
                        />
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="flex-grow p-4 md:p-6 overflow-y-auto">
                <div className="mx-auto">
                    {ordersLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-64 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                                    <Skeleton className="h-6 w-1/2 mb-4" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-4 w-full mb-2" />
                                    <Skeleton className="h-10 w-full mt-auto" />
                                </div>
                            ))}
                        </div>
                    ) : kdsOrders.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {kdsOrders.map(order => (
                                <KdsCard
                                    key={order.id}
                                    order={order}
                                    onViewDetails={handleViewDetails}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="h-[60vh] flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 text-zinc-400">
                                <i className="ri-inbox-line text-4xl"></i>
                            </div>
                            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">Kitchen is clear!</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                                All orders have been prepared. New orders will appear here automatically in real-time.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Sidebar */}
            {selectedOrder && (
                <KdsSidebar
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                />
            )}
        </div>
    );
};

export default KdsPage;

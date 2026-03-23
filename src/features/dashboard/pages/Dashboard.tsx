import React from 'react';
import { useStoreStats } from '../api/dashboardApi';
import Card from '../../../components/common/Card';
import { useStores } from '../../stores/api/storesApi';

const Dashboard = () => {
    const { data: stores } = useStores();
    const primaryStore = stores?.[0]; // Default to first store for MVP

    const { data: stats, isLoading } = useStoreStats(primaryStore?.id);

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">Dashboard</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">
                        {primaryStore ? `Real-time stats for ${primaryStore.name}` : 'Overview of your business performance.'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                            <i className="ri-money-dollar-circle-line text-indigo-600 dark:text-indigo-400 text-xl" />
                        </div>
                        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Revenue</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                            {isLoading ? '...' : `${primaryStore?.currency || '$'}${stats?.total_revenue?.toFixed(2) || '0.00'}`}
                        </p>
                        <span className="text-xs text-green-500 font-medium font-sans">Today</span>
                    </div>
                </Card>

                <Card className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <i className="ri-shopping-cart-2-line text-green-600 dark:text-green-400 text-xl" />
                        </div>
                        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Orders</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                            {isLoading ? '...' : (stats?.total_orders || 0)}
                        </p>
                        <span className="text-xs text-green-500 font-medium font-sans">Today</span>
                    </div>
                </Card>

                <Card className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <i className="ri-timer-line text-yellow-600 dark:text-yellow-400 text-xl" />
                        </div>
                        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Pending Orders</h3>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                            {isLoading ? '...' : (stats?.pending_orders || 0)}
                        </p>
                        <span className="text-xs text-yellow-600 font-medium font-sans">In Progress</span>
                    </div>
                </Card>
            </div>

            {/* More sections like Recent Orders or Quick Actions could go here */}
        </div>
    );
};

export default Dashboard;

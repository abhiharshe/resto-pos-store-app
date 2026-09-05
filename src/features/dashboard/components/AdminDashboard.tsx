import { useState } from 'react';
import Card from '../../../components/common/Card';
import { Dropdown } from '../../../components/common/Dropdown';
import { useStores } from '../../stores/api/storesApi';
import { useAppSelector } from '../../../app/hooks';
import Datepicker from "react-tailwindcss-datepicker";
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/common/Button';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { globalSettings } = useAppSelector((state) => state.settings);
    const currency = globalSettings?.currency || '₹';
    const { data: stores } = useStores();
    const [dateValue, setDateValue] = useState({
        startDate: null,
        endDate: null
    });
    const [selectedStore, setSelectedStore] = useState<string | number>('all');
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const storeOptions = [
        { label: 'All Stores', value: 'all' },
        ...(stores?.map(s => ({ label: s.name, value: s.id })) || [])
    ];

    const refetch = () => {

    }

    const handleRefresh = () => {
        refetch();
    }

    const handleOpenNewOrder = () => {
        navigate('/pos');
    }

    const handleShowFilters = () => {
        setIsFilterVisible((prev) => !prev);
    }

    return (
        <div className="space-y-6">
            <div className='flex flex-row items-center justify-between'>
                <div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-white">Dashboard Analytics</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Monitoring all {stores?.length || 0} active locations.</p>
                </div>

                <div className='flex flex-row items-center gap-2'>
                    <Button variant={isFilterVisible ? 'secondary' : 'outline'}
                        icon="ri-filter-3-line" onClick={handleShowFilters}>
                        <span>{isFilterVisible ? 'Hide Filters' : 'Filters'}</span>
                    </Button>
                    <Button variant="outline" icon='ri-refresh-line' onClick={handleRefresh} title="Refresh the Dashboard" aria-describedby="Refresh the Dashboard">
                        <span>Refresh</span>
                    </Button>
                    <Button variant="primary" icon='ri-add-line' onClick={handleOpenNewOrder} title="Open New Order" aria-describedby="Open New Order">
                        <span>New Order?</span>
                    </Button>
                </div>
            </div>

            {isFilterVisible && (
                <div className="p-4 flex flex-wrap items-center gap-4 bg-gray-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-600 animate-in slide-in-from-top-2 duration-200">
                    <div className="w-56">
                        <Dropdown
                            label="Store Filter"
                            options={storeOptions}
                            value={selectedStore}
                            onChange={(val) => setSelectedStore(val)}
                        />
                    </div>
                    <div className="w-72">
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">Date Range</label>
                        <Datepicker
                            value={dateValue}
                            onChange={(newValue: any) => setDateValue(newValue)}
                            showShortcuts={true}
                            primaryColor={"indigo"}
                            toggleClassName="absolute top-0 right-0 h-full px-3 text-zinc-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                            containerClassName="relative w-full text-zinc-700 dark:text-zinc-200"
                            inputClassName="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2.5 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard
                    label="Global Revenue"
                    value={`${currency}1,42,850.00`}
                    trend="+12.5%"
                    icon="ri-money-dollar-circle-fill"
                    color="indigo"
                />
                <StatCard
                    label="Total Orders"
                    value="842"
                    trend="+5.2%"
                    icon="ri-shopping-basket-fill"
                    color="blue"
                />
                <StatCard
                    label="Average Ticket"
                    value={`${currency}169.60`}
                    trend="-2.1%"
                    icon="ri-coupon-3-fill"
                    color="amber"
                />
                <StatCard
                    label="Active Tables"
                    value="24 / 45"
                    trend="+8.3%"
                    icon="ri-restaurant-line"
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Revenue Performance Overview</h4>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {[45, 62, 58, 75, 90, 82, 95].map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                                <div
                                    className="w-full bg-indigo-500/20 group-hover:bg-indigo-500 rounded-t-lg transition-all duration-300 relative"
                                    style={{ height: `${val}%` }}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                        {currency}{val * 100}
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-zinc-400 uppercase">Day {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Top Stores</h4>
                    <div className="space-y-4">
                        {[
                            { name: 'Downtown Branch', rev: '42k', color: 'indigo' },
                            { name: 'Westside Mall', rev: '38k', color: 'blue' },
                            { name: 'The Airport Express', rev: '31k', color: 'amber' },
                        ].map((store, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg bg-${store.color}-100 dark:bg-${store.color}-900/30 flex items-center justify-center text-${store.color}-600 font-bold text-xs`}>
                                        #{i + 1}
                                    </div>
                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">{store.name}</span>
                                </div>
                                <span className="text-sm font-black text-zinc-900 dark:text-white">{currency}{store.rev}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, trend, icon, color }: any) => (
    <Card className="flex flex-col relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/10 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500`} />
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center text-${color}-600 dark:text-${color}-400`}>
                <i className={`${icon} text-xl`} />
            </div>
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</h4>
        </div>
        <div className="flex items-baseline justify-between mt-auto">
            <p className="text-2xl font-black text-zinc-900 dark:text-white leading-none">{value}</p>
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {trend}
            </span>
        </div>
    </Card>
);

export default AdminDashboard;

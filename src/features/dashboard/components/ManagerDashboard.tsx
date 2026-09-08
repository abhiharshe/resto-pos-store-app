import Card from '../../../components/common/Card';
import { useAppSelector } from '../../../app/hooks';
import { formatCurrencySymbol } from '../../../utils/currency';

const ManagerDashboard = () => {
    const { user } = useAppSelector((state) => state.auth);
    const { globalSettings } = useAppSelector((state) => state.settings);
    const currency = formatCurrencySymbol(globalSettings?.currency);
    const storeName = user?.store?.name || 'Your Store';

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 rounded-3xl text-white shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Welcome Back, {user?.name || 'Manager'}!</h2>
                        <p className="text-indigo-100 font-medium opacity-90 italic">Managing {storeName} • Performance is looking great today!</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatBox
                    label="Today's Revenue"
                    value={`${currency}28,450.00`}
                    subtext="vs last week: +8%"
                    icon="ri-funds-box-line"
                    color="white"
                />
                <StatBox
                    label="Active Orders"
                    value="12"
                    subtext="5 pending in kitchen"
                    icon="ri-moped-line"
                    color="white"
                />
                <StatBox
                    label="Customer Satisfaction"
                    value="4.8/5"
                    subtext="Based on 42 reviews"
                    icon="ri-heart-3-line"
                    color="white"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-6">Recent Store Activity</h4>
                    <div className="space-y-4">
                        {[
                            { action: 'Order Placed', time: '2 mins ago', info: 'Table #4 - 3 items', icon: 'ri-add-circle-line', color: 'green' },
                            { action: 'Order Completed', time: '15 mins ago', info: 'Order #842 - Delivered', icon: 'ri-checkbox-circle-line', color: 'blue' },
                            { action: 'Inventory Alert', time: '1 hour ago', info: 'Chicken Patty stock low (5 left)', icon: 'ri-error-warning-line', color: 'amber' },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                <div className={`w-10 h-10 rounded-xl bg-${activity.color}-100 dark:bg-${activity.color}-900/30 flex items-center justify-center text-${activity.color}-600`}>
                                    <i className={`${activity.icon} text-lg`} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{activity.action}</p>
                                        <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-tighter">{activity.time}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500 font-medium font-sans">{activity.info}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-6">Hourly Traffic Today</h4>
                    <div className="h-64 flex items-end justify-between gap-1 px-2">
                        {[30, 45, 60, 85, 95, 75, 40, 20, 15, 10, 5, 2].map((val, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className="w-full bg-gradient-to-t from-indigo-500 to-blue-400 rounded-t-lg transition-all duration-500 hover:brightness-110 shadow-sm"
                                    style={{ height: `${val}%` }}
                                ></div>
                                <span className="text-[8px] font-semibold text-zinc-400 uppercase">{i + 8}h</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, subtext, icon }: any) => (
    <Card className={`bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm group hover:scale-[1.02] transition-transform duration-300`}>
        <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-zinc-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-zinc-700">
                <i className={`${icon} text-2xl`} />
            </div>
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">Real-Time</span>
        </div>
        <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-black text-zinc-900 dark:text-white mb-2">{value}</p>
            <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-500 uppercase">{subtext}</p>
            </div>
        </div>
    </Card>
);

export default ManagerDashboard;

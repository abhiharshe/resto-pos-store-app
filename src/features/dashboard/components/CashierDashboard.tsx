import { useNavigate } from 'react-router-dom';
import Card from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { useAppSelector } from '../../../app/hooks';

const CashierDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const storeName = user?.store?.name || 'Assigned Store';

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-800 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-700 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32" />
                <div className="relative z-10 space-y-2">
                    <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Welcome, {user?.name || 'Cashier'}!</h2>
                    <p className="text-zinc-500 font-medium">Ready to serve customers at <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{storeName}</span>?</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-10 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/10 dark:to-blue-900/10 border-indigo-100 dark:border-indigo-900/30">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 mb-2">
                            <i className="ri-shopping-cart-2-line text-4xl" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">Open POS Terminal</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">Click below to enter the Point of Sale screen and start taking new orders for {storeName}.</p>
                        </div>
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={() => navigate('/pos')}
                            className="px-12 py-6 rounded-2xl text-lg font-black shadow-xl shadow-indigo-600/30 hover:scale-105 transition-transform"
                        >
                            LAUNCH POS NOW <i className="ri-arrow-right-line ml-2" />
                        </Button>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="flex items-center gap-4 p-6 group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer" onClick={() => navigate('/orders')}>
                            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                                <i className="ri-file-list-3-line text-2xl" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-tight">Today's Orders</h4>
                                <p className="text-xs text-zinc-500">View and manage orders</p>
                            </div>
                        </Card>
                        <Card className="flex items-center gap-4 p-6 group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer" onClick={() => navigate('/customers')}>
                            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 group-hover:bg-green-100 group-hover:text-green-600 transition-colors">
                                <i className="ri-group-line text-2xl" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold text-zinc-900 dark:text-white uppercase tracking-tight">Customers</h4>
                                <p className="text-xs text-zinc-500">View shopper history</p>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card>
                        <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-6">Daily Summary</h4>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-500">Total Shift Orders</span>
                                <span className="text-lg font-black text-zinc-900 dark:text-white">42</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-zinc-500">Active Sessions</span>
                                <span className="text-lg font-black text-green-600">Active</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 w-3/4 rounded-full" />
                            </div>
                            <p className="text-[10px] text-zinc-400 font-semibold uppercase text-center italic">75% of daily target reached</p>
                        </div>
                    </Card>

                    <Card className="bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-200 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-400">
                                <i className="ri-notification-3-line text-xl" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100 uppercase tracking-tight">Kitchen Alert</h4>
                                <p className="text-xs text-amber-700 dark:text-amber-400 opacity-90">KDS is reporting high volume. Expect delays on Burger orders.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CashierDashboard;

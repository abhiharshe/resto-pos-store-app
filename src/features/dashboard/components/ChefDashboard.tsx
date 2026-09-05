import { useNavigate } from 'react-router-dom';
import Card from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { useAppSelector } from '../../../app/hooks';

const ChefDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector((state) => state.auth);
    const storeName = user?.store?.name || 'Assigned Store';

    return (
        <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black uppercase tracking-tight">Bonjour, Chef {user?.name?.split(' ')[0] || 'Chef'}!</h2>
                        <p className="text-amber-500 font-bold tracking-widest uppercase text-xs">Head Chef at {storeName}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-10 flex flex-col items-center justify-center text-center space-y-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-100 dark:border-amber-900/30">
                        <div className="w-20 h-20 rounded-3xl bg-amber-600 flex items-center justify-center text-white shadow-xl shadow-amber-500/20 mb-2">
                            <i className="ri-restaurant-2-line text-4xl" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tight text-center">Open Kitchen Display (KDS)</h3>
                            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto text-center">Manage live orders, monitor prep times, and mark orders as ready for service.</p>
                        </div>
                        <Button 
                            variant="primary" 
                            size="lg" 
                            onClick={() => navigate('/kds')} 
                            className="bg-amber-600 hover:bg-amber-700 text-white border-none px-12 py-6 rounded-2xl text-lg font-black shadow-xl shadow-amber-600/30 hover:scale-105 transition-transform"
                        >
                            GO TO KDS <i className="ri-arrow-right-line ml-2" />
                        </Button>
                    </Card>

                    <Card>
                        <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-6">Active Kitchen Load</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { count: 8, label: 'Pending', color: 'red' },
                                { count: 12, label: 'In Prep', color: 'amber' },
                                { count: 34, label: 'Ready for Pickup', color: 'green' },
                                { count: 142, label: 'Today Total', color: 'zinc' },
                            ].map((stat, i) => (
                                <div key={i} className="flex flex-col items-center text-center">
                                    <span className={`text-4xl font-black text-${stat.color}-600 dark:text-${stat.color}-400 mb-1`}>{stat.count}</span>
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="flex flex-col items-center text-center p-8 space-y-4">
                        <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 font-bold text-2xl uppercase border border-indigo-200 dark:border-indigo-800">
                            {user?.name?.[0]}
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-base font-black text-zinc-900 dark:text-white uppercase">{user?.name}</h4>
                            <p className="text-xs text-zinc-500 font-medium">Head Chef</p>
                        </div>
                        <div className="w-full border-t border-zinc-100 dark:border-zinc-800 my-2 pt-4">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full rounded-xl flex items-center justify-center gap-2"
                                onClick={() => navigate('/profile')}
                            >
                                <i className="ri-user-settings-line" /> UPDATE PROFILE
                            </Button>
                        </div>
                    </Card>

                    <Card className="bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-red-200 dark:bg-red-900/50 flex items-center justify-center text-red-700 dark:text-red-400">
                                <i className="ri-error-warning-line text-xl" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-red-900 dark:text-red-100 uppercase tracking-tight">Stock Alert</h4>
                                <p className="text-xs text-red-700 dark:text-red-400 opacity-90">Store Admin is reporting low stock for Bacon strips. Order pending.</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ChefDashboard;

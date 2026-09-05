import React, { useState, useEffect } from 'react';

interface Props {
    children: React.ReactNode;
}

const InternetConnectionChecker: React.FC<Props> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) {
        return <>{children}</>;
    }

    return (
        <div className="fixed inset-0 z-9999 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-500/30 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-rose-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                {/* Icon Container */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl animate-pulse"></div>
                    <div className="relative flex items-center justify-center w-full h-full bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-indigo-500/10">
                        <i className="ri-wifi-off-line text-5xl text-indigo-500"></i>
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight">
                        No Connection
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                        It seems you've lost internet connectivity. Please check your network settings or router and try again.
                    </p>
                </div>

                {/* Status List */}
                <div className="bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-zinc-100 dark:border-zinc-800 p-6 text-left space-y-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                            <i className="ri-checkbox-circle-line"></i>
                        </div>
                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Browser is running</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                            <i className="ri-close-circle-line"></i>
                        </div>
                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Server communication lost</span>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={() => window.location.reload()}
                    className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group"
                >
                    <i className="ri-refresh-line group-hover:rotate-180 transition-transform duration-500"></i>
                    Refresh Page
                </button>
                
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">
                    Auto-reconnect enabled
                </p>
            </div>
        </div>
    );
};

export default InternetConnectionChecker;

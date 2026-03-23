import React from "react";
import { motion } from "motion/react";
import { useStores, StoreResponse } from "../api/posApi";
import { useAppDispatch } from "../../../app/hooks";
import { setSelectedStore } from "../slices/cartSlice";

interface StoreSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const StoreSelectionModal: React.FC<StoreSelectionModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const { data: stores, isLoading } = useStores();

    if (!isOpen) return null;

    const handleSelect = (store: StoreResponse) => {
        dispatch(setSelectedStore({ id: store.id, name: store.name }));
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-zinc-800"
            >
                <div className="p-4 flex flex-row items-center gap-2 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center">
                        <i className="ri-store-2-line text-3xl text-indigo-600 dark:text-indigo-400"></i>
                    </div>
                    <div className="flex flex-col items-start justify-center gap">
                        <h2 className="text-2xl font-black dark:text-white tracking-tight ">Select Store</h2>
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">Please select a store to start placing orders</span>
                    </div>
                </div>

                <div className="p-4 pt-2 max-h-[60vh] overflow-y-auto space-y-3 custom-scrollbar">
                    {isLoading ? (
                        <div className="py-12 flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Loading active stores...</p>
                        </div>
                    ) : (
                        stores?.map((store) => (
                            <button
                                key={store.id}
                                onClick={() => handleSelect(store)}
                                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-white dark:hover:bg-zinc-800 border dark:border-zinc-700/50 hover:border-indigo-500 rounded-lg flex items-center justify-between transition-all group hover:shadow-xl hover:-translate-y-1"
                            >
                                <div className="text-left">
                                    <h3 className="font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{store.name}</h3>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[200px]">{store.address || 'Standard Location'}</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border dark:border-zinc-700 flex items-center justify-center group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all">
                                    <i className="ri-arrow-right-line text-zinc-400 group-hover:text-white transition-colors"></i>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </motion.div>
            <div className="absolute bottom-4">
                <p className="text-[10px] text-center font-bold text-zinc-400 uppercase tracking-widest">Powered by restopos POS</p>
            </div>
        </div>
    );
};

export default StoreSelectionModal;

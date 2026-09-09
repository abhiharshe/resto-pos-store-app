import { useState } from 'react'
import CustomerInfo from "../components/CustomerInfo";
import MenuItems from "../components/MenuItems";
import Checkout from "../components/Checkout";
import OrderCart from "../components/OrderCart";
import { AnimatePresence, motion } from 'motion/react';
import { PosHeader } from '../components/PosHeader';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { CartItem, setSelectedStore } from '../slices/cartSlice';
import StoreSelectionModal from '../components/StoreSelectionModal';
import { useEffect } from 'react';
import CustomerDetailsModal from '../components/CustomerDetailsModal';
import { useActivePromotions } from '../../promotions/api/promotionsApi';
import { setPromotions } from '../slices/cartSlice';


const Pos = () => {
    const [stage, setStage] = useState<1 | 2 | 3>(1);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null);
    const dispatch = useAppDispatch();

    const cartItems = useAppSelector((state) => state.cart.items);
    const selectedStoreId = useAppSelector((state) => state.cart.selectedStoreId);
    const user = useAppSelector((state) => state.auth.user);

    const cartCount = cartItems.reduce((acc: number, item: CartItem) => acc + item.quantity, 0);

    const { data: activePromotions } = useActivePromotions(selectedStoreId || undefined);

    useEffect(() => {
        if (activePromotions) {
            dispatch(setPromotions(activePromotions));
        }
    }, [activePromotions, dispatch]);

    useEffect(() => {
        // 1. If user has a fixed store_id, auto-select it and don't allow changes
        if (user?.store_id && selectedStoreId !== user.store_id) {
            dispatch(setSelectedStore({ id: user.store_id, name: user.store?.name || 'Allocated Store' }));
            setIsStoreModalOpen(false);
        }
        // 2. If no store selected and cart is empty, show modal (for unallocated users)
        else if (!selectedStoreId && cartItems.length === 0) {
            setIsStoreModalOpen(true);
        }
    }, [user, selectedStoreId, cartItems.length, dispatch]);

    const handleEditItem = (item: CartItem) => {
        setEditingCartItem(item);
        setStage(1);
        setIsCartOpen(false);
    };

    const renderLeftPanel = () => {
        switch (stage) {
            case 1:
                return (
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key="menu-items"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="h-full"
                        >
                            <MenuItems onNext={() => setStage(2)} onBack={() => setStage(1)} editingCartItem={editingCartItem} onEditComplete={() => setEditingCartItem(null)} />
                        </motion.div>
                    </AnimatePresence>
                );
            case 2:
                return (
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key="customer-info"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="h-full"
                        >
                            <CustomerInfo onNext={() => setStage(3)} onBack={() => setStage(1)} />
                        </motion.div>
                    </AnimatePresence>
                );
            case 3:
                return (
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key="checkout"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="h-full"
                        >
                            <Checkout onBack={() => setStage(2)} />
                        </motion.div>
                    </AnimatePresence>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full bg-neutral-50 dark:bg-mauve-900 relative">
            <StoreSelectionModal
                isOpen={isStoreModalOpen && !user?.store_id}
                onClose={() => setIsStoreModalOpen(false)}
            />
            <CustomerDetailsModal
                isOpen={isCustomerModalOpen}
                onClose={() => setIsCustomerModalOpen(false)}
            />
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <PosHeader
                    onStoreClick={() => !user?.store_id && setIsStoreModalOpen(true)}
                    onNewOrderClick={() => setIsCustomerModalOpen(true)}
                />
                <div className="flex-1 flex flex-col w-full h-full overflow-hidden">
                    {renderLeftPanel()}
                </div>
            </div>

            {/* Desktop Order Cart Sidebar */}
            <div className="hidden lg:block lg:w-80 xl:w-96 bg-neutral-50 dark:bg-neutral-800 p-2 border-l border-zinc-100 dark:border-zinc-700 h-full">
                <OrderCart
                    setIsCartOpen={setIsCartOpen}
                    onCustomerClick={() => setIsCustomerModalOpen(true)}
                    onEditItem={handleEditItem}
                />
            </div>

            {/* Mobile/Tablet Cart Toggle FAB */}
            <div className="lg:hidden fixed bottom-6 left-6 z-20">
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative bg-indigo-600 dark:bg-indigo-500 text-white w-12 h-12 rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition-all scale-110 active:scale-95"
                >
                    <i className="ri-shopping-cart-2-fill text-2xl"></i>
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 animate-bounce">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Mobile/Tablet Cart Drawer */}
            <AnimatePresence>
                {isCartOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                            className="lg:hidden fixed inset-0 bg-slate-400/30 dark:bg-slate-900/30 backdrop-blur-sm z-50"
                        />
                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed right-0 top-0 h-full w-[90%] sm:w-[450px] bg-neutral-50 dark:bg-neutral-800 z-60 shadow-2xl overflow-hidden flex flex-col border-l border-zinc-100 dark:border-zinc-700"
                        >

                            <div className="flex-1 overflow-hidden p-2">
                                <OrderCart
                                    setIsCartOpen={setIsCartOpen}
                                    onCustomerClick={() => setIsCustomerModalOpen(true)}
                                    onEditItem={handleEditItem}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Pos
import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

const KdsLayout = () => {
    return (
        <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-zinc-900 transition-colors">
            <AnimatePresence mode="wait" initial={false}>
                <motion.main className="flex-1 overflow-auto" key="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}>
                    <Outlet />
                </motion.main>
            </AnimatePresence>
        </div>
    );
};



export default KdsLayout;

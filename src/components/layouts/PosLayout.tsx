import { Outlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

const PosLayout = () => {
    return (
        <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-mauve-900 transition-colors">
            {/* Main Content */}
            <AnimatePresence mode="wait" initial={false}>
                <motion.main className="flex-1 overflow-auto" key="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: "easeInOut" }}>
                    {/* Page Content */}
                    <Outlet />
                </motion.main>
            </AnimatePresence>
        </div>
    );
};



export default PosLayout;

import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface FloatingActionButtonProps {
    to: string;
    icon?: string;
    label?: string;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
    to,
    icon = 'ri-add-line',
    label = 'Add New'
}) => {
    const navigate = useNavigate();

    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(to)}
            className="fixed bottom-6 right-6 z-40 sm:hidden w-10 h-10 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg shadow-2xl flex items-center justify-center border-4 border-white dark:border-zinc-800 ring-4 ring-indigo-500/10 active:bg-indigo-700 transition-colors"
            aria-label={label}
        >
            <i className={`${icon} text-2xl`} />
        </motion.button>
    );
};

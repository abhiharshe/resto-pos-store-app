import React from "react";
import { motion, AnimatePresence } from "motion/react";
import IconButton from "./IconButton";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    hideHeader?: boolean;
    className?: string;
}

const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full m-4"
};

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    children,
    title,
    size = 'md',
    hideHeader = false,
    className = ""
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-400/30 dark:bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`relative w-full ${sizeClasses[size]} bg-white dark:bg-mauve-900 rounded-3xl shadow-2xl overflow-hidden border border-zinc-100 dark:border-mauve-800 ${className}`}
                    >
                        {!hideHeader && (
                            <div className="px-6 py-4 border-b border-zinc-100 dark:border-mauve-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-800/50">
                                <h3 className="text-xl font-black text-neutral-900 dark:text-white leading-tight">
                                    {title}
                                </h3>
                                <IconButton
                                    icon="ri-close-line"
                                    variant="ghost"
                                    onClick={onClose}
                                    className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                />
                            </div>
                        )}
                        <div className="relative">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Modal;

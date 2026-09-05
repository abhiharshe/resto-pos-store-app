import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './Button';
import IconButton from './IconButton';

export type ConfirmDialogVariant = 'info' | 'success' | 'warning' | 'danger';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: ConfirmDialogVariant;
    isLoading?: boolean;
}

const variantStyles: Record<ConfirmDialogVariant, {
    icon: string;
    iconBg: string;
    iconColor: string;
    confirmButtonVariant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    accentColor: string;
}> = {
    info: {
        icon: 'ri-information-line',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        confirmButtonVariant: 'primary',
        accentColor: 'border-blue-500'
    },
    success: {
        icon: 'ri-checkbox-circle-line',
        iconBg: 'bg-green-50 dark:bg-green-900/20',
        iconColor: 'text-green-600 dark:text-green-400',
        confirmButtonVariant: 'primary',
        accentColor: 'border-green-500'
    },
    warning: {
        icon: 'ri-error-warning-line',
        iconBg: 'bg-amber-50 dark:bg-amber-900/20',
        iconColor: 'text-amber-600 dark:text-amber-400',
        confirmButtonVariant: 'primary',
        accentColor: 'border-amber-500'
    },
    danger: {
        icon: 'ri-error-warning-fill',
        iconBg: 'bg-red-50 dark:bg-red-900/20',
        iconColor: 'text-red-500 dark:text-red-400',
        confirmButtonVariant: 'primary', // Note: Button.tsx doesn't have a 'danger' variant yet, but I can pass className
        accentColor: 'border-red-500'
    }
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Apply',
    cancelText = 'Cancel',
    variant = 'info',
    isLoading = false
}) => {
    const style = variantStyles[variant];

    const confirmButtonClass = variant === 'danger' 
        ? 'bg-red-500 hover:bg-red-600 text-white border-transparent' 
        : '';

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
                        className="absolute inset-0 bg-slate-400/30 dark:bg-slate-900/30 backdrop-blur-sm"
                    />

                    {/* Dialog Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 border-t-4 ${style.accentColor}`}
                    >
                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${style.iconBg} ${style.iconColor}`}>
                                    <i className={`${style.icon} text-2xl`}></i>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                        {title}
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">
                                        {description}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-8 flex items-center justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="px-6 rounded-xl"
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    variant={style.confirmButtonVariant as any}
                                    onClick={onConfirm}
                                    isLoading={isLoading}
                                    className={`px-6 rounded-xl ${confirmButtonClass}`}
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </div>

                        {/* Top Close Button */}
                        <div className="absolute top-4 right-4">
                            <IconButton
                                icon="ri-close-line"
                                variant="ghost"
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200"
                            />
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

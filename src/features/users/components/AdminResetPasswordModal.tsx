import React, { useState, useEffect } from 'react';
import Modal from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import toast from 'react-hot-toast';
import {
    User,
    useAdminDirectResetPassword,
    useFulfillPasswordResetRequest,
    ResetPasswordResponse
} from '../api/usersApi';
import { getApiErrorMessage } from '../../../utils/api';

interface AdminResetPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: Partial<User> | null;
    requestId?: string | null;
    onSuccess?: () => void;
}

export const AdminResetPasswordModal: React.FC<AdminResetPasswordModalProps> = ({
    isOpen,
    onClose,
    user,
    requestId,
    onSuccess,
}) => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(true);
    const [sendEmail, setSendEmail] = useState(true);
    const [resetResult, setResetResult] = useState<ResetPasswordResponse | null>(null);

    const directResetMutation = useAdminDirectResetPassword();
    const fulfillResetMutation = useFulfillPasswordResetRequest();

    const isSubmitting = directResetMutation.isPending || fulfillResetMutation.isPending;

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
        let generated = '';
        for (let i = 0; i < 12; i++) {
            generated += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(generated);
        setShowPassword(true);
    };

    useEffect(() => {
        if (isOpen) {
            generatePassword();
            setResetResult(null);
        }
    }, [isOpen, user?.id, requestId]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Password copied to clipboard!');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password.length < 8) {
            toast.error('Password must be at least 8 characters long.');
            return;
        }

        try {
            let res: ResetPasswordResponse;
            if (requestId) {
                res = await fulfillResetMutation.mutateAsync({
                    requestId,
                    new_password: password,
                    send_email: sendEmail,
                });
            } else if (user?.id) {
                res = await directResetMutation.mutateAsync({
                    userId: user.id,
                    new_password: password,
                    send_email: sendEmail,
                });
            } else {
                toast.error('No user specified for password reset.');
                return;
            }

            setResetResult(res);
            toast.success('Password reset successfully!');
            onSuccess?.();
        } catch (error: any) {
            const msg = getApiErrorMessage(error, 'Failed to reset password.');
            toast.error(msg);
        }
    };

    const handleClose = () => {
        setResetResult(null);
        setPassword('');
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={resetResult ? "Password Reset Completed" : "Reset User Password"}
            size="md"
        >
            <div className="p-6 space-y-6">
                {/* Target User Info Header */}
                <div className="flex items-center gap-3.5 p-3.5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shrink-0">
                        {user?.full_name ? user.full_name[0].toUpperCase() : <i className="ri-user-line" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-zinc-900 dark:text-white truncate">
                            {user?.full_name || 'Staff User'}
                        </span>
                        <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {user?.email}
                        </span>
                    </div>
                    {user?.role && (
                        <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-zinc-200/70 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 shrink-0">
                            {user.role.replace('_', ' ')}
                        </span>
                    )}
                </div>

                {resetResult ? (
                    /* Success Result View with Credential Summary */
                    <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/60 rounded-2xl">
                            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-sm mb-1">
                                <i className="ri-checkbox-circle-fill text-lg" />
                                <span>Credentials Updated</span>
                            </div>
                            <p className="text-xs text-green-800 dark:text-green-300">
                                {resetResult.message}
                            </p>
                        </div>

                        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-700 space-y-3">
                            <div className="flex justify-between items-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                                <span>NEW CREDENTIALS</span>
                                <button
                                    type="button"
                                    onClick={() => handleCopy(`Email: ${user?.email}\nPassword: ${resetResult.temporary_password || password}`)}
                                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-bold"
                                >
                                    <i className="ri-file-copy-line" /> Copy Both
                                </button>
                            </div>
                            <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between items-center p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                    <span className="text-zinc-500 dark:text-zinc-400 text-xs">Email:</span>
                                    <span className="font-semibold text-zinc-900 dark:text-white select-all">{user?.email}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                    <span className="text-zinc-500 dark:text-zinc-400 text-xs">Password:</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 select-all">
                                            {resetResult.temporary_password || password}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(resetResult.temporary_password || password)}
                                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded text-zinc-500"
                                            title="Copy password"
                                        >
                                            <i className="ri-file-copy-line text-sm" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button
                                className="w-full justify-center"
                                onClick={handleClose}
                            >
                                Done
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Password Input & Generation Form */
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                    New Password <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={generatePassword}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
                                >
                                    <i className="ri-magic-line text-sm" /> Auto-Generate
                                </button>
                            </div>

                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter or generate password"
                                    required
                                    className="font-mono pr-20"
                                />
                                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-zinc-400">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="p-1 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} />
                                    </button>
                                    {password && (
                                        <button
                                            type="button"
                                            onClick={() => handleCopy(password)}
                                            className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                            title="Copy password"
                                        >
                                            <i className="ri-file-copy-line" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                Must be at least 8 characters long.
                            </p>
                        </div>

                        {/* Send Email Checkbox */}
                        <div className="flex items-start gap-3 p-3.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <input
                                type="checkbox"
                                id="send_email"
                                checked={sendEmail}
                                onChange={(e) => setSendEmail(e.target.checked)}
                                className="mt-0.5 w-4 h-4 text-indigo-600 rounded border-zinc-300 focus:ring-indigo-500"
                            />
                            <label htmlFor="send_email" className="text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                                <span className="font-semibold block text-zinc-900 dark:text-white">Email credentials to user</span>
                                Send an automated notification with their new login password to {user?.email || 'user'}.
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                icon="ri-key-line"
                            >
                                Set New Password
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
};

export default AdminResetPasswordModal;

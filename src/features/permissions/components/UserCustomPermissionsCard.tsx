import React, { useState, useEffect } from 'react';
import {
    usePermissionModules,
    useUserPermissions,
    useUpdateUserCustomPermissions,
} from '../api/permissionsApi';
import toast from 'react-hot-toast';

interface UserCustomPermissionsCardProps {
    userId: string;
    userRole: string;
    userName?: string;
}

export const UserCustomPermissionsCard: React.FC<UserCustomPermissionsCardProps> = ({
    userId,
    userRole,
    userName,
}) => {
    const { data: modules, isLoading: modulesLoading } = usePermissionModules();
    const { data: userPerms, isLoading: userPermsLoading } = useUserPermissions(userId);
    const updateCustomMutation = useUpdateUserCustomPermissions();

    const [customList, setCustomList] = useState<string[]>([]);
    const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

    useEffect(() => {
        if (userPerms) {
            if (userPerms.custom_permissions !== null && userPerms.custom_permissions !== undefined) {
                setCustomList(userPerms.custom_permissions);
                setIsCustomMode(true);
            } else {
                setCustomList(userPerms.permissions || []);
                setIsCustomMode(false);
            }
        }
    }, [userPerms]);

    const handleToggle = (key: string) => {
        const current = [...customList];
        const index = current.indexOf(key);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(key);
        }
        setCustomList(current);
        setIsCustomMode(true);
    };

    const handleResetToRoleDefault = async () => {
        const promise = updateCustomMutation.mutateAsync({
            userId,
            custom_permissions: null,
        });

        toast.promise(promise, {
            loading: 'Resetting to role defaults...',
            success: 'User permissions reset to role defaults.',
            error: 'Failed to reset permissions.',
        });
        setIsCustomMode(false);
    };

    const handleSaveCustom = async () => {
        const promise = updateCustomMutation.mutateAsync({
            userId,
            custom_permissions: customList,
        });

        toast.promise(promise, {
            loading: 'Saving custom permissions...',
            success: 'User custom permissions updated successfully!',
            error: 'Failed to update custom permissions.',
        });
    };

    if (modulesLoading || userPermsLoading) {
        return (
            <div className="p-6 text-center text-zinc-500 text-sm">
                <i className="ri-loader-4-line animate-spin text-xl text-indigo-600 mr-2" />
                <span>Loading user access rights...</span>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-mauve-800">
                <div>
                    <div className="flex items-center gap-2">
                        <i className="ri-shield-user-line text-indigo-600 text-xl" />
                        <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                            Individual Access Rights & Overrides
                        </h3>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        Customize or grant additional feature access for {userName || 'this user'}.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${isCustomMode
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200'
                            : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-zinc-300'
                            }`}
                    >
                        {isCustomMode ? 'Custom Overrides Active' : `Inheriting ${userRole} Defaults`}
                    </span>
                </div>
            </div>

            {/* Quick action bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="text-neutral-500 dark:text-neutral-400">
                    {customList.length} of {modules?.length || 0} permissions active for this user
                </span>
                <div className="flex items-center gap-2">
                    {isCustomMode && (
                        <button
                            type="button"
                            onClick={handleResetToRoleDefault}
                            className="px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-zinc-700 dark:text-zinc-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-semibold"
                        >
                            Reset to Role Defaults
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleSaveCustom}
                        disabled={updateCustomMutation.isPending}
                        className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors disabled:opacity-50"
                    >
                        Save User Permissions
                    </button>
                </div>
            </div>

            {/* Permissions list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                {(modules || []).map((mod) => {
                    const isChecked = customList.includes(mod.key);
                    return (
                        <div
                            key={mod.key}
                            onClick={() => handleToggle(mod.key)}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none transition-all ${isChecked
                                ? 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800'
                                : 'bg-neutral-50/40 dark:bg-neutral-800/40 border-mauve-200 dark:border-mauve-800'
                                }`}
                        >
                            <div className="pr-2">
                                <span className="text-xs font-bold text-neutral-900 dark:text-zinc-100 block">
                                    {mod.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                                    {mod.key}
                                </span>
                            </div>

                            <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => { }} // handled by div click
                                className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 pointer-events-none"
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default UserCustomPermissionsCard;

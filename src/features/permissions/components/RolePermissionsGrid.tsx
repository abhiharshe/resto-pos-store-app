import React, { useState, useEffect } from 'react';
import {
    usePermissionModules,
    useRolePermissions,
    useUpdateRolePermissions,
    PermissionModule,
} from '../api/permissionsApi';
import toast from 'react-hot-toast';

const EDITABLE_ROLES = [
    { key: 'STORE_ADMIN', label: 'Store Admin', icon: 'ri-admin-line', color: 'indigo' },
    { key: 'MANAGER', label: 'Store Manager', icon: 'ri-user-star-line', color: 'blue' },
    { key: 'CASHIER', label: 'Cashier', icon: 'ri-money-dollar-circle-line', color: 'emerald' },
    { key: 'KITCHEN', label: 'Kitchen / Chef', icon: 'ri-restaurant-2-line', color: 'amber' },
];

export const RolePermissionsGrid: React.FC = () => {
    const { data: modules, isLoading: modulesLoading } = usePermissionModules();
    const { data: rolePermissions, isLoading: rolesLoading } = useRolePermissions();
    const updateRoleMutation = useUpdateRolePermissions();

    const [selectedRole, setSelectedRole] = useState<string>('STORE_ADMIN');
    const [rolePermMap, setRolePermMap] = useState<Record<string, string[]>>({});

    useEffect(() => {
        if (rolePermissions) {
            const map: Record<string, string[]> = {};
            rolePermissions.forEach((rp) => {
                map[rp.role] = rp.permissions || [];
            });
            setRolePermMap(map);
        }
    }, [rolePermissions]);

    const activePermissions = rolePermMap[selectedRole] || [];

    const handleToggle = (key: string) => {
        const current = [...activePermissions];
        const index = current.indexOf(key);
        if (index > -1) {
            current.splice(index, 1);
        } else {
            current.push(key);
        }
        setRolePermMap({
            ...rolePermMap,
            [selectedRole]: current,
        });
    };

    const handleSelectAll = () => {
        if (!modules) return;
        setRolePermMap({
            ...rolePermMap,
            [selectedRole]: modules.map((m) => m.key),
        });
    };

    const handleDeselectAll = () => {
        setRolePermMap({
            ...rolePermMap,
            [selectedRole]: [],
        });
    };

    const handleSave = async () => {
        const promise = updateRoleMutation.mutateAsync({
            role: selectedRole,
            permissions: activePermissions,
        });

        toast.promise(promise, {
            loading: `Saving permissions for ${selectedRole}...`,
            success: `Permissions updated successfully for ${selectedRole}!`,
            error: 'Failed to update role permissions.',
        });
    };

    if (modulesLoading || rolesLoading) {
        return (
            <div className="p-12 text-center text-zinc-500">
                <i className="ri-loader-4-line animate-spin text-3xl text-indigo-600 mb-2 block" />
                <span>Loading permission matrix...</span>
            </div>
        );
    }

    // Group modules by Category
    const groupedModules = (modules || []).reduce<Record<string, PermissionModule[]>>((acc, mod) => {
        if (!acc[mod.category]) acc[mod.category] = [];
        acc[mod.category].push(mod);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {/* Role Switcher Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EDITABLE_ROLES.map((r) => {
                    const isSelected = selectedRole === r.key;
                    const count = (rolePermMap[r.key] || []).length;
                    return (
                        <button
                            key={r.key}
                            type="button"
                            onClick={() => setSelectedRole(r.key)}
                            className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                                isSelected
                                    ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500/50 shadow-sm ring-1 ring-indigo-500/30'
                                    : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                        >
                            <div className="flex items-center justify-between w-full mb-2">
                                <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg ${
                                        isSelected
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                                    }`}
                                >
                                    <i className={r.icon} />
                                </div>
                                <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                                    {count} Perms
                                </span>
                            </div>
                            <span className="font-bold text-sm text-zinc-900 dark:text-white">{r.label}</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">Configure access rules</span>
                        </button>
                    );
                })}
            </div>

            {/* Permissions Matrix Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
                {/* Header bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <div>
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span>Permissions for</span>
                            <span className="text-indigo-600 dark:text-indigo-400">
                                {EDITABLE_ROLES.find((r) => r.key === selectedRole)?.label}
                            </span>
                        </h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Toggle the features and endpoints available to users with this role.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={handleSelectAll}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Select All
                        </button>
                        <button
                            type="button"
                            onClick={handleDeselectAll}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            Deselect All
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={updateRoleMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-sm transition-colors disabled:opacity-50"
                        >
                            <i className={`ri-save-line ${updateRoleMutation.isPending ? 'animate-spin' : ''}`} />
                            <span>Save Changes</span>
                        </button>
                    </div>
                </div>

                {/* Categories & Modules */}
                <div className="p-5 sm:p-6 space-y-8">
                    {Object.entries(groupedModules).map(([category, items]) => (
                        <div key={category} className="space-y-3">
                            <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                    {category}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-semibold">
                                    {items.filter((i) => activePermissions.includes(i.key)).length}/{items.length} Enabled
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {items.map((item) => {
                                    const isEnabled = activePermissions.includes(item.key);
                                    return (
                                        <div
                                            key={item.key}
                                            onClick={() => handleToggle(item.key)}
                                            className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                                                isEnabled
                                                    ? 'bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/60'
                                                    : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60'
                                            }`}
                                        >
                                            <div className="pr-3 space-y-0.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                                        {item.name}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                                                    {item.description}
                                                </p>
                                                <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block pt-0.5">
                                                    {item.key}
                                                </span>
                                            </div>

                                            {/* Toggle switch */}
                                            <div
                                                className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                                                    isEnabled ? 'bg-indigo-600' : 'bg-zinc-300 dark:bg-zinc-700'
                                                }`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                                        isEnabled ? 'translate-x-4' : 'translate-x-0'
                                                    }`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RolePermissionsGrid;

import React, { useEffect, useState } from 'react';
import { useGetGlobalPackagingConfig, useUpdateGlobalPackagingConfig, PackagingRule, PackagingConfigPayload } from '../api/chargesApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import IconButton from '../../../components/common/IconButton';
import { toast } from 'react-hot-toast';

const PackagingSettings: React.FC = () => {
    const { data: config, isLoading } = useGetGlobalPackagingConfig();
    const updateMutation = useUpdateGlobalPackagingConfig();

    const [rules, setRules] = useState<PackagingRule[]>([]);
    const [isActive, setIsActive] = useState<boolean>(true);

    useEffect(() => {
        if (config) {
            setRules(config.rules || []);
            setIsActive(config.is_active ?? true);
        }
    }, [config]);

    const handleAddRule = () => {
        // Compute logical next min_order_value
        let nextMin = 0;
        if (rules.length > 0) {
            const last = rules[rules.length - 1];
            nextMin = last.max_order_value !== null && last.max_order_value !== undefined ? last.max_order_value + 1 : last.min_order_value + 200;
        }
        setRules([...rules, { min_order_value: nextMin, max_order_value: null, charge: 10 }]);
    };

    const handleRemoveRule = (index: number) => {
        setRules(rules.filter((_, idx) => idx !== index));
    };

    const handleRuleChange = (index: number, field: keyof PackagingRule, val: any) => {
        const updated = [...rules];
        if (field === 'max_order_value') {
            updated[index] = {
                ...updated[index],
                max_order_value: val === '' || val === null ? null : Number(val),
            };
        } else {
            updated[index] = {
                ...updated[index],
                [field]: val === '' ? 0 : Number(val),
            };
        }
        setRules(updated);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rules.length === 0) {
            toast.error("Please add at least one packaging slab");
            return;
        }

        // Validate client side before submitting
        const sorted = [...rules].sort((a, b) => a.min_order_value - b.min_order_value);
        const openEnded = sorted.filter(r => r.max_order_value === null || r.max_order_value === undefined);
        if (openEnded.length > 1) {
            toast.error("Only one open-ended packaging slab (no max limit) is permitted.");
            return;
        }

        for (let i = 0; i < sorted.length - 1; i++) {
            const curr = sorted[i];
            const next = sorted[i + 1];
            if (curr.max_order_value === null || curr.max_order_value === undefined) {
                toast.error("Open-ended slab must be the final slab in the list.");
                return;
            }
            if (curr.min_order_value > curr.max_order_value) {
                toast.error(`Invalid slab: Min ₹${curr.min_order_value} is greater than Max ₹${curr.max_order_value}`);
                return;
            }
            if (curr.max_order_value > next.min_order_value) {
                toast.error(`Overlapping slabs detected between [₹${curr.min_order_value} - ₹${curr.max_order_value}] and [₹${next.min_order_value} - ${next.max_order_value ?? '∞'}]`);
                return;
            }
        }

        const payload: PackagingConfigPayload = {
            is_active: isActive,
            rules: sorted,
        };

        try {
            await updateMutation.mutateAsync(payload);
            toast.success("Global packaging slabs saved successfully!");
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || "Failed to save packaging configuration");
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <i className="ri-loader-4-line animate-spin text-2xl text-indigo-600" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-700 pb-4">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Global Packaging Charges (Slabs)</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Configure order value slabs and packaging fees applied to Delivery and Takeaway orders.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Status:</label>
                    <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${isActive
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                            }`}
                    >
                        {isActive ? '● Active' : '○ Inactive'}
                    </button>
                </div>
            </div>

            {/* Slabs Table */}
            <div className="bg-white dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-800/80">
                    <div>
                        <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">Order Value Slabs</h4>
                        <p className="text-xs text-zinc-500">Calculated on Net Food Value (Item Total - Discounts)</p>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAddRule}
                        icon="ri-add-line"
                    >
                        Add Slab
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-100/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                            <tr>
                                <th className="p-3.5 pl-5">Min Order Value (₹)</th>
                                <th className="p-3.5">Max Order Value (₹)</th>
                                <th className="p-3.5">Packaging Fee (₹)</th>
                                <th className="p-3.5 text-right pr-5">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                            {rules.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-zinc-400">
                                        No packaging slabs defined. Click "Add Slab" to configure.
                                    </td>
                                </tr>
                            ) : (
                                rules.map((rule, idx) => (
                                    <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-700/30 transition-colors">
                                        <td className="p-3.5 pl-5">
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={rule.min_order_value}
                                                onChange={(e) => handleRuleChange(idx, 'min_order_value', e.target.value)}
                                                className="w-32 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="0.00"
                                                required
                                            />
                                        </td>
                                        <td className="p-3.5">
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    min={0}
                                                    step="0.01"
                                                    value={rule.max_order_value ?? ''}
                                                    onChange={(e) => handleRuleChange(idx, 'max_order_value', e.target.value)}
                                                    className="w-32 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                                    placeholder="No Limit (∞)"
                                                />
                                                {rule.max_order_value === null && (
                                                    <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold px-2 py-1 rounded">
                                                        Above ₹{rule.min_order_value}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3.5">
                                            <input
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={rule.charge}
                                                onChange={(e) => handleRuleChange(idx, 'charge', e.target.value)}
                                                className="w-28 px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="10.00"
                                                required
                                            />
                                        </td>
                                        <td className="p-3.5 text-right pr-5">
                                            <IconButton
                                                type="button"
                                                variant="danger"
                                                size="sm"
                                                onClick={() => handleRemoveRule(idx)}
                                                icon="ri-delete-bin-line"
                                                title="Delete Slab"
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={updateMutation.isPending} icon="ri-save-line">
                    Save Global Packaging Settings
                </Button>
            </div>
        </form>
    );
};

export default PackagingSettings;

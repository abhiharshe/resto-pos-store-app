import React, { useEffect, useState } from 'react';
import {
    useGetStoreDeliveryConfig,
    useUpdateStoreDeliveryConfig,
    useDeleteStoreDeliveryConfig,
    useGetStorePackagingConfig,
    useUpdateStorePackagingConfig,
    useDeleteStorePackagingConfig,
    DeliveryConfigPayload,
    PackagingRule,
    PackagingConfigPayload,
} from '../../settings/api/chargesApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import IconButton from '../../../components/common/IconButton';
import Card from '../../../components/common/Card';
import { toast } from 'react-hot-toast';

interface StoreChargesOverrideProps {
    storeId: string;
    storeName: string;
}

export const StoreChargesOverride: React.FC<StoreChargesOverrideProps> = ({ storeId, storeName }) => {
    // ----------------------------------------------------
    // Delivery Queries & Mutations
    // ----------------------------------------------------
    const { data: deliveryConfig, isLoading: isDeliveryLoading } = useGetStoreDeliveryConfig(storeId);
    const updateDeliveryMutation = useUpdateStoreDeliveryConfig(storeId);
    const deleteDeliveryMutation = useDeleteStoreDeliveryConfig(storeId);

    const [deliveryMode, setDeliveryMode] = useState<'GLOBAL' | 'OVERRIDE'>('GLOBAL');
    const [chargeType, setChargeType] = useState<'FIXED' | 'PER_KM'>('FIXED');
    const [fixedCharge, setFixedCharge] = useState<number | string>(50);
    const [chargePerKm, setChargePerKm] = useState<number | string>(12);
    const [minimumCharge, setMinimumCharge] = useState<number | string>(30);
    const [freeDeliveryMinVal, setFreeDeliveryMinVal] = useState<number | string>('');

    useEffect(() => {
        if (deliveryConfig) {
            setDeliveryMode(deliveryConfig.is_override ? 'OVERRIDE' : 'GLOBAL');
            setChargeType(deliveryConfig.charge_type || 'FIXED');
            setFixedCharge(deliveryConfig.fixed_charge ?? 0);
            setChargePerKm(deliveryConfig.charge_per_km ?? 0);
            setMinimumCharge(deliveryConfig.minimum_charge ?? 0);
            setFreeDeliveryMinVal(deliveryConfig.free_delivery_min_value ?? '');
        }
    }, [deliveryConfig]);

    // ----------------------------------------------------
    // Packaging Queries & Mutations
    // ----------------------------------------------------
    const { data: packagingConfig, isLoading: isPackagingLoading } = useGetStorePackagingConfig(storeId);
    const updatePackagingMutation = useUpdateStorePackagingConfig(storeId);
    const deletePackagingMutation = useDeleteStorePackagingConfig(storeId);

    const [packagingMode, setPackagingMode] = useState<'GLOBAL' | 'OVERRIDE'>('GLOBAL');
    const [packagingRules, setPackagingRules] = useState<PackagingRule[]>([]);

    useEffect(() => {
        if (packagingConfig) {
            setPackagingMode(packagingConfig.is_override ? 'OVERRIDE' : 'GLOBAL');
            setPackagingRules(packagingConfig.rules || []);
        }
    }, [packagingConfig]);

    // ----------------------------------------------------
    // Delivery Handlers
    // ----------------------------------------------------
    const handleSaveDeliveryOverride = async () => {
        const payload: DeliveryConfigPayload = {
            charge_type: chargeType,
            fixed_charge: chargeType === 'FIXED' ? Number(fixedCharge) || 0 : 0,
            charge_per_km: chargeType === 'PER_KM' ? Number(chargePerKm) || 0 : 0,
            minimum_charge: chargeType === 'PER_KM' ? Number(minimumCharge) || 0 : 0,
            free_delivery_min_value: freeDeliveryMinVal !== '' ? Number(freeDeliveryMinVal) : null,
            is_active: true,
        };

        try {
            await updateDeliveryMutation.mutateAsync(payload);
            toast.success(`Delivery override saved for ${storeName}!`);
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || "Failed to save delivery override");
        }
    };

    const handleRevertDeliveryToGlobal = async () => {
        try {
            await deleteDeliveryMutation.mutateAsync();
            setDeliveryMode('GLOBAL');
            toast.success(`Reverted to global delivery configuration`);
        } catch (err: any) {
            toast.error("Failed to revert delivery configuration");
        }
    };

    // ----------------------------------------------------
    // Packaging Handlers
    // ----------------------------------------------------
    const handleAddPackagingRule = () => {
        let nextMin = 0;
        if (packagingRules.length > 0) {
            const last = packagingRules[packagingRules.length - 1];
            nextMin = last.max_order_value !== null && last.max_order_value !== undefined ? last.max_order_value + 1 : last.min_order_value + 200;
        }
        setPackagingRules([...packagingRules, { min_order_value: nextMin, max_order_value: null, charge: 10 }]);
    };

    const handleRemovePackagingRule = (index: number) => {
        setPackagingRules(packagingRules.filter((_, idx) => idx !== index));
    };

    const handlePackagingRuleChange = (index: number, field: keyof PackagingRule, val: any) => {
        const updated = [...packagingRules];
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
        setPackagingRules(updated);
    };

    const handleSavePackagingOverride = async () => {
        if (packagingRules.length === 0) {
            toast.error("Please add at least one packaging slab");
            return;
        }

        const sorted = [...packagingRules].sort((a, b) => a.min_order_value - b.min_order_value);
        const openEnded = sorted.filter(r => r.max_order_value === null || r.max_order_value === undefined);
        if (openEnded.length > 1) {
            toast.error("Only one open-ended slab (no max limit) is permitted.");
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
            is_active: true,
            rules: sorted,
        };

        try {
            await updatePackagingMutation.mutateAsync(payload);
            toast.success(`Packaging slabs override saved for ${storeName}!`);
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || "Failed to save packaging override");
        }
    };

    const handleRevertPackagingToGlobal = async () => {
        try {
            await deletePackagingMutation.mutateAsync();
            setPackagingMode('GLOBAL');
            toast.success(`Reverted to global packaging configuration`);
        } catch (err: any) {
            toast.error("Failed to revert packaging configuration");
        }
    };

    if (isDeliveryLoading || isPackagingLoading) {
        return (
            <div className="p-8 text-center">
                <i className="ri-loader-4-line animate-spin text-2xl text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ========================================================= */}
            {/* 1. STORE DELIVERY CHARGES OVERRIDE CARD */}
            {/* ========================================================= */}
            <Card className="space-y-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <i className="ri-e-bike-2-line text-xl text-indigo-600 dark:text-indigo-400" />
                            <h4 className="text-base font-bold text-zinc-900 dark:text-white">Delivery Charges</h4>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Inherit global delivery rates or define custom delivery charges for this store.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-500">Currently using:</span>
                        <span
                            className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                                deliveryConfig?.is_override
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            }`}
                        >
                            {deliveryConfig?.is_override ? '● Store-Specific Override' : '● Global Configuration'}
                        </span>
                    </div>
                </div>

                {/* Scope Selection Radios */}
                <div className="flex flex-wrap gap-6 items-center">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        <input
                            type="radio"
                            name="deliveryScope"
                            checked={deliveryMode === 'GLOBAL'}
                            onChange={() => {
                                if (deliveryConfig?.is_override) {
                                    handleRevertDeliveryToGlobal();
                                } else {
                                    setDeliveryMode('GLOBAL');
                                }
                            }}
                            className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        Use Global Configuration
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        <input
                            type="radio"
                            name="deliveryScope"
                            checked={deliveryMode === 'OVERRIDE'}
                            onChange={() => setDeliveryMode('OVERRIDE')}
                            className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        Override for this Branch
                    </label>
                </div>

                {/* If Overriding: Show Branch Form */}
                {deliveryMode === 'OVERRIDE' ? (
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4 animate-in fade-in">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                                Branch Calculation Type
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setChargeType('FIXED')}
                                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                                        chargeType === 'FIXED'
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 font-bold text-indigo-700 dark:text-indigo-300'
                                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                                    }`}
                                >
                                    <span>Fixed Delivery Charge</span>
                                    {chargeType === 'FIXED' && <i className="ri-checkbox-circle-fill text-indigo-600 text-base" />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChargeType('PER_KM')}
                                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                                        chargeType === 'PER_KM'
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 font-bold text-indigo-700 dark:text-indigo-300'
                                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                                    }`}
                                >
                                    <span>Per KM Distance Charge</span>
                                    {chargeType === 'PER_KM' && <i className="ri-checkbox-circle-fill text-indigo-600 text-base" />}
                                </button>
                            </div>
                        </div>

                        {chargeType === 'FIXED' ? (
                            <div className="max-w-xs">
                                <Input
                                    label="Fixed Charge (₹)"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={fixedCharge}
                                    onChange={(e) => setFixedCharge(e.target.value)}
                                    placeholder="50.00"
                                    required
                                />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Charge Per KM (₹)"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={chargePerKm}
                                    onChange={(e) => setChargePerKm(e.target.value)}
                                    placeholder="12.00"
                                    required
                                />
                                <Input
                                    label="Minimum Charge (₹)"
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={minimumCharge}
                                    onChange={(e) => setMinimumCharge(e.target.value)}
                                    placeholder="30.00"
                                />
                            </div>
                        )}

                        <div className="max-w-md pt-2 border-t border-zinc-200 dark:border-zinc-700">
                            <Input
                                label="Free Delivery Above (₹)"
                                type="number"
                                min={0}
                                step="0.01"
                                value={freeDeliveryMinVal}
                                onChange={(e) => setFreeDeliveryMinVal(e.target.value)}
                                placeholder="999.00"
                                helper="Net Food Value for ₹0 delivery"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            {deliveryConfig?.is_override && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRevertDeliveryToGlobal}
                                    isLoading={deleteDeliveryMutation.isPending}
                                >
                                    Revert to Global
                                </Button>
                            )}
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSaveDeliveryOverride}
                                isLoading={updateDeliveryMutation.isPending}
                                icon="ri-save-line"
                            >
                                Save Branch Delivery Configuration
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <i className="ri-information-line text-base text-emerald-600" />
                            <span>This store is using the global delivery fee setting.</span>
                        </div>
                    </div>
                )}
            </Card>

            {/* ========================================================= */}
            {/* 2. STORE PACKAGING CHARGES OVERRIDE CARD */}
            {/* ========================================================= */}
            <Card className="space-y-6 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-700 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <i className="ri-box-3-line text-xl text-indigo-600 dark:text-indigo-400" />
                            <h4 className="text-base font-bold text-zinc-900 dark:text-white">Packaging Charges</h4>
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5">
                            Inherit global packaging slabs or customize order value tiers for this store.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-zinc-500">Currently using:</span>
                        <span
                            className={`px-3 py-1 text-xs font-extrabold rounded-full ${
                                packagingConfig?.is_override
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            }`}
                        >
                            {packagingConfig?.is_override ? '● Store-Specific Override' : '● Global Configuration'}
                        </span>
                    </div>
                </div>

                {/* Scope Selection Radios */}
                <div className="flex flex-wrap gap-6 items-center">
                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        <input
                            type="radio"
                            name="packagingScope"
                            checked={packagingMode === 'GLOBAL'}
                            onChange={() => {
                                if (packagingConfig?.is_override) {
                                    handleRevertPackagingToGlobal();
                                } else {
                                    setPackagingMode('GLOBAL');
                                }
                            }}
                            className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        Use Global Configuration
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                        <input
                            type="radio"
                            name="packagingScope"
                            checked={packagingMode === 'OVERRIDE'}
                            onChange={() => setPackagingMode('OVERRIDE')}
                            className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                        />
                        Override for this Branch
                    </label>
                </div>

                {/* If Overriding: Slabs Table */}
                {packagingMode === 'OVERRIDE' ? (
                    <div className="p-5 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl border border-zinc-200 dark:border-zinc-700 space-y-4 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <div>
                                <h5 className="font-bold text-sm text-zinc-900 dark:text-white">Store Packaging Slabs</h5>
                                <p className="text-xs text-zinc-500">Custom slabs applied to delivery and takeaway orders</p>
                            </div>
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={handleAddPackagingRule}
                                icon="ri-add-line"
                            >
                                Add Slab
                            </Button>
                        </div>

                        <div className="overflow-x-auto bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-zinc-100 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300 text-xs font-bold uppercase">
                                    <tr>
                                        <th className="p-3 pl-4">Min Order Value (₹)</th>
                                        <th className="p-3">Max Order Value (₹)</th>
                                        <th className="p-3">Charge (₹)</th>
                                        <th className="p-3 text-right pr-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                                    {packagingRules.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-6 text-center text-zinc-400 text-xs">
                                                No packaging slabs defined. Click "Add Slab" to add tiers.
                                            </td>
                                        </tr>
                                    ) : (
                                        packagingRules.map((rule, idx) => (
                                            <tr key={idx}>
                                                <td className="p-3 pl-4">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={rule.min_order_value}
                                                        onChange={(e) => handlePackagingRuleChange(idx, 'min_order_value', e.target.value)}
                                                        className="w-28 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm outline-none"
                                                        placeholder="0.00"
                                                        required
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={rule.max_order_value ?? ''}
                                                        onChange={(e) => handlePackagingRuleChange(idx, 'max_order_value', e.target.value)}
                                                        className="w-28 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm outline-none"
                                                        placeholder="No Limit"
                                                    />
                                                </td>
                                                <td className="p-3">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        step="0.01"
                                                        value={rule.charge}
                                                        onChange={(e) => handlePackagingRuleChange(idx, 'charge', e.target.value)}
                                                        className="w-24 px-2.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm font-semibold outline-none"
                                                        placeholder="10.00"
                                                        required
                                                    />
                                                </td>
                                                <td className="p-3 text-right pr-4">
                                                    <IconButton
                                                        type="button"
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleRemovePackagingRule(idx)}
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

                        <div className="flex justify-end gap-3 pt-2">
                            {packagingConfig?.is_override && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRevertPackagingToGlobal}
                                    isLoading={deletePackagingMutation.isPending}
                                >
                                    Revert to Global
                                </Button>
                            )}
                            <Button
                                type="button"
                                size="sm"
                                onClick={handleSavePackagingOverride}
                                isLoading={updatePackagingMutation.isPending}
                                icon="ri-save-line"
                            >
                                Save Branch Packaging Configuration
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <i className="ri-information-line text-base text-emerald-600" />
                            <span>This store is using the global packaging slabs setting.</span>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

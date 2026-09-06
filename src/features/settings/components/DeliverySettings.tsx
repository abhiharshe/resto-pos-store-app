import React, { useEffect, useState } from 'react';
import { useGetGlobalDeliveryConfig, useUpdateGlobalDeliveryConfig, DeliveryConfigPayload } from '../api/chargesApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { toast } from 'react-hot-toast';

const DeliverySettings: React.FC = () => {
    const { data: config, isLoading } = useGetGlobalDeliveryConfig();
    const updateMutation = useUpdateGlobalDeliveryConfig();

    const [chargeType, setChargeType] = useState<'FIXED' | 'PER_KM'>('FIXED');
    const [fixedCharge, setFixedCharge] = useState<number | string>(50);
    const [chargePerKm, setChargePerKm] = useState<number | string>(12);
    const [minimumCharge, setMinimumCharge] = useState<number | string>(30);
    const [freeDeliveryMinVal, setFreeDeliveryMinVal] = useState<number | string>('');
    const [isActive, setIsActive] = useState<boolean>(true);

    useEffect(() => {
        if (config) {
            setChargeType(config.charge_type || 'FIXED');
            setFixedCharge(config.fixed_charge ?? 0);
            setChargePerKm(config.charge_per_km ?? 0);
            setMinimumCharge(config.minimum_charge ?? 0);
            setFreeDeliveryMinVal(config.free_delivery_min_value ?? '');
            setIsActive(config.is_active ?? true);
        }
    }, [config]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: DeliveryConfigPayload = {
            charge_type: chargeType,
            fixed_charge: chargeType === 'FIXED' ? Number(fixedCharge) || 0 : 0,
            charge_per_km: chargeType === 'PER_KM' ? Number(chargePerKm) || 0 : 0,
            minimum_charge: chargeType === 'PER_KM' ? Number(minimumCharge) || 0 : 0,
            free_delivery_min_value: freeDeliveryMinVal !== '' ? Number(freeDeliveryMinVal) : null,
            is_active: isActive,
        };

        try {
            await updateMutation.mutateAsync(payload);
            toast.success("Global delivery settings saved successfully!");
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || "Failed to save delivery settings");
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
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Global Delivery Charges</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        Configure the default delivery fee structure applied to all stores without custom overrides.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Status:</label>
                    <button
                        type="button"
                        onClick={() => setIsActive(!isActive)}
                        className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                            isActive
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                                : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400'
                        }`}
                    >
                        {isActive ? '● Active' : '○ Inactive'}
                    </button>
                </div>
            </div>

            {/* Calculation Model Selector */}
            <div className="space-y-3">
                <label className="block text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    Calculation Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                        onClick={() => setChargeType('FIXED')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                            chargeType === 'FIXED'
                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-500'
                                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                        }`}
                    >
                        <div className="mt-0.5">
                            <input
                                type="radio"
                                name="chargeType"
                                checked={chargeType === 'FIXED'}
                                onChange={() => setChargeType('FIXED')}
                                className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                        </div>
                        <div>
                            <span className="font-bold text-sm text-zinc-900 dark:text-white block">Fixed Delivery Fee</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                Flat fee charged on all delivery orders regardless of distance (e.g. ₹50).
                            </span>
                        </div>
                    </div>

                    <div
                        onClick={() => setChargeType('PER_KM')}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                            chargeType === 'PER_KM'
                                ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/20 dark:border-indigo-500'
                                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300'
                        }`}
                    >
                        <div className="mt-0.5">
                            <input
                                type="radio"
                                name="chargeType"
                                checked={chargeType === 'PER_KM'}
                                onChange={() => setChargeType('PER_KM')}
                                className="text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                        </div>
                        <div>
                            <span className="font-bold text-sm text-zinc-900 dark:text-white block">Distance Based (Per KM)</span>
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                Delivery fee calculated dynamically based on delivery distance (e.g. ₹12 / km with min charge).
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Inputs based on selected type */}
            <div className="p-5 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 space-y-4">
                {chargeType === 'FIXED' ? (
                    <div className="max-w-md">
                        <Input
                            label="Fixed Delivery Charge (₹)"
                            type="number"
                            min={0}
                            step="0.01"
                            value={fixedCharge}
                            onChange={(e) => setFixedCharge(e.target.value)}
                            placeholder="e.g. 50.00"
                            helper="Amount charged for each delivery order"
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
                            placeholder="e.g. 12.00"
                            helper="Rate multiplied by distance in kilometers"
                            required
                        />
                        <Input
                            label="Minimum Delivery Charge (₹)"
                            type="number"
                            min={0}
                            step="0.01"
                            value={minimumCharge}
                            onChange={(e) => setMinimumCharge(e.target.value)}
                            placeholder="e.g. 30.00"
                            helper="Base floor charge if distance * rate is lower"
                        />
                    </div>
                )}

                <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700">
                    <div className="max-w-md">
                        <Input
                            label="Free Delivery Minimum Order Value (₹)"
                            type="number"
                            min={0}
                            step="0.01"
                            value={freeDeliveryMinVal}
                            onChange={(e) => setFreeDeliveryMinVal(e.target.value)}
                            placeholder="e.g. 999.00"
                            helper="Net Food Value above which delivery is ₹0. Leave blank to disable free delivery."
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button type="submit" isLoading={updateMutation.isPending} icon="ri-save-line">
                    Save Global Delivery Settings
                </Button>
            </div>
        </form>
    );
};

export default DeliverySettings;

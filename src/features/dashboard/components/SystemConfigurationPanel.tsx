import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { SystemConfigurationStatusResponse, ConfigurationStepStatus } from '../api/dashboardApi';

interface SystemConfigurationPanelProps {
    status?: SystemConfigurationStatusResponse | null;
    isLoading?: boolean;
}

const iconMap: Record<string, string> = {
    general_settings: 'ri-settings-3-line',
    order_settings: 'ri-shopping-bag-3-line',
    delivery_charges: 'ri-e-bike-2-line',
    packaging_charges: 'ri-box-3-line',
    email_settings: 'ri-mail-send-line',
    asset_settings: 'ri-image-line',
    menus: 'ri-time-line',
    categories: 'ri-grid-fill',
    addons: 'ri-puzzle-line',
    menu_items: 'ri-restaurant-line',
    deals: 'ri-discount-percent-line',
};

export const SystemConfigurationPanel: React.FC<SystemConfigurationPanelProps> = ({
    status,
    isLoading = false,
}) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeCategoryFilter, setActiveCategoryFilter] = useState<'ALL' | 'SETTINGS' | 'CATALOG'>('ALL');

    if (isLoading) {
        return (
            <Card className="animate-pulse">
                <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-1/2 mb-6"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-800 rounded-xl"></div>
                    ))}
                </div>
            </Card>
        );
    }

    if (!status) return null;

    const { overall_progress_pct, total_steps, completed_steps, steps } = status;
    const isAllConfigured = completed_steps === total_steps;

    const filteredSteps = steps.filter((step) => {
        if (activeCategoryFilter === 'SETTINGS') return step.category === 'Store Settings';
        if (activeCategoryFilter === 'CATALOG') return step.category === 'Catalog & Menu';
        return true;
    });

    return (
        <Card className="overflow-hidden border border-zinc-200/80 dark:border-zinc-700/80 shadow-sm transition-all">
            {/* Header / Progress Summary */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
                <div className="flex items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl font-semibold shadow-sm ${isAllConfigured
                        ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                        : 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400'
                        }`}>
                        <i className={isAllConfigured ? 'ri-checkbox-circle-fill' : 'ri-list-check-3'} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xl font-semibold text-zinc-600 dark:text-white">System Configurtion & Readiness</h4>
                            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${isAllConfigured
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                                }`}>
                                {completed_steps}/{total_steps} Completed ({overall_progress_pct}%)
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                            {isAllConfigured
                                ? 'All core configurations, catalog items, pricing rules, and menus are fully set up!'
                                : 'Ensure all store settings, menus, items, charges, and deals are active for smooth operations.'}
                        </p>
                    </div>
                </div>

                {/* Right Action Controls */}
                <div className="flex items-center gap-2 self-end md:self-center">
                    {/* Category Filter Pills */}
                    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
                        <button
                            onClick={() => setActiveCategoryFilter('ALL')}
                            className={`px-3 py-1 rounded-lg transition-all ${activeCategoryFilter === 'ALL'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                        >
                            All ({total_steps})
                        </button>
                        <button
                            onClick={() => setActiveCategoryFilter('SETTINGS')}
                            className={`px-3 py-1 rounded-lg transition-all ${activeCategoryFilter === 'SETTINGS'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                        >
                            Store Settings (6)
                        </button>
                        <button
                            onClick={() => setActiveCategoryFilter('CATALOG')}
                            className={`px-3 py-1 rounded-lg transition-all ${activeCategoryFilter === 'CATALOG'
                                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs'
                                : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                                }`}
                        >
                            Catalog & Menu (5)
                        </button>
                    </div>

                    <Button
                        variant="ghost"
                        size="sm"
                        icon={isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}
                        onClick={() => setIsExpanded((prev) => !prev)}
                    >
                        <span>{isExpanded ? 'Collapse' : 'Expand'}</span>
                    </Button>
                </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full mt-4 overflow-hidden">
                <div
                    className={`h-2 rounded-full transition-all duration-500 ${isAllConfigured ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                        }`}
                    style={{ width: `${overall_progress_pct}%` }}
                />
            </div>

            {/* Grid of Steps */}
            {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 mt-5">
                    {filteredSteps.map((step) => (
                        <StepCard key={step.id} step={step} onNavigate={(url) => navigate(url)} />
                    ))}
                </div>
            )}
        </Card>
    );
};

interface StepCardProps {
    step: ConfigurationStepStatus;
    onNavigate: (url: string) => void;
}

const StepCard: React.FC<StepCardProps> = ({ step, onNavigate }) => {
    const isDone = step.is_configured;
    const iconClass = iconMap[step.id] || 'ri-checkbox-line';

    return (
        <div
            onClick={() => onNavigate(step.redirect_url)}
            className={`group relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${isDone
                ? 'bg-zinc-50/70 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-700/60 hover:border-emerald-300 dark:hover:border-emerald-700/70 hover:shadow-xs'
                : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-xs'
                }`}
        >
            <div>
                {/* Top status indicator & icon */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base ${isDone
                            ? 'bg-emerald-100/80 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
                            }`}>
                            <i className={iconClass} />
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block leading-tight">
                                {step.category}
                            </span>
                            <h5 className="text-sm font-semibold text-zinc-900 dark:text-white leading-tight">
                                {step.name}
                            </h5>
                        </div>
                    </div>

                    {/* Checkmark or Pending Icon */}
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isDone
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-amber-200/80 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                        }`}>
                        <i className={isDone ? 'ri-check-line text-sm font-black' : 'ri-error-warning-line text-xs font-semibold'} />
                    </div>
                </div>

                {/* Description */}
                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                    {step.description}
                </p>
            </div>

            {/* Bottom Details & Link Button */}
            <div className="pt-3 mt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between">
                <span className={`text-[11px] font-semibold truncate ${isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                    {step.details || (isDone ? 'Configured' : 'Setup Required')}
                </span>

                <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    <span>{isDone ? 'Manage' : 'Configure'}</span>
                    <i className="ri-arrow-right-s-line" />
                </div>
            </div>
        </div>
    );
};

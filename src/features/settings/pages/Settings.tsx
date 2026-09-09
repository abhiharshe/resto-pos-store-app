import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetSettingsQuery } from '../api/settingsApi';
import GeneralSettings from '../components/GeneralSettings';
import OrderSettings from '../components/OrderSettings';
import EmailSettings from '../components/EmailSettings';
import SystemSettings from '../components/SystemSettings';
import AssetSettings from '../components/AssetSettings';
import DeliverySettings from '../components/DeliverySettings';
import PackagingSettings from '../components/PackagingSettings';
import Container from '../../../components/shared/Container';

const Settings = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabParam || 'general');

    useEffect(() => {
        if (tabParam && ['general', 'order', 'delivery', 'packaging', 'email', 'assets', 'system'].includes(tabParam)) {
            setActiveTab(tabParam);
        }
    }, [tabParam]);

    const handleTabChange = (tabId: string) => {
        setActiveTab(tabId);
        setSearchParams({ tab: tabId });
    };

    // Global queries to warm up the cache and handle loading state
    const { isLoading: isSettingsLoading } = useGetSettingsQuery();

    const tabs = [
        { id: 'general', label: 'General', icon: 'ri-settings-3-line' },
        { id: 'order', label: 'Order Settings', icon: 'ri-shopping-bag-3-line' },
        { id: 'delivery', label: 'Delivery Charges', icon: 'ri-e-bike-2-line' },
        { id: 'packaging', label: 'Packaging Charges', icon: 'ri-box-3-line' },
        { id: 'email', label: 'Email Config', icon: 'ri-mail-send-line' },
        { id: 'assets', label: 'Assets & Storage', icon: 'ri-image-line' },
        { id: 'system', label: 'System', icon: 'ri-server-line' },
    ];

    if (isSettingsLoading) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <i className="ri-loader-4-line animate-spin text-3xl text-indigo-600" />
            </div>
        );
    }

    return (
        <Container>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-semibold text-neutral-900 dark:text-white">Settings</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage your global application configurations.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-mauve-200 dark:border-zinc-700 overflow-hidden">
                <div className="border-b border-mauve-200 dark:border-zinc-700">
                    <nav className="flex overflow-x-auto select-none" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`
                                    whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center transition-colors
                                    ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                                        : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300 dark:text-zinc-400 dark:hover:text-zinc-300'}
                                `}
                            >
                                <i className={`${tab.icon} mr-2 text-lg`} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {activeTab === 'general' && <GeneralSettings />}
                    {activeTab === 'order' && <OrderSettings />}
                    {activeTab === 'delivery' && <DeliverySettings />}
                    {activeTab === 'packaging' && <PackagingSettings />}
                    {activeTab === 'email' && <EmailSettings />}
                    {activeTab === 'system' && <SystemSettings />}
                    {activeTab === 'assets' && <AssetSettings />}
                </div>
            </div>
        </Container>
    );
};

export default Settings;

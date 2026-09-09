import React from 'react';
import Container from '../../../components/shared/Container';
import RolePermissionsGrid from '../components/RolePermissionsGrid';

const PermissionsManagement: React.FC = () => {
    return (
        <Container>
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-mauve-200 dark:border-mauve-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                                <i className="ri-shield-keyhole-line text-xl" />
                            </span>
                            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                                Access Control & Permissions
                            </h2>
                        </div>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                            Dynamically configure module and endpoint access rights for each staff role.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-300">
                        <i className="ri-information-line text-sm" />
                        <span>Changes take effect immediately across all sessions.</span>
                    </div>
                </div>

                <RolePermissionsGrid />
            </div>
        </Container>
    );
};

export default PermissionsManagement;

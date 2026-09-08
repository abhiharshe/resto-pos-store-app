import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../app/hooks';
import { selectIsAuthenticated } from '../slices/authSlice';
import { checkUserAnyPermission } from '../../../hooks/usePermission';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredPermission?: string | string[];
    fallbackPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredPermission,
    fallbackPath,
}) => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const user = useAppSelector((state) => state.auth.user);
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
    }

    if (requiredPermission && user) {
        const perms = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
        const isAllowed = checkUserAnyPermission(user, perms);

        if (!isAllowed) {
            // Find appropriate fallback destination
            let defaultTarget = fallbackPath;
            if (!defaultTarget) {
                if (checkUserAnyPermission(user, ['dashboard:view'])) {
                    defaultTarget = '/dashboard';
                } else if (checkUserAnyPermission(user, ['pos:access'])) {
                    defaultTarget = '/pos';
                } else if (checkUserAnyPermission(user, ['kds:access'])) {
                    defaultTarget = '/kds';
                } else {
                    defaultTarget = '/profile';
                }
            }

            // Prevent infinite redirection loop if already on target path
            if (location.pathname === defaultTarget) {
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-500 flex items-center justify-center text-3xl mb-4">
                            <i className="ri-shield-cross-line" />
                        </div>
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Access Denied</h2>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-md">
                            You do not have permission to access this feature. Please contact your administrator.
                        </p>
                    </div>
                );
            }

            return <Navigate to={defaultTarget} replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;

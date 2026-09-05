import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { useGetSettingsQuery } from '../../features/settings/api/settingsApi';
import { setSettings, selectBranding } from '../../features/settings/slices/settingsSlice';
import { useGetMeQuery } from '../../features/auth/api/authApi';
import { setUser, logOut } from '../../features/auth/slices/authSlice';
import { getMediaURL } from '../../utils/api';

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useAppDispatch();
    const { accessToken, user } = useAppSelector((state) => state.auth);
    const branding = useAppSelector(selectBranding);
    
    // Fetch global settings
    const { data: settings } = useGetSettingsQuery();
    
    // Fetch user profile if token exists but user is null (e.g., after refresh)
    const { 
        data: profile, 
        isSuccess: isProfileSuccess,
        isError: isProfileError,
        isLoading: isProfileLoading
    } = useGetMeQuery(!!accessToken && !user);

    useEffect(() => {
        if (settings) {
            dispatch(setSettings(settings));
        }
    }, [settings, dispatch]);

    // Global branding sync (Title & Favicon)
    useEffect(() => {
        if (branding.isInitialized || branding.siteName) {
            document.title = branding.siteName;
            
            // Update Favicon
            const favicon = document.querySelector('link[rel="icon"]');
            if (favicon) {
                (favicon as HTMLLinkElement).href = getMediaURL(branding.faviconUrl);
            }
        }
    }, [branding]);

    useEffect(() => {
        if (isProfileSuccess && profile) {
            dispatch(setUser(profile));
        }
        if (isProfileError) {
            // If token is invalid or expired, log out
            dispatch(logOut());
        }
    }, [isProfileSuccess, profile, isProfileError, dispatch]);

    // Show a loading screen while restoring session to prevent RBAC flicker
    if (!!accessToken && !user && isProfileLoading) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-zinc-500 font-medium animate-pulse uppercase tracking-widest text-xs">Restoring Session...</p>
            </div>
        );
    }

    return <>{children}</>;
};

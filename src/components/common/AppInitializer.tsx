import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetSettingsQuery } from '../../features/settings/api/settingsApi';
import { setSettings } from '../../features/settings/slices/settingsSlice';

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch();
    const { data: settings } = useGetSettingsQuery();

    useEffect(() => {
        if (settings) {
            dispatch(setSettings(settings));
        }
    }, [settings, dispatch]);

    return <>{children}</>;
};

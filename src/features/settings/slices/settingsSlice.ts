import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SettingResponse } from '../api/settingsApi';
import { BRANDING } from '../../../constants/branding';
import { RootState } from '../../../app/store';

interface SettingsState {
    globalSettings: SettingResponse | null;
    isInitialized: boolean;
}

const initialState: SettingsState = {
    globalSettings: null,
    isInitialized: false,
};

const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        setSettings: (state, action: PayloadAction<SettingResponse>) => {
            state.globalSettings = action.payload;
            state.isInitialized = true;
        },
    },
});

export const { setSettings } = settingsSlice.actions;

export const selectBranding = (state: RootState) => {
    const settings = state.settings.globalSettings;
    return {
        siteName: settings?.meta_info?.title || BRANDING.DEFAULT_SITE_NAME,
        logoUrl: settings?.logo_url || BRANDING.DEFAULT_LOGO,
        faviconUrl: settings?.favicon_url || BRANDING.DEFAULT_FAVICON,
        isInitialized: state.settings.isInitialized,
    };
};

export default settingsSlice.reducer;

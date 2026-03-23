import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SettingResponse } from '../api/settingsApi';

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
export default settingsSlice.reducer;

import { configureStore } from '@reduxjs/toolkit';
import uiReducer from '../features/ui/slices/uiSlice';
import authReducer from '../features/auth/slices/authSlice';
import cartReducer from '../features/pos/slices/cartSlice';
import settingsReducer from '../features/settings/slices/settingsSlice';


export const store = configureStore({
    reducer: {
        ui: uiReducer,
        auth: authReducer,
        cart: cartReducer,
        settings: settingsReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

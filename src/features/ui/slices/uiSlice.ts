import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    theme: 'light' | 'dark';
    isSidebarOpen: boolean;
}
const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light';
    try {
        if (localStorage.theme) return localStorage.theme === 'dark' ? 'dark' : 'light';
    } catch (e) {
        // ignore localStorage access errors
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    if (document.documentElement.classList.contains('dark')) return 'dark';
    return 'light';
};

const initialState: UiState = {
    theme: getInitialTheme(),
    isSidebarOpen: true,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
            if (state.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            try {
                localStorage.theme = state.theme;
            } catch (e) {
                // ignore
            }
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
            if (state.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            try {
                localStorage.theme = state.theme;
            } catch (e) {
                // ignore
            }
        },
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.isSidebarOpen = action.payload;
        },
    },
});

export const { toggleTheme, setTheme, toggleSidebar, setSidebarOpen } = uiSlice.actions;
export default uiSlice.reducer;

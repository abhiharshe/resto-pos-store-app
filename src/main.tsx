import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'remixicon/fonts/remixicon.css';
import App from './App.tsx';

import { Provider } from 'react-redux';
import { store } from './app/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import InternetConnectionChecker from './components/common/InternetConnectionChecker.tsx';
import { AssetProvider } from './context/AssetContext';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
        },
    },
});

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Provider store={store}>
            <QueryClientProvider client={queryClient} >
                <InternetConnectionChecker>
                    <AssetProvider>
                        <App />
                    </AssetProvider>
                </InternetConnectionChecker>
                <ReactQueryDevtools initialIsOpen={false} buttonPosition='bottom-left' />
            </QueryClientProvider>
        </Provider>
    </StrictMode>,
)
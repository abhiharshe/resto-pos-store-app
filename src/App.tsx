import { createBrowserRouter, RouterProvider, Navigate, useRouteError, useNavigate } from 'react-router-dom';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Toaster } from 'react-hot-toast';
import AuthLayout from './components/layouts/AuthLayout';
import SessionLayout from './components/layouts/SessionLayout';
import { AppInitializer } from './components/common/AppInitializer';
import SignIn from './features/auth/pages/SignIn';
import SignUp from './features/auth/pages/SignUp';
import Forgot from './features/auth/pages/Forgot';
import Recover from './features/auth/pages/Recover';
import Dashboard from './features/dashboard/pages/Dashboard';
import StoreList from './features/stores/pages/StoreList';
import StoreCreate from './features/stores/pages/StoreCreate';
import StoreEdit from './features/stores/pages/StoreEdit';
import UserList from './features/users/pages/UserList';
import UserCreate from './features/users/pages/UserCreate';
import UserEdit from './features/users/pages/UserEdit';
import ProfilePage from './features/users/pages/ProfilePage';
import ChangePasswordPage from './features/users/pages/ChangePasswordPage';
import CategoryList from './features/category/pages/CategoryList';
import CategoryCreate from './features/category/pages/CategoryCreate';
import CategoryEdit from './features/category/pages/CategoryEdit';
import ItemList from './features/item/pages/ItemList';
import ItemCreate from './features/item/pages/ItemCreate';
import ItemEdit from './features/item/pages/ItemEdit';
import ItemPricing from './features/item/pages/ItemPricing';
import AddonGroupList from './features/item/pages/AddonGroupList';
import MenuList from './features/menu/pages/MenuList';
import MenuCreate from './features/menu/pages/MenuCreate';
import MenuEdit from './features/menu/pages/MenuEdit';
import OrderList from './features/orders/pages/OrderList';
import OrderShow from './features/orders/pages/OrderShow';
import Settings from './features/settings/pages/Settings';
import CouponList from './features/coupons/pages/CouponList';
import CouponCreate from './features/coupons/pages/CouponCreate';
import CouponEdit from './features/coupons/pages/CouponEdit';
import PromotionList from './features/promotions/pages/PromotionList';
import PromotionCreate from './features/promotions/pages/PromotionCreate';
import PromotionEdit from './features/promotions/pages/PromotionEdit';
import DealList from './features/deals/pages/DealList';
import DealCreate from './features/deals/pages/DealCreate';
import DealEdit from './features/deals/pages/DealEdit';
import DealItemsEdit from './features/deals/pages/DealItemsEdit';
import CustomerList from './features/customers/pages/CustomerList';
import CustomerDetail from './features/customers/pages/CustomerDetail';
import RecipeList from './features/recipes/pages/RecipeList';
import Pos from './features/pos/pages/Pos';
import PosLayout from './components/layouts/PosLayout';
import KdsPage from './features/kds/pages/Kds';
import AssetLibrary from './features/assets/pages/AssetLibrary';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import PublicRoute from './features/auth/components/PublicRoute';
import KdsLayout from './components/layouts/KdsLayout';

const ErrorUI = ({ message, onRetry }: { message: string, onRetry: () => void }) => (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-6">We're sorry, but an unexpected error occurred.</p>
            <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-lg text-sm text-left overflow-auto mb-8 whitespace-pre-wrap font-mono">
                {message}
            </div>
            <button
                onClick={onRetry}
                className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Try again
            </button>
        </div>
    </div>
);

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    return (
        <ErrorUI 
            message={error.message} 
            onRetry={() => {
                resetErrorBoundary();
                window.location.reload();
            }} 
        />
    );
}

function RouteErrorPage() {
    const error = useRouteError() as any;
    const navigate = useNavigate();
    const errorMessage = error?.message || error?.statusText || "Unknown error occurred";
    
    return (
        <ErrorUI 
            message={errorMessage} 
            onRetry={() => {
                navigate('/');
                window.location.reload();
            }} 
        />
    );
}


const router = createBrowserRouter([
    {
        path: '/auth',
        errorElement: <RouteErrorPage />,
        element: (
            <PublicRoute>
                <AuthLayout />
            </PublicRoute>
        ),
        children: [
            { path: 'sign-in', element: <SignIn /> },
            { path: 'sign-up', element: <SignUp /> },
            { path: 'forgot', element: <Forgot /> },
            { path: 'recover', element: <Recover /> },
            { index: true, element: <Navigate to="sign-in" replace /> },
        ]
    },
    {
        path: '/',
        errorElement: <RouteErrorPage />,
        element: (
            <ProtectedRoute>
                <SessionLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="/dashboard" replace /> },
            { path: 'dashboard', element: <Dashboard /> },
            { path: 'stores', element: <StoreList /> },
            { path: 'stores/new', element: <StoreCreate /> },
            { path: 'stores/edit/:id', element: <StoreEdit /> },
            { path: 'orders', element: <OrderList /> },
            { path: 'orders/:id', element: <OrderShow /> },
            {
                path: 'menu',
                children: [
                    { index: true, element: <MenuList /> },
                    { path: 'new', element: <MenuCreate /> },
                    { path: 'edit/:id', element: <MenuEdit /> },
                    {
                        path: 'categories',
                        children: [
                            { index: true, element: <CategoryList /> },
                            { path: 'new', element: <CategoryCreate /> },
                            { path: 'edit/:id', element: <CategoryEdit /> },
                        ]
                    },
                    { path: 'addon-groups', element: <AddonGroupList /> },
                    {
                        path: 'items',
                        children: [
                            { index: true, element: <ItemList /> },
                            { path: 'new', element: <ItemCreate /> },
                            { path: 'edit/:id', element: <ItemEdit /> },
                            { path: ':id/pricing', element: <ItemPricing /> },
                        ]
                    }
                ]
            },
            {
                path: 'users',
                children: [
                    { index: true, element: <UserList /> },
                    { path: 'new', element: <UserCreate /> },
                    { path: 'edit/:id', element: <UserEdit /> },
                ]
            },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'change-password', element: <ChangePasswordPage /> },
            { path: 'settings', element: <Settings /> },
            { path: 'assets', element: <AssetLibrary /> },
            {
                path: 'coupons',
                children: [
                    { index: true, element: <CouponList /> },
                    { path: 'new', element: <CouponCreate /> },
                    { path: 'edit/:id', element: <CouponEdit /> },
                ]
            },
            {
                path: 'promotions',
                children: [
                    { index: true, element: <PromotionList /> },
                    { path: 'new', element: <PromotionCreate /> },
                    { path: 'edit/:id', element: <PromotionEdit /> },
                ]
            },
            { path: 'deals',
                children: [
                    { index: true, element: <DealList /> },
                    { path: 'new', element: <DealCreate /> },
                    { path: 'edit/:id', element: <DealEdit /> },
                    { path: 'items/:id', element: <DealItemsEdit /> },
                ]
            },
            { path: 'recipes', element: <RecipeList /> },
            { path: 'customers', element: <CustomerList /> },
            { path: 'customers/:id', element: <CustomerDetail /> },
        ]
    }, {
        path: '/pos',
        errorElement: <RouteErrorPage />,
        element: (
            <ProtectedRoute>
                <PosLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Pos /> },
        ]
    }, {
        path: 'kds',
        errorElement: <RouteErrorPage />,
        element: (
            <ProtectedRoute>
                <KdsLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true, element: <KdsPage />
            }
        ]
    },
    {
        path: '*',
        element: <Navigate to="/dashboard" replace />
    }
]);

const App = () => {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => { window.location.reload() }}>
            <AppInitializer>
                <Toaster position="top-right" />
                <RouterProvider router={router} />
            </AppInitializer>
        </ErrorBoundary>
    );
};

export default App;

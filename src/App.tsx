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
import PermissionsManagement from './features/permissions/pages/PermissionsManagement';
import ApprovalList from './features/approvals/pages/ApprovalList';
import FloorTableManagement from './features/tables/pages/FloorTableManagement';
import ReservationList from './features/reservations/pages/ReservationList';
import WeeklyPlanSettings from './features/reservations/pages/WeeklyPlanSettings';
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
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
            message={(error as any)?.message || 'Unknown error'}
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
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute requiredPermission="dashboard:view">
                        <Dashboard />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'stores',
                element: <StoreList />,
            },
            { path: 'stores/new', element: <StoreCreate /> },
            { path: 'stores/edit/:id', element: <StoreEdit /> },
            {
                path: 'tables',
                element: (
                    <ProtectedRoute requiredPermission="floors:manage">
                        <FloorTableManagement />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'reservations',
                element: (
                    <ProtectedRoute requiredPermission={['reservations:manage', 'reservations:view']}>
                        <ReservationList />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'reservations/settings',
                element: (
                    <ProtectedRoute requiredPermission="reservations:manage">
                        <WeeklyPlanSettings />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'orders',
                element: (
                    <ProtectedRoute requiredPermission="orders:manage">
                        <OrderList />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'orders/:id',
                element: (
                    <ProtectedRoute requiredPermission="orders:manage">
                        <OrderShow />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'menu',
                element: (
                    <ProtectedRoute requiredPermission="menu:manage">
                        <MenuList />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'menu/new',
                element: (
                    <ProtectedRoute requiredPermission="menu:manage">
                        <MenuCreate />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'menu/edit/:id',
                element: (
                    <ProtectedRoute requiredPermission="menu:manage">
                        <MenuEdit />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'menu/categories',
                element: (
                    <ProtectedRoute requiredPermission="menu:manage">
                        <CategoryList />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'menu/categories/new',
                element: (
                    <ProtectedRoute requiredPermission="menu:manage">
                        <CategoryCreate />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'menu/categories/edit/:id',
                element: (
                    <ProtectedRoute requiredPermission="menu:manage">
                        <CategoryEdit />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'menu/addon-groups',
                element: (
                    <ProtectedRoute requiredPermission="menu:manage">
                        <AddonGroupList />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'menu/items',
                element: (
                    <ProtectedRoute requiredPermission="menu:manage">
                        <ItemList />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'menu/items/new',
                element: (
                    <ProtectedRoute requiredPermission="menu:manage">
                        <ItemCreate />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'menu/items/edit/:id',
                element: (
                    <ProtectedRoute requiredPermission="menu:manage">
                        <ItemEdit />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'menu/items/:id/pricing',
                element: (
                    <ProtectedRoute requiredPermission="menu:manage">
                        <ItemPricing />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'users',
                children: [
                    {
                        index: true,
                        element: (
                            <ProtectedRoute requiredPermission="users:manage">
                                <UserList />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'new',
                        element: (
                            <ProtectedRoute requiredPermission="users:manage">
                                <UserCreate />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'edit/:id',
                        element: (
                            <ProtectedRoute requiredPermission="users:manage">
                                <UserEdit />
                            </ProtectedRoute>
                        ),
                    },
                ]
            },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'change-password', element: <ChangePasswordPage /> },
            {
                path: 'settings',
                element: (
                    <ProtectedRoute requiredPermission={['settings:manage', 'stores:manage']}>
                        <Settings />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'permissions',
                element: (
                    <ProtectedRoute requiredPermission="permissions:manage">
                        <PermissionsManagement />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'approvals',
                element: (
                    <ProtectedRoute>
                        <ApprovalList />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'assets',
                element: (
                    <ProtectedRoute requiredPermission="assets:manage">
                        <AssetLibrary />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'coupons',
                children: [
                    {
                        index: true,
                        element: (
                            <ProtectedRoute requiredPermission="coupons:manage">
                                <CouponList />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'new',
                        element: (
                            <ProtectedRoute requiredPermission="coupons:manage">
                                <CouponCreate />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'edit/:id',
                        element: (
                            <ProtectedRoute requiredPermission="coupons:manage">
                                <CouponEdit />
                            </ProtectedRoute>
                        ),
                    },
                ]
            },
            {
                path: 'promotions',
                children: [
                    {
                        index: true,
                        element: (
                            <ProtectedRoute requiredPermission="promotions:manage">
                                <PromotionList />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'new',
                        element: (
                            <ProtectedRoute requiredPermission="promotions:manage">
                                <PromotionCreate />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'edit/:id',
                        element: (
                            <ProtectedRoute requiredPermission="promotions:manage">
                                <PromotionEdit />
                            </ProtectedRoute>
                        ),
                    },
                ]
            },
            {
                path: 'deals',
                children: [
                    {
                        index: true,
                        element: (
                            <ProtectedRoute requiredPermission="deals:manage">
                                <DealList />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'new',
                        element: (
                            <ProtectedRoute requiredPermission="deals:manage">
                                <DealCreate />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'edit/:id',
                        element: (
                            <ProtectedRoute requiredPermission="deals:manage">
                                <DealEdit />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'items/:id',
                        element: (
                            <ProtectedRoute requiredPermission="deals:manage">
                                <DealItemsEdit />
                            </ProtectedRoute>
                        ),
                    },
                ]
            },
            {
                path: 'recipes',
                element: (
                    <ProtectedRoute requiredPermission="recipes:manage">
                        <RecipeList />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'customers',
                element: (
                    <ProtectedRoute requiredPermission="customers:view">
                        <CustomerList />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'customers/:id',
                element: (
                    <ProtectedRoute requiredPermission="customers:view">
                        <CustomerDetail />
                    </ProtectedRoute>
                ),
            },
        ]
    }, {
        path: '/pos',
        errorElement: <RouteErrorPage />,
        element: (
            <ProtectedRoute requiredPermission="pos:access">
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
            <ProtectedRoute requiredPermission="kds:access">
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

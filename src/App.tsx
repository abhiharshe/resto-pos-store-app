import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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
import CategoryList from './features/category/pages/CategoryList';
import CategoryCreate from './features/category/pages/CategoryCreate';
import CategoryEdit from './features/category/pages/CategoryEdit';
import ItemList from './features/item/pages/ItemList';
import ItemCreate from './features/item/pages/ItemCreate';
import ItemEdit from './features/item/pages/ItemEdit';
import AddonGroupList from './features/item/pages/AddonGroupList';
import MenuList from './features/menu/pages/MenuList';
import MenuCreate from './features/menu/pages/MenuCreate';
import MenuEdit from './features/menu/pages/MenuEdit';
import OrderList from './features/orders/pages/OrderList';
import OrderShow from './features/orders/pages/OrderShow';
import Settings from './features/settings/pages/Settings';
import Pos from './features/pos/pages/Pos';
import PosLayout from './components/layouts/PosLayout';
import KdsPage from './features/kds/pages/Kds';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import PublicRoute from './features/auth/components/PublicRoute';
import KdsLayout from './components/layouts/KdsLayout';

const router = createBrowserRouter([
    {
        path: '/auth',
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
            { path: 'settings', element: <Settings /> },
        ]
    }, {
        path: '/pos',
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
        <AppInitializer>
            <Toaster position="top-right" />
            <RouterProvider router={router} />
        </AppInitializer>
    );
};

export default App;

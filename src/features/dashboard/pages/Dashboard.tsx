import { useAppSelector } from '../../../app/hooks';
import AdminDashboard from '../components/AdminDashboard';
import ManagerDashboard from '../components/ManagerDashboard';
import CashierDashboard from '../components/CashierDashboard';
import ChefDashboard from '../components/ChefDashboard';
import Container from '../../../components/shared/Container';

const Dashboard = () => {
    const { user } = useAppSelector((state) => state.auth);

    const renderDashboard = () => {
        const role = user?.role;

        switch (role) {
            case 'SUPER_ADMIN':
                return <AdminDashboard />;
            case 'STORE_ADMIN':
            case 'MANAGER':
                return <ManagerDashboard />;
            case 'CASHIER':
                return <CashierDashboard />;
            case 'KITCHEN':
                return <ChefDashboard />;
            default:
                return (
                    <div className="flex h-64 items-center justify-center">
                        <div className="text-center space-y-2">
                            <i className="ri-error-warning-line text-4xl text-zinc-300 mb-2" />
                            <p className="text-zinc-500 font-medium tracking-tight">You don't have access to a specific dashboard.</p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Container>
            {renderDashboard()}
        </Container>
    );
};

export default Dashboard;

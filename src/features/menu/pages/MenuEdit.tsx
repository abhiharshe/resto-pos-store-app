import { useNavigate, useParams } from 'react-router-dom';
import { useMenus, useUpdateMenu } from '../api/menuApi';
import MenuForm from '../components/MenuForm';

const MenuEdit = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: menus, isLoading: isFetching } = useMenus();
    const updateMutation = useUpdateMenu();

    const menu = menus?.find(m => m.id === Number(id));

    const handleSubmit = async (values: any) => {
        if (!id) return;
        try {
            await updateMutation.mutateAsync({ id: Number(id), ...values });
            navigate('/menu');
        } catch (error) {
            console.error('Error updating menu:', error);
        }
    };

    if (isFetching) return <div className="py-10 text-center">Loading menu...</div>;
    if (!menu) return <div className="py-10 text-center">Menu not found.</div>;

    return (
        <div className="p-4 max-w-2xl mx-auto space-y-6">
            <MenuForm
                title="Edit Menu"
                initialValues={menu}
                onSubmit={handleSubmit}
                isLoading={updateMutation.isPending}
            />
        </div>
    );
};

export default MenuEdit;

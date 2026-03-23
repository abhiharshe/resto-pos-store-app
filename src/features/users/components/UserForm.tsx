import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { User } from '../api/usersApi';
import { useNavigate } from 'react-router-dom';
import { useStores } from '../../stores/api/storesApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import Card from '../../../components/common/Card';

const UserSchema = Yup.object().shape({
    full_name: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    role: Yup.string().required('Role is required'),
    password: Yup.string().when('isNew', {
        is: true,
        then: (schema) => schema.required('Password is required').min(6, 'Minimum 6 characters'),
        otherwise: (schema) => schema.optional(),
    }),
});

interface UserFormProps {
    initialValues?: Partial<User> & { password?: string };
    onSubmit: (values: any) => Promise<void>;
    isLoading?: boolean;
    onCancel: () => void;
    title: string;
}

export const UserForm = ({ initialValues, onSubmit, isLoading, onCancel, title }: UserFormProps) => {
    const navigate = useNavigate();
    const { data: stores } = useStores();

    const storeOptions = [
        { label: 'No Specific Store', value: '' },
        ...(stores?.map(store => ({ label: store.name, value: store.id })) || [])
    ];

    const roleOptions = [
        { label: 'Store Admin', value: 'STORE_ADMIN' },
        { label: 'Manager', value: 'MANAGER' },
        { label: 'Cashier', value: 'CASHIER' },
        { label: 'Kitchen', value: 'KITCHEN' }
    ];

    const defaultInitialValues = {
        full_name: '',
        email: '',
        password: '',
        role: 'CASHIER',
        store_id: initialValues?.store_id || '',
        is_active: true,
        isNew: !initialValues?.id,
        ...initialValues
    };

    return (
        <Card className="max-w-xl mx-auto border-indigo-500 shadow-md">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">{initialValues ? 'Update details for ' + initialValues.full_name : 'Fill the form to create a new user'}</p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/users')} icon="ri-arrow-left-line">
                    Back to List
                </Button>
            </div>

            <Formik
                initialValues={defaultInitialValues}
                enableReinitialize
                validationSchema={UserSchema}
                onSubmit={onSubmit}
            >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
                    <Form className="space-y-6">
                        <Input
                            label="Full Name"
                            name="full_name"
                            placeholder="John Doe"
                            value={values.full_name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.full_name && errors.full_name ? (errors.full_name as string) : undefined}
                            required
                        />
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            error={touched.email && errors.email ? (errors.email as string) : undefined}
                            required
                        />

                        {!initialValues?.id && (
                            <Input
                                label="Password"
                                name="password"
                                type="password"
                                placeholder="******"
                                value={values.password}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.password && errors.password ? (errors.password as string) : undefined}
                                required
                            />
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Role"
                                placeholder="Select a role..."
                                options={roleOptions}
                                value={values.role}
                                onChange={(val) => setFieldValue('role', val)}
                                error={touched.role && errors.role ? (errors.role as string) : undefined}
                                required
                            />
                            <Select
                                label="Assigned Store"
                                placeholder="Select a store..."
                                options={storeOptions}
                                value={values.store_id || ''}
                                onChange={(val) => setFieldValue('store_id', val)}
                            />
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center h-5">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={values.is_active}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500"
                                />
                            </div>
                            <div className="text-sm leading-6">
                                <label htmlFor="is_active" className="font-medium text-zinc-900 dark:text-white">Active Status</label>
                                <p className="text-zinc-500">Enable or disable this user account.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <Button
                                type="submit"
                                className="flex-1"
                                isLoading={isLoading || isSubmitting}
                            >
                                Save User
                            </Button>
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onCancel}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Card>
    );
};

import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { User } from '../api/usersApi';
import { useNavigate } from 'react-router-dom';
import { useStores } from '../../stores/api/storesApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import Card from '../../../components/common/Card';
import AssetUpload from '../../../components/common/AssetUpload';
import { useAssets } from '../../../hooks/useAssets';
import { useState } from 'react';
import { getMediaURL } from '../../../utils/api';

import { useAppSelector } from '../../../app/hooks';

const UserSchema = Yup.object().shape({
    full_name: Yup.string().required('Full name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    role: Yup.string().required('Role is required'),
    store_id: Yup.string().when('role', {
        is: (role: string) => role && role !== 'SUPER_ADMIN',
        then: (schema) => schema.required('Non-Admin users must be assigned to a store'),
        otherwise: (schema) => schema.nullable().optional(),
    }),
    password: Yup.string().when('isNew', {
        is: true,
        then: (schema) => schema.required('Password is required').min(8, 'Minimum 8 characters'),
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
    const { user: currentUser } = useAppSelector((state) => state.auth);
    const { data: stores } = useStores();
    const [showUploader, setShowUploader] = useState(false);

    // Fetch assets for existing users
    const { assets, refetch } = useAssets('User', initialValues?.id || '');

    const avatar = assets?.[0]; // Assume first asset is the avatar for now

    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
    const isTargetSuperAdmin = initialValues?.role === 'SUPER_ADMIN';
    const isSelf = currentUser?.id === initialValues?.id;

    // Store options: Super Admin can choose any store; others are locked to their own store
    const storeOptions = isSuperAdmin
        ? [
            { label: 'No Specific Store', value: '' },
            ...(stores?.map(store => ({ label: store.name, value: store.id })) || [])
        ]
        : (stores?.filter(s => s.id === currentUser?.store_id).map(store => ({ label: store.name, value: store.id })) || [
            { label: 'My Store', value: currentUser?.store_id || '' }
        ]);

    // Role options based on currentUser role
    let roleOptions = [
        { label: 'Super Admin', value: 'SUPER_ADMIN' },
        { label: 'Store Admin', value: 'STORE_ADMIN' },
        { label: 'Manager', value: 'MANAGER' },
        { label: 'Cashier', value: 'CASHIER' },
        { label: 'Kitchen', value: 'KITCHEN' }
    ];

    if (!isSuperAdmin) {
        if (currentUser?.role === 'STORE_ADMIN') {
            roleOptions = roleOptions.filter(r => r.value !== 'SUPER_ADMIN');
        } else if (currentUser?.role === 'MANAGER') {
            roleOptions = roleOptions.filter(r => !['SUPER_ADMIN', 'STORE_ADMIN'].includes(r.value));
        }
    }

    const defaultInitialValues = {
        full_name: '',
        email: '',
        password: '',
        role: 'CASHIER',
        store_id: initialValues?.store_id || (!isSuperAdmin ? currentUser?.store_id || '' : ''),
        is_active: true,
        isNew: !initialValues?.id,
        ...initialValues
    };

    return (
        <div className="max-w-4xl">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">{initialValues?.id ? 'Update details for ' + initialValues.full_name : 'Fill the form to create a new user'}</p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/users')} icon="ri-arrow-left-line">
                    Back to List
                </Button>
            </div>

            <Card className="w-full mb-6">
                <div className="mb-8 flex flex-col items-center">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                            {avatar?.url ? (
                                <img src={getMediaURL(avatar.variants?.medium || avatar.url)} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <i className="ri-user-line text-5xl text-zinc-400"></i>
                            )}
                        </div>

                        {initialValues?.id && (
                            <button
                                onClick={() => setShowUploader(!showUploader)}
                                className="absolute bottom-1 right-1 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                            >
                                <i className={showUploader ? "ri-close-line" : "ri-camera-line"}></i>
                            </button>
                        )}
                    </div>

                    <AssetUpload
                        isOpen={showUploader}
                        onClose={() => setShowUploader(false)}
                        entityType="User"
                        entityId={initialValues?.id || ''}
                        allowedTypes={['image/*']}
                        multiple={false}
                        onUploadComplete={() => {
                            setShowUploader(false);
                            refetch();
                        }}
                    />

                    {!initialValues?.id && (
                        <p className="mt-2 text-xs text-zinc-500 italic">Avatar can be uploaded after user creation.</p>
                    )}

                    {isTargetSuperAdmin && !isSelf && (
                        <div className="w-full mt-4 p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-sm flex items-center gap-2">
                            <i className="ri-shield-user-line text-lg text-amber-600" />
                            <span>This is a Super Admin user. Only this Super Admin can update their own account information.</span>
                        </div>
                    )}
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
                                    onChange={(val) => {
                                        setFieldValue('role', val);
                                        if (val === 'SUPER_ADMIN') {
                                            setFieldValue('store_id', '');
                                        }
                                    }}
                                    error={touched.role && errors.role ? (errors.role as string) : undefined}
                                    required
                                />
                                <Select
                                    label="Assigned Store"
                                    placeholder="Select a store..."
                                    options={storeOptions}
                                    value={values.store_id || ''}
                                    onChange={(val) => setFieldValue('store_id', val)}
                                    error={touched.store_id && errors.store_id ? (errors.store_id as string) : undefined}
                                    required={values.role !== 'SUPER_ADMIN'}
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
                                    isLoading={isLoading || isSubmitting}
                                    disabled={isTargetSuperAdmin && !isSelf}
                                >
                                    Save User
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </div>
    );
};

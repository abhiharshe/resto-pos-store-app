import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { useMe, useUpdateMe } from '../api/usersApi';
import Card from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import AssetUpload from '../../../components/common/AssetUpload';
import { getMediaURL } from '../../../utils/api';

const ProfileSchema = Yup.object().shape({
    full_name: Yup.string()
        .min(2, 'Too Short!')
        .max(50, 'Too Long!')
        .required('Full name is required'),
    email: Yup.string()
        .email('Invalid email')
        .required('Email is required'),
});

const ProfilePage: React.FC = () => {
    const { data: user, isLoading: isUserLoading, refetch } = useMe();
    const updateMeMutation = useUpdateMe();
    const [showUploader, setShowUploader] = useState(false);

    if (isUserLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                    <p className="text-zinc-500 font-medium animate-pulse">Loading profile...</p>
                </div>
            </div>
        );
    }

    const onSubmit = async (values: { full_name: string; email: string }) => {
        try {
            await updateMeMutation.mutateAsync(values);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to update profile');
        }
    };

    const avatarUrl = user?.avatar?.variants?.medium || user?.avatar?.url;

    return (
        <div className="max-w-5xl mx-auto py-10 px-4">
            {/* Header / Cover Section */}
            <div className="relative mb-20">
                <div className="h-48 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                </div>

                {/* Avatar Overlay */}
                <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                    <div className="relative group">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-8 border-white dark:border-zinc-900 shadow-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            {avatarUrl ? (
                                <img src={getMediaURL(avatarUrl)} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" />
                            ) : (
                                <i className="ri-user-line text-6xl text-zinc-300 dark:text-zinc-600"></i>
                            )}
                        </div>
                        <button
                            onClick={() => setShowUploader(!showUploader)}
                            className="absolute -bottom-2 -right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95"
                            title="Update Profile Picture"
                        >
                            <i className={showUploader ? "ri-close-line text-lg" : "ri-camera-fill text-lg"}></i>
                        </button>
                    </div>

                    <div className="pb-4 hidden md:block">
                        <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                            {user?.full_name}
                        </h1>
                        <p className="text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide uppercase text-xs flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            {user?.role?.replace('_', ' ')} Account
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                {/* Left Sidebar Info */}
                <div className="space-y-6">
                    <Card className="p-6 border-none shadow-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm">
                        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-4">Account Status</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">Status</span>
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-lg uppercase">Active</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">Store ID</span>
                                <span className="text-sm font-mono text-zinc-900 dark:text-zinc-200">{user?.store_id ? user.store_id.substring(0, 8) + '...' : 'Global'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">Member Since</span>
                                <span className="text-sm text-zinc-900 dark:text-zinc-200">May 2026</span>
                            </div>
                        </div>
                    </Card>

                    <AssetUpload
                        isOpen={showUploader}
                        onClose={() => setShowUploader(false)}
                        entityType="User"
                        entityId={user?.id || ''}
                        allowedTypes={['image/*']}
                        multiple={false}
                        onUploadComplete={() => {
                            setShowUploader(false);
                            refetch();
                            toast.success('Profile picture updated');
                        }}
                    />
                </div>

                {/* Main Content: Forms */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 border-none shadow-xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                <i className="ri-user-settings-line text-xl"></i>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Profile Information</h2>
                                <p className="text-sm text-zinc-500">Update your account details and contact information.</p>
                            </div>
                        </div>

                        <Formik
                            initialValues={{
                                full_name: user?.full_name || '',
                                email: user?.email || '',
                            }}
                            validationSchema={ProfileSchema}
                            onSubmit={onSubmit}
                            enableReinitialize
                        >
                            {({ values, errors, touched, handleChange, handleBlur, dirty }) => (
                                <Form className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input
                                            label="Full Name"
                                            name="full_name"
                                            placeholder="Enter your full name"
                                            value={values.full_name}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.full_name && errors.full_name ? errors.full_name : undefined}
                                            icon="ri-user-smile-line"
                                            required
                                        />

                                        <Input
                                            label="Email Address"
                                            name="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            value={values.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={touched.email && errors.email ? errors.email : undefined}
                                            icon="ri-mail-line"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => refetch()}
                                            disabled={!dirty || updateMeMutation.isPending}
                                        >
                                            Reset Changes
                                        </Button>
                                        <Button
                                            type="submit"
                                            isLoading={updateMeMutation.isPending}
                                            disabled={!dirty}
                                            icon="ri-save-line"
                                            className="px-8"
                                        >
                                            Save Changes
                                        </Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </Card>

                    <Card className="p-8 border-none shadow-xl bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-800 dark:to-zinc-900">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
                                    <i className="ri-shield-keyhole-line text-xl"></i>
                                </div>
                                <div>
                                    <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Security & Privacy</h2>
                                    <p className="text-sm text-zinc-500">Keep your account secure with a strong password.</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => window.location.href = '/change-password'}
                                icon="ri-lock-password-line"
                            >
                                Change Password
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;

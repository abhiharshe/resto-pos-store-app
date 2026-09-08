import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { Asset, Category, useMenus } from '../../menu/api/menuApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import Card from '../../../components/common/Card';
import AssetUpload from '../../../components/common/AssetUpload';
import { useAssets } from '../../../hooks/useAssets';
import { useState } from 'react';

const CategorySchema = Yup.object().shape({
    name: Yup.string().required('Category name is required').min(2, 'Too short'),
    menu_id: Yup.string().required('Menu selection is required').min(1, 'Please select a menu'),
    is_active: Yup.boolean().default(true),
});

interface CategoryFormProps {
    initialValues?: Partial<Category>;
    onSubmit: (values: any) => Promise<void>;
    isLoading?: boolean;
    onCancel: () => void;
    title: string;
}

export const CategoryForm = ({ initialValues, onSubmit, isLoading, onCancel, title }: CategoryFormProps) => {
    const navigate = useNavigate();
    const { data: menus } = useMenus();
    const [showUploader, setShowUploader] = useState(false);

    // Fetch assets for existing categories
    const { assets, refetch } = useAssets('MenuCategory', initialValues?.id || '');
    const categoryImage = assets?.[0]; // Assume first asset is the main image

    const menuOptions = menus?.map(m => ({ label: m.title, value: m.id })) || [];

    const defaultInitialValues = {
        name: '',
        menu_id: '',
        is_active: true,
        ...initialValues
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">{initialValues ? 'Update configuration for ' + initialValues.name : 'Fill the form to create a new category'}</p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/menu/categories')} icon="ri-arrow-left-line">
                    Back to List
                </Button>
            </div>
            <Card className="max-w-4xl shadow-md">
                <Formik
                    initialValues={defaultInitialValues}
                    enableReinitialize
                    validationSchema={CategorySchema}
                    onSubmit={onSubmit}
                >
                    {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
                        <Form className="space-y-6">
                            <Select
                                label="Assigned Menu"
                                placeholder="Select a menu..."
                                options={menuOptions}
                                value={values.menu_id || ''}
                                onChange={(val) => setFieldValue('menu_id', val)}
                                error={touched.menu_id && errors.menu_id ? (errors.menu_id as string) : undefined}
                                required
                            />
                            <Input
                                label="Category Name"
                                name="name"
                                placeholder="e.g. Beverages, Mains"
                                value={values.name}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                error={touched.name && errors.name ? (errors.name as string) : undefined}
                                required
                            />

                            <div className="space-y-4">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category Image</label>

                                <div className="flex flex-col items-start">
                                    <div className="relative group">
                                        <div className="w-full aspect-video max-w-[400px] rounded-xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-center">
                                            {categoryImage?.url ? (
                                                <img src={categoryImage.url} alt="Category" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center text-zinc-400 p-16">
                                                    <i className="ri-image-line text-4xl mb-2"></i>
                                                    <span className="text-xs">No image uploaded</span>
                                                </div>
                                            )}
                                        </div>

                                        {initialValues?.id && (
                                            <button
                                                type="button"
                                                onClick={() => setShowUploader(!showUploader)}
                                                className="absolute bottom-2 right-2 w-10 h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110"
                                            >
                                                <i className={showUploader ? "ri-close-line" : "ri-camera-line"}></i>
                                            </button>
                                        )}
                                    </div>

                                    {!initialValues?.id && (
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 italic">
                                            * You can upload the category image after creating it.
                                        </p>
                                    )}

                                    <AssetUpload
                                        isOpen={showUploader}
                                        onClose={() => setShowUploader(false)}
                                        entityType="MenuCategory"
                                        entityId={initialValues?.id || ''}
                                        multiple={false}
                                        allowedTypes={['image/*']}
                                        onUploadComplete={() => {
                                            refetch();
                                            setShowUploader(false);
                                        }}
                                    />
                                </div>
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
                                    <p className="text-zinc-500">Show this category on the customer storefront.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <Button
                                    type="submit"
                                    isLoading={isLoading || isSubmitting}
                                >
                                    Save Category
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

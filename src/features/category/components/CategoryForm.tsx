import { useRef } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { Category, useMenus, useUploadImage } from '../../menu/api/menuApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import Card from '../../../components/common/Card';

const CategorySchema = Yup.object().shape({
    name: Yup.string().required('Category name is required').min(2, 'Too short'),
    menu_id: Yup.number().required('Menu selection is required').min(1, 'Please select a menu'),
    image_url: Yup.string().nullable(),
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
    const uploadMutation = useUploadImage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const menuOptions = menus?.map(m => ({ label: m.title, value: m.id })) || [];

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, setFieldValue: (field: string, value: any) => void) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const result = await uploadMutation.mutateAsync(file);
                setFieldValue('image_url', result.url);
            } catch (error) {
                console.error('Image upload failed:', error);
            }
        }
    };

    const defaultInitialValues = {
        name: '',
        menu_id: 0,
        image_url: '',
        is_active: true,
        ...initialValues
    };

    return (
        <Card className="max-w-2xl mx-auto border-indigo-500 shadow-md">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">{initialValues ? 'Update configuration for ' + initialValues.name : 'Fill the form to create a new category'}</p>
                </div>
                <Button variant="ghost" onClick={() => navigate('/menu/categories')} icon="ri-arrow-left-line">
                    Back to List
                </Button>
            </div>

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

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Category Image</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors bg-zinc-50 dark:bg-zinc-900/50"
                            >
                                {values.image_url ? (
                                    <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden shadow-sm">
                                        <img src={`http://127.0.0.1:8000${values.image_url}`} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-medium">Change Image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-3">
                                            <i className="ri-upload-2-line text-2xl text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        <span className="text-sm font-medium text-zinc-900 dark:text-white">Upload Category Image</span>
                                        <span className="text-xs text-zinc-500 mt-1">Recommended: 600x600px</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, setFieldValue)}
                                />
                            </div>
                            {uploadMutation.isPending && <p className="text-xs text-indigo-600 animate-pulse font-medium">Uploading image...</p>}
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
                                className="flex-1"
                                isLoading={isLoading || isSubmitting}
                            >
                                Save Category
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

import { useNavigate, useLocation } from 'react-router-dom';
import * as Yup from 'yup';
import { MenuItem, useCategories, useAddonGroups } from '../../menu/api/menuApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Checkbox } from '../../../components/common/Checkbox';
import Card from '../../../components/common/Card';
import AssetUpload from '../../../components/common/AssetUpload';
import { useAssets } from '../../../hooks/useAssets';
import { useState } from 'react';
import { Formik, Form } from 'formik';
import { getMediaURL } from '../../../utils/api';

const ItemSchema = Yup.object().shape({
    name: Yup.string()
        .required('Item name is required')
        .min(4, 'Minimum 4 characters')
        .matches(/^[a-zA-Z0-9 ]+$/, 'Only text, numbers and spaces are allowed'),
    category_id: Yup.string().required('Please select a category'),
    description: Yup.string().nullable(),
    is_active: Yup.boolean().default(true),
    is_pickup: Yup.boolean().default(true),
    is_dine_in: Yup.boolean().default(true),
    is_delivery: Yup.boolean().default(true),
    addon_group_ids: Yup.array().of(Yup.string())
});

interface ItemFormProps {
    initialValues?: Partial<MenuItem> & { addon_group_ids?: string[] };
    onSubmit: (values: any) => Promise<void>;
    isLoading?: boolean;
    title: string;
}

export const ItemForm = ({ initialValues, onSubmit, isLoading, title }: ItemFormProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { data: categories } = useCategories();
    const [showUploader, setShowUploader] = useState(false);

    // Fetch assets for existing items
    const { assets, deleteAsset, refetch } = useAssets('MenuItem', initialValues?.id || '');

    const categoryOptions = categories?.map((c: any) => ({ label: c.name, value: c.id })) || [];

    const defaultInitialValues = {
        name: '',
        category_id: '',
        description: '',
        is_active: true,
        is_pickup: true,
        is_dine_in: true,
        is_delivery: true,
        addon_group_ids: (initialValues as any)?.addon_groups?.map((g: any) => g.id) || [],
        ...initialValues
    };

    const { data: addonGroups } = useAddonGroups();
    const addonGroupOptions = addonGroups?.map((g: any) => ({ label: g.name, value: g.id })) || [];

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">{title}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400">{initialValues ? 'Update details for ' + initialValues.name : 'Fill the form to create a new item'}</p>
                </div>
                <div className='flex gap-2'>
                    {
                        location.pathname.includes('edit') && (
                            <Button
                                variant="outline"
                                icon='ri-edit-box-line'
                                onClick={() => navigate(`/menu/items/${initialValues?.id}/pricing`)}
                            >
                                Edit Pricing
                            </Button>
                        )
                    }
                    <Button
                        variant="ghost"
                        icon='ri-arrow-left-line'
                        onClick={() => navigate('/menu/items')}
                    >
                        Back to List
                    </Button>
                </div>
            </div>
            <Card className='w-full'>
                <Formik
                    initialValues={defaultInitialValues}
                    validationSchema={ItemSchema}
                    onSubmit={onSubmit}
                    enableReinitialize
                >
                    {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
                        <Form className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <Select
                                        label="Category"
                                        placeholder="Select a category..."
                                        options={categoryOptions}
                                        value={values.category_id}
                                        onChange={(val) => setFieldValue('category_id', val)}
                                        error={touched.category_id && errors.category_id ? (errors.category_id as string) : undefined}
                                        required
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Input
                                        label="Item Name"
                                        name="name"
                                        placeholder="e.g. Masala Dosa"
                                        value={values.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.name && errors.name ? (errors.name as string) : undefined}
                                        required
                                    />
                                </div>
                            </div>



                            <div className="space-y-1">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
                                <textarea
                                    name="description"
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm text-zinc-900 dark:text-white bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                    placeholder="Brief description of the item..."
                                    value={values.description}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                        Item Gallery ({assets.length}/3)
                                    </label>
                                    {initialValues?.id && (
                                        <button
                                            type="button"
                                            onClick={() => setShowUploader(!showUploader)}
                                            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                                        >
                                            <i className={showUploader ? "ri-close-line" : "ri-add-line"} />
                                            {showUploader ? 'Close Uploader' : 'Add Media'}
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {assets.map((asset: any) => (
                                        <div key={asset.id} className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group">
                                            <img
                                                src={getMediaURL(asset.variants?.medium || asset.url)}
                                                alt="Gallery"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => deleteAsset(asset.id)}
                                                    className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                                                    title="Delete image"
                                                >
                                                    <i className="ri-delete-bin-line" />
                                                </button>
                                            </div>
                                            {asset.status !== 'ready' && (
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {!initialValues?.id && (
                                        <div className="col-span-full p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                                            <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                                <i className="ri-information-line text-lg" />
                                                Media gallery will be available after creating the item.
                                            </p>
                                        </div>
                                    )}

                                    <AssetUpload
                                        isOpen={showUploader}
                                        onClose={() => setShowUploader(false)}
                                        entityType="MenuItem"
                                        entityId={initialValues?.id || ''}
                                        multiple={true}
                                        maxSize={5}
                                        allowedTypes={['image/*']}
                                        onUploadComplete={() => {
                                            refetch();
                                            if (assets.length + 1 >= 3) setShowUploader(false);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <Select
                                    label="Add-on Groups"
                                    placeholder="Select addon groups (Optional)"
                                    options={addonGroupOptions}
                                    value={values.addon_group_ids}
                                    onChange={(val) => setFieldValue('addon_group_ids', val)}
                                    multiple={true}
                                />
                                <p className="text-[10px] text-zinc-500 mt-1">Select one or more groups that apply to this item. You can also remove items by clicking the "x" on the tags.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                <Checkbox
                                    id="is_active"
                                    name="is_active"
                                    checked={values.is_active}
                                    onChange={handleChange}
                                    label="Active"
                                />
                                <Checkbox
                                    id="is_pickup"
                                    name="is_pickup"
                                    checked={values.is_pickup}
                                    onChange={handleChange}
                                    label="Pickup"
                                />
                                <Checkbox
                                    id="is_dine_in"
                                    name="is_dine_in"
                                    checked={values.is_dine_in}
                                    onChange={handleChange}
                                    label="Dine-In"
                                />
                                <Checkbox
                                    id="is_delivery"
                                    name="is_delivery"
                                    checked={values.is_delivery}
                                    onChange={handleChange}
                                    label="Delivery"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    isLoading={isLoading || isSubmitting}
                                >
                                    {initialValues?.id ? 'Update Item' : 'Create Item'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/menu/items')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </div >
    );
};

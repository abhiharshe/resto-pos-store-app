import { useRef } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { MenuItem, useCategories, useUploadImage, useAddonGroups } from '../../menu/api/menuApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import Card from '../../../components/common/Card';

const ItemSchema = Yup.object().shape({
    name: Yup.string()
        .required('Item name is required')
        .min(4, 'Minimum 4 characters')
        .matches(/^[a-zA-Z0-9 ]+$/, 'Only text, numbers and spaces are allowed'),
    category_id: Yup.number().required('Please select a category').min(1, 'Please select a category'),
    description: Yup.string().nullable(),
    is_active: Yup.boolean().default(true),
    image_urls: Yup.array().max(3, 'Maximum 3 images allowed'),
    addon_group_ids: Yup.array().of(Yup.number()),
    variants: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required('Variant name is required'),
            price: Yup.number().required('Price is required').min(0, 'Price cannot be negative'),
            is_serving: Yup.boolean().default(false)
        })
    ).min(1, 'At least one variant is required')
});

interface ItemFormProps {
    initialValues?: Partial<MenuItem> & { image_urls: string[]; addon_group_ids?: number[] };
    onSubmit: (values: any) => Promise<void>;
    isLoading?: boolean;
    title: string;
}

export const ItemForm = ({ initialValues, onSubmit, isLoading, title }: ItemFormProps) => {
    const navigate = useNavigate();
    const { data: categories } = useCategories();
    const uploadMutation = useUploadImage();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const categoryOptions = categories?.map((c: any) => ({ label: c.name, value: c.id })) || [];

    const defaultInitialValues = {
        name: '',
        category_id: '',
        description: '',
        is_active: true,
        image_urls: [],
        addon_group_ids: (initialValues as any)?.addon_groups?.map((g: any) => g.id) || [],
        variants: initialValues?.variants?.length ? initialValues.variants : [{ name: 'Regular', price: 0, is_serving: false }],
        ...initialValues
    };

    const { data: addonGroups } = useAddonGroups();
    const addonGroupOptions = addonGroups?.map((g: any) => ({ label: g.name, value: g.id })) || [];

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, values: any, setFieldValue: any) => {
        const files = event.target.files;
        if (!files) return;

        const currentUrlsCount = values.image_urls.length;
        const availableSlots = 3 - currentUrlsCount;

        if (availableSlots <= 0) {
            alert('Maximum 3 images allowed');
            return;
        }

        const filesToUpload = Array.from(files).slice(0, availableSlots);

        try {
            const uploadedUrls = [];
            for (const file of filesToUpload) {
                const result = await uploadMutation.mutateAsync(file);
                uploadedUrls.push(result.url);
            }
            setFieldValue('image_urls', [...values.image_urls, ...uploadedUrls]);
        } catch (error) {
            console.error('Image upload failed:', error);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/menu/items')}>
                    <i className="ri-arrow-left-line mr-1" /> Back to List
                </Button>
            </div>

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

                        {/* Variants Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Price Variants</label>
                            </div>
                            {typeof errors.variants === 'string' && (
                                <p className="text-xs text-red-500">{errors.variants}</p>
                            )}
                            <FieldArray
                                name="variants"
                                render={(arrayHelpers) => (
                                    <div className="space-y-4">
                                        {values.variants.map((variant: any, index: number) => (
                                            <div key={index} className="flex gap-4 items-start p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl relative">
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <Input
                                                        label="Variant Name"
                                                        name={`variants.${index}.name`}
                                                        placeholder="e.g. Half, Full, Large..."
                                                        value={variant.name}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={
                                                            touched.variants?.[index]?.name &&
                                                            (errors.variants as any)?.[index]?.name
                                                        }
                                                        required
                                                    />
                                                    <Input
                                                        label="Price (₹)"
                                                        name={`variants.${index}.price`}
                                                        type="number"
                                                        step="0.01"
                                                        placeholder="0.00"
                                                        value={variant.price}
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        error={
                                                            touched.variants?.[index]?.price &&
                                                            (errors.variants as any)?.[index]?.price
                                                        }
                                                        required
                                                    />
                                                    <div className="sm:col-span-2 flex items-center justify-between mt-2">
                                                        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 cursor-pointer">
                                                            <input
                                                                type="checkbox"
                                                                name={`variants.${index}.is_serving`}
                                                                checked={variant.is_serving}
                                                                onChange={handleChange}
                                                                className="rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                                                            />
                                                            Is Serving (identifies portions)
                                                        </label>
                                                    </div>
                                                </div>
                                                {values.variants.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => arrayHelpers.remove(index)}
                                                        className="mt-8 text-red-500 hover:text-red-700 transition relative"
                                                        aria-label="Remove variant"
                                                    >
                                                        <i className="ri-delete-bin-line text-lg" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => arrayHelpers.push({ name: '', price: 0, is_serving: false })}
                                            className="w-full border-dashed"
                                        >
                                            <i className="ri-add-line mr-2" /> Add Variant
                                        </Button>
                                    </div>
                                )}
                            />
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

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    Item Images ({values.image_urls.length}/3)
                                </label>
                                {values.image_urls.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                    >
                                        Add Images
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {values.image_urls.map((url: string, index: number) => (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 group">
                                        <img
                                            src={url.startsWith('http') ? url : `http://127.0.0.1:8000${url}`}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setFieldValue('image_urls', values.image_urls.filter((_: any, i: number) => i !== index))}
                                            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <i className="ri-delete-bin-line" />
                                        </button>
                                    </div>
                                ))}

                                {values.image_urls.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="aspect-square border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group"
                                    >
                                        <i className="ri-image-add-line text-2xl text-zinc-400 group-hover:text-indigo-500 mb-1" />
                                        <span className="text-xs text-zinc-500 group-hover:text-indigo-500 font-medium">Upload</span>
                                    </button>
                                )}
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImageUpload(e, values, setFieldValue)}
                            />
                            {uploadMutation.isPending && (
                                <div className="flex items-center gap-2 text-indigo-600">
                                    <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                    <span className="text-xs font-medium">Uploading images...</span>
                                </div>
                            )}
                            {errors.image_urls && (
                                <p className="text-xs text-red-500 mt-1">{errors.image_urls as string}</p>
                            )}
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

                        <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <div className="flex items-center h-5">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    name="is_active"
                                    checked={values.is_active}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-indigo-600 border-zinc-300 rounded focus:ring-indigo-500 cursor-pointer"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <label htmlFor="is_active" className="font-medium text-zinc-900 dark:text-white cursor-pointer">Available for Order</label>
                                <p className="text-zinc-500 dark:text-zinc-400 text-xs">If disabled, this item won't be visible in the digital menu.</p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                type="submit"
                                className="flex-1"
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
    );
};

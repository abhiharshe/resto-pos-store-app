import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { AddonGroup, useCreateAddonGroup, useUpdateAddonGroup, useAddAddonToGroup, useUpdateAddon, useDeleteAddon } from '../../menu/api/menuApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Checkbox } from '../../../components/common/Checkbox';
import Card from '../../../components/common/Card';
import { useConfirm } from '../../../hooks/useConfirm';

const AddonGroupSchema = Yup.object().shape({
    name: Yup.string().required('Group name is required'),
    min_selection: Yup.number().min(0, 'Cannot be negative').required('Required'),
    max_selection: Yup.number().min(Yup.ref('min_selection'), 'Max must be >= Min').required('Required'),
    max_quantity_per_addon: Yup.number().min(1, 'Min 1').required('Required'),
    addons: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required('Add-on name is required'),
            price: Yup.number().min(0, 'Cannot be negative').required('Required'),
            is_default: Yup.boolean().default(false),
        })
    )
});

interface AddonGroupFormProps {
    initialValues?: Partial<AddonGroup>;
    onCancel: () => void;
}

export const AddonGroupForm = ({ initialValues, onCancel }: AddonGroupFormProps) => {
    const createGroupMutation = useCreateAddonGroup();
    const updateGroupMutation = useUpdateAddonGroup();
    const addAddonMutation = useAddAddonToGroup();
    const updateAddonMutation = useUpdateAddon();
    const deleteAddonMutation = useDeleteAddon();
    const confirm = useConfirm();

    const handleSubmit = async (values: any) => {
        try {
            const { addons, ...groupData } = values;
            let currentGroupId = initialValues?.id;

            if (currentGroupId) {
                // Update existing group
                await updateGroupMutation.mutateAsync({ id: currentGroupId, ...groupData });

                // Handle addons
                for (const addon of addons) {
                    if (addon.id) {
                        await updateAddonMutation.mutateAsync({ id: addon.id, ...addon });
                    } else {
                        await addAddonMutation.mutateAsync({ groupId: currentGroupId, addon });
                    }
                }
            } else {
                // Create new group
                const newGroup = await createGroupMutation.mutateAsync(groupData);
                currentGroupId = newGroup.id;

                // Add all addons to the new group
                for (const addon of addons) {
                    await addAddonMutation.mutateAsync({ groupId: currentGroupId, addon });
                }
            }
            onCancel();
        } catch (error) {
            console.error('Error saving addon group:', error);
        }
    };

    return (
        <div className="w-full">
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-6">
                {initialValues?.id ? 'Edit Add-On Group' : 'Create Add-On Group'}
            </h3>
            <Card className="w-full">
                <Formik
                    initialValues={{
                        name: initialValues?.name || '',
                        min_selection: initialValues?.min_selection || 0,
                        max_selection: initialValues?.max_selection || 1,
                        max_quantity_per_addon: initialValues?.max_quantity_per_addon || 1,
                        addons: initialValues?.addons || [{ name: '', price: 0, is_default: false }]
                    }}
                    validationSchema={AddonGroupSchema}
                    onSubmit={handleSubmit}
                >
                    {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                        <Form className="space-y-8">
                            <div className="flex flex-col gap-6">
                                <div className="md:col-span-12 xl:col-span-6">
                                    <Input
                                        label="Group Name"
                                        name="name"
                                        placeholder="e.g. Select Extras"
                                        value={values.name}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.name && errors.name ? (errors.name as string) : undefined}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                                    <Input
                                        label="Min Selection"
                                        name="min_selection"
                                        type="number"
                                        value={values.min_selection}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.min_selection && errors.min_selection ? (errors.min_selection as string) : undefined}
                                        required
                                    />
                                    <Input
                                        label="Max Selection"
                                        name="max_selection"
                                        type="number"
                                        value={values.max_selection}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.max_selection && errors.max_selection ? (errors.max_selection as string) : undefined}
                                        required
                                    />

                                    <Input
                                        label="Max Qty Per Item (Count As)"
                                        name="max_quantity_per_addon"
                                        type="number"
                                        value={values.max_quantity_per_addon}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        error={touched.max_quantity_per_addon && errors.max_quantity_per_addon ? (errors.max_quantity_per_addon as string) : undefined}
                                        required
                                    />

                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2 dark:border-zinc-800">
                                    <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Add-Ons & Pricing</h4>
                                    <span className="text-xs text-zinc-500">{values.addons.length} Items</span>
                                </div>

                                <FieldArray name="addons">
                                    {({ push, remove }) => (
                                        <div className="space-y-4">
                                            {values.addons.map((addon, index) => (
                                                <div key={index} className="flex gap-4 items-start p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl relative group">
                                                    <div className="flex-1 grid grid-cols-2 gap-4">
                                                        <Input
                                                            label="Add-On Name"
                                                            name={`addons.${index}.name`}
                                                            placeholder="e.g. Extra Cheese"
                                                            value={values.addons[index].name}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={(errors.addons as any)?.[index]?.name}
                                                            required
                                                        />
                                                        <Input
                                                            label="Price (₹)"
                                                            name={`addons.${index}.price`}
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={values.addons[index].price}
                                                            onChange={handleChange}
                                                            onBlur={handleBlur}
                                                            error={(errors.addons as any)?.[index]?.price}
                                                            required
                                                        />
                                                        <div className="flex items-center mt-6">
                                                            <Checkbox
                                                                id={`addons.${index}.is_default`}
                                                                name={`addons.${index}.is_default`}
                                                                checked={values.addons[index].is_default}
                                                                onChange={handleChange}
                                                                label="Is Default"
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (addon.id) {
                                                                const isConfirmed = await confirm({
                                                                    title: 'Delete Add-on',
                                                                    message: `Are you sure you want to delete "${addon.name}"? This action cannot be undone.`,
                                                                    confirmLabel: 'Delete',
                                                                    variant: 'danger'
                                                                });
                                                                if (isConfirmed) {
                                                                    await deleteAddonMutation.mutateAsync(addon.id);
                                                                    remove(index);
                                                                }
                                                            } else {
                                                                remove(index);
                                                            }
                                                        }}
                                                        className="mt-8 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                                                        title="Remove Add-On"
                                                    >
                                                        <i className="ri-delete-bin-line text-lg" />
                                                    </button>
                                                </div>
                                            ))}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full border-dashed"
                                                onClick={() => push({ name: '', price: 0, is_default: false })}
                                            >
                                                <i className="ri-add-line mr-2" /> Add More Options
                                            </Button>
                                        </div>
                                    )}
                                </FieldArray>
                            </div>
                            <div className="flex gap-3 pt-6 border-t dark:border-zinc-800">
                                <Button
                                    type="submit"
                                    isLoading={isSubmitting || createGroupMutation.isPending || updateGroupMutation.isPending}
                                >
                                    {initialValues?.id ? 'Update Group' : 'Create Group'}
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
        </div >
    );
};

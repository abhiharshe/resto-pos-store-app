import React, { useMemo } from 'react';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { DealItemsUpdate } from '../api/dealsApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { useMenuItems } from '../../menu/api/menuApi';
import Card from '../../../components/common/Card';
import toast from 'react-hot-toast';

const DealItemsSchema = Yup.object().shape({
    selection_groups: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required('Group name is required'),
            min_selection: Yup.number().min(0).test('min-lte-max', 'Min cannot exceed Max', function (value) {
                return (value || 0) <= (this.parent.max_selection || 0);
            }).required('Min selection is required'),
            max_selection: Yup.number().min(1, 'Max must be at least 1').required('Max selection is required'),
            is_required: Yup.boolean(),
            options: Yup.array().of(
                Yup.object().shape({
                    menu_item_id: Yup.string().required('Item is required').test('non-empty', 'Item is required', (val) => !!val && val !== '0'),
                    variant_id: Yup.string().required('Variant is required').test('non-empty', 'Variant is required', (val) => !!val && val !== '0'),
                    additional_price: Yup.number().min(0, 'Price must be 0 or positive').required(),
                })
            ).min(1, 'At least one option required per group')
        })
    ).min(2, 'A deal must have at least two selection groups')
});

interface DealItemsFormProps {
    initialData: {
        selection_groups: any[];
    };
    onSubmit: (values: DealItemsUpdate) => void;
    isLoading?: boolean;
    onCancel: () => void;
}

export const DealItemsForm: React.FC<DealItemsFormProps> = ({
    initialData,
    onSubmit,
    isLoading,
    onCancel
}) => {
    const { data: menuItems } = useMenuItems();

    const getItemOptions = () => [
        { label: 'Select Item', value: '' },
        ...(menuItems?.map(item => ({ label: item.name, value: item.id })) || [])
    ];

    const getVariantOptions = (itemId: string | number | undefined) => {
        if (!itemId || itemId === 0 || itemId === '0') return [{ label: 'Select Variant', value: '' }];
        const item = menuItems?.find(i => String(i.id) === String(itemId));
        return [
            { label: 'Select Variant', value: '' },
            ...(item?.variants?.map(v => ({ label: `${v.name} (+₹${v.price})`, value: v.id! })) || [])
        ];
    };

    const initialValues: DealItemsUpdate = useMemo(() => ({
        selection_groups: initialData.selection_groups.map((g: any) => ({
            name: g.name,
            min_selection: g.min_selection,
            max_selection: g.max_selection,
            is_required: g.is_required,
            options: g.options.map((o: any) => ({
                menu_item_id: o.menu_item_id,
                variant_id: o.variant_id,
                additional_price: o.additional_price,
                is_default: o.is_default,
            })),
        })),
    }), [initialData]);

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={DealItemsSchema}
            onSubmit={onSubmit}
            enableReinitialize
        >
            {({ values, errors, touched, setFieldValue, isSubmitting, handleChange }) => (
                <Form className="space-y-8">
                    <Card className="overflow-visible">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b dark:border-zinc-800 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <i className="ri-list-settings-line text-xl"></i>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white leading-none">Deal Selection Slots</h3>
                                        <p className="text-xs text-zinc-500 mt-1 uppercase tracking-widest font-black">Configure Choice Groups & Items</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full uppercase tracking-tighter">
                                    Min 2 Groups Required
                                </span>
                            </div>

                            <FieldArray name="selection_groups">
                                {({ push, remove }) => (
                                    <div className="space-y-6">
                                        {values.selection_groups.map((group, gIndex) => {
                                            const groupErrors = (errors.selection_groups as any)?.[gIndex];
                                            const groupTouched = (touched.selection_groups as any)?.[gIndex];

                                            return (
                                                <div key={gIndex} className={`p-6 bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border transition-all duration-300 relative group animate-in slide-in-from-bottom-2 ${groupErrors ? 'border-red-500/30 bg-red-50/10 shadow-lg shadow-red-500/5' : 'border-zinc-200 dark:border-zinc-800 hover:border-indigo-500/20'
                                                    }`}>
                                                    <button
                                                        type="button"
                                                        onClick={() => remove(gIndex)}
                                                        className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-md active:scale-90 z-10"
                                                    >
                                                        <i className="ri-close-line"></i>
                                                    </button>

                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                                        <div className="md:col-span-2">
                                                            <Input
                                                                label="Slot Name"
                                                                name={`selection_groups.${gIndex}.name`}
                                                                value={group.name}
                                                                onChange={handleChange}
                                                                error={groupTouched?.name && groupErrors?.name}
                                                                required
                                                            />
                                                        </div>
                                                        <Input
                                                            label="Min Pick"
                                                            name={`selection_groups.${gIndex}.min_selection`}
                                                            type="number"
                                                            value={group.min_selection}
                                                            onChange={handleChange}
                                                            error={groupTouched?.min_selection && groupErrors?.min_selection}
                                                            required
                                                        />
                                                        <Input
                                                            label="Max Pick"
                                                            name={`selection_groups.${gIndex}.max_selection`}
                                                            type="number"
                                                            value={group.max_selection}
                                                            onChange={handleChange}
                                                            error={groupTouched?.max_selection && groupErrors?.max_selection}
                                                            required
                                                        />

                                                        <div className="md:col-span-4 flex items-center justify-between p-3 bg-white dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-800/50">
                                                            <div className="flex items-center gap-3">
                                                                <i className="ri-checkbox-circle-line text-emerald-500 text-lg"></i>
                                                                <span className="text-sm font-semibold text-zinc-700 dark:text-white">Is selection mandatory?</span>
                                                            </div>
                                                            <div
                                                                onClick={() => setFieldValue(`selection_groups.${gIndex}.is_required`, !group.is_required)}
                                                                className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${group.is_required ? 'bg-indigo-600 shadow-inner' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                                                            >
                                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${group.is_required ? 'left-6' : 'left-1'}`} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between mb-2 px-1">
                                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Items in Group</span>
                                                            <span className="h-1 flex-1 mx-4 bg-zinc-200 dark:bg-zinc-800 opacity-30"></span>
                                                        </div>

                                                        <FieldArray name={`selection_groups.${gIndex}.options`}>
                                                            {({ push: pushOpt, remove: removeOpt }) => (
                                                                <div className="space-y-3">
                                                                    {group.options.map((option, oIndex) => {
                                                                        const optionErrors = groupErrors?.options?.[oIndex];
                                                                        const optionTouched = groupTouched?.options?.[oIndex];

                                                                        return (
                                                                            <div key={oIndex} className={`flex flex-col lg:flex-row gap-3 items-start lg:items-end bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border transition-all hover:shadow-lg hover:shadow-indigo-500/5 ${optionErrors ? 'border-red-200' : 'border-zinc-100 dark:border-zinc-800/50'
                                                                                }`}>
                                                                                <div className="flex-1 w-full">
                                                                                    <Select
                                                                                        label="Menu Item"
                                                                                        options={getItemOptions()}
                                                                                        value={option.menu_item_id}
                                                                                        error={optionTouched?.menu_item_id && optionErrors?.menu_item_id}
                                                                                        onChange={(val) => {
                                                                                            setFieldValue(`selection_groups.${gIndex}.options.${oIndex}.menu_item_id`, val);
                                                                                            setFieldValue(`selection_groups.${gIndex}.options.${oIndex}.variant_id`, '');
                                                                                        }}
                                                                                    />
                                                                                </div>
                                                                                <div className="flex-1 w-full">
                                                                                    <Select
                                                                                        label="Variant"
                                                                                        options={getVariantOptions(option.menu_item_id)}
                                                                                        value={option.variant_id}
                                                                                        error={optionTouched?.variant_id && optionErrors?.variant_id}
                                                                                        onChange={(val) => setFieldValue(`selection_groups.${gIndex}.options.${oIndex}.variant_id`, val)}
                                                                                        disabled={!option.menu_item_id}
                                                                                    />
                                                                                </div>
                                                                                <div className="w-full lg:w-32">
                                                                                    <Input
                                                                                        label="Upcharge (₹)"
                                                                                        name={`selection_groups.${gIndex}.options.${oIndex}.additional_price`}
                                                                                        type="number"
                                                                                        value={option.additional_price}
                                                                                        error={optionTouched?.additional_price && optionErrors?.additional_price}
                                                                                        onChange={handleChange}
                                                                                    />
                                                                                </div>
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="ghost"
                                                                                    className="lg:mb-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 h-10 w-10 !p-0"
                                                                                    onClick={() => removeOpt(oIndex)}
                                                                                    disabled={group.options.length <= 1}
                                                                                >
                                                                                    <i className="ri-delete-bin-line"></i>
                                                                                </Button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                    <Button
                                                                        type="button"
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="w-full py-4 border-dashed rounded-2xl flex items-center justify-center gap-2 text-zinc-500 hover:text-indigo-600 hover:border-indigo-600 transition-all font-semibold text-xs uppercase tracking-widest bg-zinc-50/50 dark:bg-zinc-800/30"
                                                                        onClick={() => pushOpt({ menu_item_id: '', variant_id: '', additional_price: 0, is_default: false })}
                                                                    >
                                                                        <i className="ri-add-circle-line text-lg"></i>
                                                                        <span>Add Choice Item</span>
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </FieldArray>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <Button
                                            type="button"
                                            className="w-full py-8 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                                            onClick={() => push({ name: '', min_selection: 1, max_selection: 1, is_required: true, options: [{ menu_item_id: '', variant_id: '', additional_price: 0, is_default: false }] })}
                                        >
                                            <i className="ri-add-line text-xl"></i>
                                            Add Another Selection Slot
                                        </Button>
                                    </div>
                                )}
                            </FieldArray>

                            {(typeof errors.selection_groups === 'string' && touched.selection_groups) && (
                                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-2xl">
                                    <p className="text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest text-center">
                                        <i className="ri-error-warning-line mr-2"></i>{errors.selection_groups}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>

                    <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-800 shadow-lg sticky bottom-0 z-20 backdrop-blur-md bg-opacity-80">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            className="font-semibold uppercase tracking-widest text-xs"
                        >
                            Cancel Changes
                        </Button>
                        <Button
                            type="submit"
                            isLoading={isLoading || isSubmitting}
                            icon="ri-save-line"
                            onClick={() => {
                                if (Object.keys(errors).length > 0) {
                                    toast.error("Please fix validation errors before saving.");
                                }
                            }}
                            className="px-8 shadow-xl shadow-indigo-500/20"
                        >
                            Save Selection Groups
                        </Button>
                    </div>
                </Form>
            )}
        </Formik>
    );
};

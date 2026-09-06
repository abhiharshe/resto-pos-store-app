import { useMenuItems, Asset } from '../../menu/api/menuApi';
import { useStores } from '../../stores/api/storesApi';
import Card from '../../../components/common/Card';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AssetUpload from '../../../components/common/AssetUpload';
import { useAssets } from '../../../hooks/useAssets';
import React, { useMemo, useState } from 'react';
import * as Yup from 'yup';
import { FieldArray, Form, Formik } from 'formik';
import { Input } from '../../../components/common/Input';
import { Select } from '../../../components/common/Select';
import { Button } from '../../../components/common/Button';


const DealSchema = Yup.object().shape({
    title: Yup.string().required('Title is required').max(255),
    store_prices: Yup.array().of(
        Yup.object().shape({
            store_id: Yup.string().required('Store is required'),
            price: Yup.number().when('is_active', {
                is: true,
                then: (schema) => schema.min(0, 'Price must be positive').required('Price is required'),
                otherwise: (schema) => schema.optional(),
            }),
            is_active: Yup.boolean()
        })
    ).test(
        'at-least-one-active',
        'At least one store must be active for this deal',
        (prices) => !!prices && prices.some(sp => sp.is_active === true)
    ),
    selection_groups: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required('Group name is required'),
            min_selection: Yup.number().min(0).test('min-lte-max', 'Min cannot exceed Max', function (value) {
                return (value || 0) <= (this.parent.max_selection || 0);
            }).required('Min selection is required'),
            max_selection: Yup.number().min(1, 'Max must be at least 1').required('Max selection is required'),
            options: Yup.array().of(
                Yup.object().shape({
                    menu_item_id: Yup.string().required('Item is required').test('non-empty', 'Item is required', (val) => !!val && val !== '0'),
                    variant_id: Yup.string().required('Variant is required').test('non-empty', 'Variant is required', (val) => !!val && val !== '0'),
                    additional_price: Yup.number().min(0, 'Price must be 0 or positive').required('Price is required'),
                })
            ).min(1, 'At least one option required per group')
        })
    ).min(2, 'A deal must have at least two selection groups (e.g., Main + Drink)')
});

interface DealCreateFormProps {
    onSubmit: (values: DealCreate) => void;
    isLoading?: boolean;
    title: string;
}

export const DealCreateForm: React.FC<DealCreateFormProps> = ({
    onSubmit,
    isLoading,
    title
}) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const { data: menuItems } = useMenuItems();
    const { data: stores } = useStores();

    const getItemOptions = () => [
        { label: 'Select an item...', value: '' },
        ...(menuItems?.map(item => ({ label: item.name, value: item.id })) || [])
    ];

    const getVariantOptions = (itemId: string | number | undefined) => {
        if (!itemId || itemId === 0 || itemId === '0') return [{ label: 'Select variant...', value: '' }];
        const item = menuItems?.find(i => String(i.id) === String(itemId));
        return [
            { label: 'Select variant...', value: '' },
            ...(item?.variants.map(v => ({ label: `${v.name} (₹${v.price})`, value: v.id! })) || [])
        ];
    };

    // Pre-populate all stores as active when stores data loads
    const initialValues: DealCreate = useMemo(() => ({
        title: '',
        description: '',
        is_active: true,
        store_prices: (stores || []).map(s => ({ store_id: s.id, price: 0, is_active: true })),
        selection_groups: [
            {
                name: 'Main Items',
                min_selection: 1,
                max_selection: 1,
                is_required: true,
                options: [{ menu_item_id: '', variant_id: '', additional_price: 0, is_default: false }]
            },
            {
                name: 'Sides/Drinks',
                min_selection: 1,
                max_selection: 1,
                is_required: true,
                options: [{ menu_item_id: '', variant_id: '', additional_price: 0, is_default: false }]
            }
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [stores]);


    const steps = [
        { id: 1, label: 'Basic Info', icon: 'ri-information-line' },
        { id: 2, label: 'Store Support', icon: 'ri-store-2-line' },
        { id: 3, label: 'Deal Groups', icon: 'ri-stack-line' }
    ];

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800 gap-4">
                <div>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-zinc-500 font-medium">Step {currentStep}: {steps[currentStep - 1].label}</p>
                </div>

                <div className="flex items-center gap-2">
                    {steps.map((s, idx) => (
                        <React.Fragment key={s.id}>
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${currentStep >= s.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                                    }`}
                            >
                                <i className={s.icon}></i>
                            </div>
                            {idx < steps.length - 1 && (
                                <div className={`w-8 h-[2px] ${currentStep > s.id ? 'bg-indigo-600' : 'bg-zinc-100 dark:bg-zinc-800'}`}></div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <Card className="w-full">
                <Formik
                    initialValues={initialValues}
                    validationSchema={DealSchema}
                    enableReinitialize
                    onSubmit={(values, { setSubmitting }) => {
                        if (currentStep < 3) {
                            setCurrentStep(currentStep + 1);
                            setSubmitting(false);
                            return;
                        }
                        onSubmit(values);
                    }}
                >
                    {({ values, errors, touched, setFieldValue, isSubmitting, handleChange, validateForm }) => (
                        <Form className="space-y-8">

                            {/* STEP 1: BASIC INFO & IMAGES */}
                            {currentStep === 1 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="md:col-span-2">
                                            <Input
                                                label="Deal Title"
                                                name="title"
                                                placeholder="e.g., Burger & Fries Combo"
                                                required
                                                value={values.title}
                                                onChange={handleChange}
                                                error={touched.title && errors.title ? (errors.title as string) : undefined}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm text-zinc-700 dark:text-zinc-300 mb-2 font-medium">Description (Optional)</label>
                                            <textarea
                                                name="description"
                                                className="w-full h-32 px-4 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none text-zinc-900 dark:text-white"
                                                placeholder="Describe what makes this combo special..."
                                                value={values.description}
                                                onChange={handleChange}
                                            ></textarea>
                                        </div>
                                        {/* Deal Active Status */}
                                        <div className="md:col-span-2">
                                            <button
                                                type="button"
                                                onClick={() => setFieldValue('is_active', !values.is_active)}
                                                className={`w-full flex items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${values.is_active
                                                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-300 dark:border-emerald-700'
                                                    : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${values.is_active ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                                                        }`}>
                                                        <i className={values.is_active ? 'ri-checkbox-circle-fill' : 'ri-close-circle-line'}></i>
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">Deal Status</p>
                                                        <p className="text-xs text-zinc-500">
                                                            {values.is_active ? 'This deal is active and visible to customers' : 'This deal is inactive and hidden from customers'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {/* Toggle pill */}
                                                <div className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${values.is_active ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}>
                                                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${values.is_active ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                                Deal Media
                                            </label>
                                        </div>

                                        <div className="p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-3xl bg-zinc-50/50 dark:bg-zinc-900/20 flex flex-col items-center justify-center gap-2">
                                            <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                                                <i className="ri-image-add-line text-2xl text-indigo-500"></i>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-zinc-900 dark:text-white">Media Gallery</p>
                                                <p className="text-xs text-zinc-500 max-w-[240px] mx-auto mt-1">
                                                    Media gallery will be available after you create the combo deal.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: STORE SUPPORT & PRICING */}
                            {currentStep === 2 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 p-4 rounded-2xl flex gap-4">
                                        <i className="ri-information-fill text-amber-500 text-xl"></i>
                                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                            At least one store must be <strong>active</strong> for this deal. Disable a store to exclude it — its price will be preserved but ignored.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {stores?.map((store) => {
                                            const spIndex = values.store_prices.findIndex(sp => sp.store_id === store.id);
                                            const storePrice = spIndex !== -1 ? values.store_prices[spIndex] : { store_id: store.id, price: 0, is_active: true };
                                            const isActive = storePrice?.is_active ?? true;

                                            return (
                                                <div
                                                    key={store.id}
                                                    className={`p-5 rounded-2xl border transition-all duration-300 ${isActive
                                                        ? 'bg-indigo-50/50 dark:bg-indigo-900/5 border-indigo-200 dark:border-indigo-800 ring-1 ring-indigo-500/10'
                                                        : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-70'
                                                        }`}
                                                >
                                                    <div className="flex items-center justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400'
                                                                }`}>
                                                            <i className="ri-store-2-line"></i>
                                                        </div>
                                                            <div>
                                                                <h4 className="font-bold text-zinc-900 dark:text-white">{store.name}</h4>
                                                                <span className="text-[10px] uppercase font-black tracking-widest text-zinc-500">{store.location || 'Default Location'}</span>
                                                            </div>
                                                        </div>
                                                        {/* Toggle is_active */}
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newPrices = [...values.store_prices];
                                                                if (spIndex !== -1) {
                                                                    newPrices[spIndex] = { ...newPrices[spIndex], is_active: !isActive };
                                                                } else {
                                                                    newPrices.push({ store_id: store.id, price: 0, is_active: !isActive });
                                                                }
                                                                setFieldValue('store_prices', newPrices);
                                                            }}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isActive
                                                                ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/20 dark:text-rose-400'
                                                                : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                                }`}
                                                        >
                                                            {isActive ? 'Disable' : 'Enable'}
                                                        </button>
                                                    </div>

                                                    {/* Price input */}
                                                    <div className="relative">
                                                        <Input
                                                            label="Base Deal Price (₹)"
                                                            type="number"
                                                            placeholder="0.00"
                                                            value={storePrice?.price ?? 0}
                                                            readOnly={!isActive}
                                                            onChange={(e) => {
                                                                if (!isActive) return;
                                                                const newPrices = [...values.store_prices];
                                                                if (spIndex !== -1) {
                                                                    newPrices[spIndex] = { ...newPrices[spIndex], price: Number(e.target.value) };
                                                                } else {
                                                                    newPrices.push({ store_id: store.id, price: Number(e.target.value), is_active: true });
                                                                }
                                                                setFieldValue('store_prices', newPrices);
                                                            }}
                                                        />
                                                        {!isActive && (
                                                            <div className="absolute inset-0 rounded-xl cursor-not-allowed" />
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {typeof errors.store_prices === 'string' && touched.store_prices && (
                                        <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center py-2 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30">
                                            <i className="ri-error-warning-line mr-1"></i>{errors.store_prices}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* STEP 3: SELECTION GROUPS */}
                            {currentStep === 3 && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">Configure Selection Slots</label>
                                            <span className="text-[10px] font-black bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase">Min 2 Groups Required</span>
                                        </div>

                                        <FieldArray name="selection_groups">
                                            {({ push, remove }) => (
                                                <div className="space-y-6">
                                                    {values.selection_groups.map((group, gIndex) => {
                                                        const groupErrors = (errors.selection_groups as any)?.[gIndex];
                                                        const groupTouched = (touched.selection_groups as any)?.[gIndex];

                                                        return (
                                                            <div key={gIndex} className={`p-6 bg-zinc-50 dark:bg-zinc-800/40 rounded-3xl border transition-all duration-300 relative group animate-in slide-in-from-bottom-2 duration-200 ${groupErrors ? 'border-red-200 dark:border-red-900/30' : 'border-zinc-200 dark:border-zinc-700'}`}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => remove(gIndex)}
                                                                    className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors shadow-sm active:scale-90"
                                                                >
                                                                    <i className="ri-close-line"></i>
                                                                </button>

                                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                                                    <div className="md:col-span-2">
                                                                        <Input
                                                                            label="Slot Name"
                                                                            name={`selection_groups.${gIndex}.name`}
                                                                            placeholder="e.g., Select Main Burger"
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

                                                                    <div className="md:col-span-4 flex items-center justify-between p-3 bg-white dark:bg-zinc-900/40 rounded-xl border border-zinc-100 dark:border-zinc-800/50 mt-1">
                                                                        <div className="flex items-center gap-3">
                                                                            <i className="ri-shield-check-line text-indigo-500"></i>
                                                                            <span className="text-sm font-bold text-zinc-700 dark:text-white">Customer must make a selection</span>
                                                                        </div>
                                                                        <div
                                                                            onClick={() => setFieldValue(`selection_groups.${gIndex}.is_required`, !group.is_required)}
                                                                            className={`w-10 h-5 rounded-full transition-all relative cursor-pointer ${group.is_required ? 'bg-indigo-500' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                                                                        >
                                                                            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${group.is_required ? 'left-5.5' : 'left-0.5'}`} />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-3">
                                                                    <div className="flex items-center justify-between mb-2 px-1">
                                                                        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">Selectable Items</span>
                                                                        <span className="h-[1px] flex-1 mx-4 bg-zinc-200 dark:bg-zinc-700 opacity-30"></span>
                                                                    </div>

                                                                    <FieldArray name={`selection_groups.${gIndex}.options`}>
                                                                        {({ push: pushOpt, remove: removeOpt }) => (
                                                                            <div className="space-y-3">
                                                                                {group.options.map((option, oIndex) => {
                                                                                    const optionErrors = groupErrors?.options?.[oIndex];
                                                                                    const optionTouched = groupTouched?.options?.[oIndex];

                                                                                    return (
                                                                                        <div key={oIndex} className={`flex flex-col lg:flex-row gap-3 items-start lg:items-end bg-white dark:bg-zinc-900/50 p-4 rounded-2xl border transition-all hover:border-indigo-500/30 ${optionErrors ? 'border-red-200 dark:border-red-900/30' : 'border-zinc-100 dark:border-zinc-800/50'} shadow-sm relative`}>
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
                                                                                                    placeholder="0.00"
                                                                                                />
                                                                                            </div>
                                                                                            <Button
                                                                                                type="button"
                                                                                                variant="ghost"
                                                                                                className="lg:mb-1 text-red-400 hover:text-red-500 hover:bg-red-50 h-10 w-10 !p-0"
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
                                                                                    className="w-full py-3 border-dashed rounded-xl flex items-center justify-center gap-2 text-zinc-500 hover:text-indigo-600 hover:border-indigo-600 transition-all font-bold text-xs uppercase"
                                                                                    onClick={() => pushOpt({ menu_item_id: '', variant_id: '', additional_price: 0, is_default: false })}
                                                                                >
                                                                                    <i className="ri-add-circle-line"></i>
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
                                                        className="w-full py-6 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 bg-transparent text-zinc-500 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3"
                                                        onClick={() => push({ name: '', min_selection: 1, max_selection: 1, is_required: true, options: [{ menu_item_id: '', variant_id: '', additional_price: 0, is_default: false }] })}
                                                    >
                                                        <i className="ri-add-line text-lg"></i>
                                                        Add Another Selection Slot
                                                    </Button>
                                                </div>
                                            )}
                                        </FieldArray>
                                        {typeof errors.selection_groups === 'string' && touched.selection_groups && (
                                            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center py-2 bg-red-50 dark:bg-red-900/10 rounded-xl mt-4 border border-red-100 dark:border-red-900/30">
                                                {errors.selection_groups}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-8 border-t dark:border-zinc-800">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        if (currentStep > 1) {
                                            setCurrentStep(currentStep - 1);
                                        } else {
                                            navigate('/deals');
                                        }
                                    }}
                                >
                                    {currentStep === 1 ? 'Cancel' : 'Previous Step'}
                                </Button>

                                <div className="flex gap-3">
                                    {currentStep < 3 ? (
                                        <Button
                                            type="button"
                                            onClick={async () => {
                                                const stepErrors = await validateForm();
                                                const hasStep1Errors = currentStep === 1 && !!stepErrors.title;
                                                const hasStep2Errors = currentStep === 2 && (
                                                    Array.isArray(stepErrors.store_prices) ? stepErrors.store_prices.some(e => !!e) : !!stepErrors.store_prices
                                                );

                                                if ((currentStep === 1 && hasStep1Errors) || (currentStep === 2 && hasStep2Errors)) {
                                                    toast.error("Please fix the validation errors before proceeding.");
                                                    return;
                                                }
                                                setCurrentStep(currentStep + 1);
                                            }}
                                            icon="ri-arrow-right-line"
                                        >
                                            Next Component
                                        </Button>
                                    ) : (
                                        <Button
                                            type="submit"
                                            isLoading={isLoading || isSubmitting}
                                            icon="ri-save-line"
                                            onClick={async () => {
                                                const formErrors = await validateForm();
                                                if (Object.keys(formErrors).length > 0) {
                                                    if (formErrors.title) {
                                                        toast.error("Please enter a Deal Title (Step 1)");
                                                        return;
                                                    }
                                                    if (formErrors.store_prices) {
                                                        toast.error("Please ensure at least one store is active with a valid price (Step 2)");
                                                        return;
                                                    }
                                                    if (formErrors.selection_groups) {
                                                        if (typeof formErrors.selection_groups === 'string') {
                                                            toast.error(formErrors.selection_groups);
                                                        } else {
                                                            toast.error("Please complete all selection group items and variants");
                                                        }
                                                        return;
                                                    }
                                                    toast.error("Please fix form errors before submitting");
                                                }
                                            }}
                                        >
                                            Save & Publish Deal
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </Form>
                    )}
                </Formik>
            </Card>
        </div>
    );
};

import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import { MenuItem } from '../../menu/api/menuApi';
import { Store } from '../../stores/api/storesApi';
import { Button } from '../../../components/common/Button';
import { Input } from '../../../components/common/Input';
import { NumberInput } from '../../../components/common/NumberInput';
import { Checkbox } from '../../../components/common/Checkbox';
import Card from '../../../components/common/Card';

const PricingSchema = Yup.object().shape({
    variants: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().required('Variant name is required'),
            price: Yup.number().required('Price is required').min(0, 'Price cannot be negative'),
            is_serving: Yup.boolean().default(false)
        })
    ).min(1, 'At least one variant is required')
});

interface ItemPricingFormProps {
    item: MenuItem;
    stores: Store[] | undefined;
    onSubmit: (values: any) => Promise<void>;
    onCancel: () => void;
    isSaving?: boolean;
}

const ItemPricingForm = ({ item, stores, onSubmit, onCancel, isSaving }: ItemPricingFormProps) => {
    const initialValues = {
        variants: item.variants?.length ? item.variants : [{ name: 'Regular', price: 0, is_serving: false, store_prices: [] }]
    };

    return (
        <Card className='w-full'>
            <Formik
                initialValues={initialValues}
                validationSchema={PricingSchema}
                onSubmit={onSubmit}
                enableReinitialize
            >
                {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
                    <Form className="space-y-6">
                        <div className="space-y-4">
                            {typeof errors.variants === 'string' && (
                                <p className="text-xs text-red-500">{errors.variants}</p>
                            )}
                            <FieldArray
                                name="variants"
                                render={(arrayHelpers) => (
                                    <div className="space-y-4">
                                        {values.variants.map((variant: any, index: number) => (
                                            <div key={index} className="flex gap-4 items-start p-4 bg-neutral-50 dark:bg-mauve-900 border border-mauve-200 dark:border-mauve-800 rounded-xl relative">
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
                                                        label="Base Price (₹)"
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
                                                        <Checkbox
                                                            name={`variants.${index}.is_serving`}
                                                            checked={variant.is_serving}
                                                            onChange={handleChange}
                                                            label="Is Serving (identifies portions)"
                                                        />
                                                    </div>
                                                    <div className="sm:col-span-2 mt-4 space-y-4 border-t border-mauve-200 dark:border-mauve-800 pt-4">
                                                        <div>
                                                            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Store Specific Prices & Availability</label>
                                                            <p className="text-xs text-zinc-500 mb-2">Leave blank to use the base price for the store. Uncheck to make unavailable.</p>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {stores?.map((store, storeIndex) => {
                                                                const storePriceIndex = variant.store_prices?.findIndex((sp: any) => sp.store_id === store.id) ?? -1;
                                                                const isStorePriceSet = storePriceIndex !== -1;
                                                                const currentPrice = isStorePriceSet ? variant.store_prices[storePriceIndex].price : '';
                                                                const isInStore = isStorePriceSet ? (variant.store_prices[storePriceIndex].is_in_store ?? true) : true;
                                                                const isWebsiteApp = isStorePriceSet ? (variant.store_prices[storePriceIndex].is_website_app ?? true) : true;

                                                                return (
                                                                    <div key={store.id} className="flex flex-col gap-2 p-3 rounded-lg bg-white dark:bg-neutral-800 border border-mauve-200 dark:border-zinc-700">
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="text-md font-medium truncate flex-1 mr-2" title={store.name}>{store.name}</span>
                                                                        </div>
                                                                        <div className="flex items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-700 pt-2 mt-1">
                                                                            <div className="flex items-center gap-2 w-40">
                                                                                <span className="text-xs text-zinc-400 font-semibold">₹</span>
                                                                                <NumberInput
                                                                                    step="0.01"
                                                                                    placeholder="Default"
                                                                                    value={currentPrice}
                                                                                    onChange={(e) => {
                                                                                        const val = e.target.value;
                                                                                        let newStorePrices = [...(variant.store_prices || [])];
                                                                                        if (val === '') {
                                                                                            if (isStorePriceSet && isInStore && isWebsiteApp) { // Remove if all defaults
                                                                                                newStorePrices.splice(storePriceIndex, 1);
                                                                                            } else if (isStorePriceSet) {
                                                                                                newStorePrices[storePriceIndex] = { ...newStorePrices[storePriceIndex], price: parseFloat(variant.price) || 0 };
                                                                                            }
                                                                                        } else {
                                                                                            if (isStorePriceSet) {
                                                                                                newStorePrices[storePriceIndex] = { ...newStorePrices[storePriceIndex], price: parseFloat(val) };
                                                                                            } else {
                                                                                                newStorePrices.push({ store_id: store.id, price: parseFloat(val), is_in_store: true, is_website_app: true });
                                                                                            }
                                                                                        }
                                                                                        setFieldValue(`variants.${index}.store_prices`, newStorePrices);
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                            <div className="flex items-center gap-2">
                                                                                <Checkbox
                                                                                    id={`store.${index}.${storeIndex}.is_in_store`}
                                                                                    name={`store.${index}.${storeIndex}.is_in_store`}
                                                                                    checked={isInStore}
                                                                                    onChange={(e) => {
                                                                                        let newStorePrices = [...(variant.store_prices || [])];
                                                                                        if (isStorePriceSet) {
                                                                                            newStorePrices[storePriceIndex] = { ...newStorePrices[storePriceIndex], is_in_store: e.target.checked };
                                                                                        } else {
                                                                                            newStorePrices.push({ store_id: store.id, price: parseFloat(variant.price) || 0, is_in_store: e.target.checked, is_website_app: true });
                                                                                        }
                                                                                        setFieldValue(`variants.${index}.store_prices`, newStorePrices);
                                                                                    }}
                                                                                    labelClassName="text-xs"
                                                                                    label="In-Store"
                                                                                />
                                                                                <Checkbox
                                                                                    id={`store.${index}.${storeIndex}.is_website_app`}
                                                                                    name={`store.${index}.${storeIndex}.is_website_app`}
                                                                                    checked={isWebsiteApp}
                                                                                    onChange={(e) => {
                                                                                        let newStorePrices = [...(variant.store_prices || [])];
                                                                                        if (isStorePriceSet) {
                                                                                            newStorePrices[storePriceIndex] = { ...newStorePrices[storePriceIndex], is_website_app: e.target.checked };
                                                                                        } else {
                                                                                            newStorePrices.push({ store_id: store.id, price: parseFloat(variant.price) || 0, is_in_store: true, is_website_app: e.target.checked });
                                                                                        }
                                                                                        setFieldValue(`variants.${index}.store_prices`, newStorePrices);
                                                                                    }}
                                                                                    labelClassName="text-xs"
                                                                                    label="Web/App"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
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
                                            onClick={() => arrayHelpers.push({ name: '', price: 0, is_serving: false, store_prices: [] })}
                                            className="w-full border-dashed"
                                        >
                                            <i className="ri-add-line mr-2" /> Add Variant
                                        </Button>
                                    </div>
                                )}
                            />
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-mauve-200 dark:border-mauve-800">
                            <Button
                                type="submit"
                                isLoading={isSaving || isSubmitting}
                            >
                                Save Pricing & Variants
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                            >
                                Skip / Cancel
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Card>
    );
};

export default ItemPricingForm;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Promotion } from '../../promotions/api/promotionsApi';

export interface SelectedAddon {
    id: string;
    name: string;
    price: number;
    quantity?: number;
}

export interface CartItem {
    cartId: string;   // Truly unique ID for the cart row/instance
    uniqueId: string; // id + selectedAddons serialization (for merging checks)
    id: string;
    name: string;
    variantId: string;
    variantName: string;
    price: number; // Base price
    discountedPrice?: number; // Price after item-level promo
    quantity: number;
    selectedAddons: SelectedAddon[];
    totalItemPrice: number; // (effective price + addons price) * quantity
    originalItem: any; // Full MenuItemProps for editing
    timeStamp: number;
    isPromoItem?: boolean; // If true, this is a free item from BXGY
    promotionId?: string;
}

export interface CartDealItem {
    cartId: string;
    id: string; // menu_item_id
    name: string; // menu item name
    variantId: string;
    variantName: string;
    groupId: number | string;
    groupName?: string;
    optionId: number | string;
    selectionUpcharge: number; // option.additional_price
    selectedAddons: SelectedAddon[];
    addonsPrice: number;
    quantity: number;
    totalItemPrice: number;
    originalItem?: any;
    deal_selection_group_id?: number | string;
    deal_selection_option_id?: number | string;
}

export interface CartDeal {
    cartId: string;
    id: string; // deal_id
    name: string;
    price: number; // store base deal price
    quantity: number;
    items: CartDealItem[];
    selectionUpchargesTotal?: number;
    addonsTotal?: number;
    dealUnitPrice?: number;
    totalDealPrice: number;
    timeStamp: number;
}

export interface CartState {
    items: CartItem[];
    deals: CartDeal[];
    activePromotions: Promotion[];
    activeOrderId: string | null;
    selectedStoreId: string | null;
    selectedStore: {
        id: string;
        name: string;
        tax_percentage?: number;
        service_charge_percentage?: number;
    } | null;
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    isWalkIn: boolean;
    orderType: 'DINE_IN' | 'PICKUP' | 'DELIVERY';
    paymentMode: 'CASH' | 'CARD' | 'ONLINE';
    couponCode: string;
    discountAmount: number;
    subtotal: number;
    tax: number;
    total: number;
    deliveryDistanceKm?: number;
}

const initialState: CartState = {
    items: [],
    deals: [],
    activePromotions: [],
    activeOrderId: null,
    selectedStoreId: null,
    selectedStore: null,
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    isWalkIn: true, // Default to true as POS is usually walk-in first
    orderType: 'DINE_IN',
    paymentMode: 'CASH',
    couponCode: '',
    discountAmount: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
    deliveryDistanceKm: 0,
};

const applyPromotions = (state: CartState) => {
    // 1. Clear previous free promo items
    state.items = state.items.filter(item => !item.isPromoItem);

    // 2. Reset discounted prices
    state.items.forEach(item => {
        item.discountedPrice = undefined;
    });

    if (!state.activePromotions || state.activePromotions.length === 0) return;

    // 3. Apply ITEM_DISCOUNT promotions
    state.activePromotions.filter(p => p.type === 'ITEM_DISCOUNT').forEach(promo => {
        state.items.forEach(item => {
            if (item.id === promo.buy_item_id) {
                const discount = (item.price * (promo.discount_percentage / 100));
                item.discountedPrice = Math.max(0, item.price - discount);
            }
        });
    });

    // 4. Update totalItemPrice for all non-promo items
    state.items.forEach(item => {
        const effectivePrice = item.discountedPrice ?? item.price;
        const addonsPrice = item.selectedAddons.reduce((acc, a) => acc + a.price, 0);
        item.totalItemPrice = (effectivePrice + addonsPrice) * item.quantity;
    });

    // 5. Apply BXGY promotions
    state.activePromotions.filter(p => p.type === 'BXGY').forEach(promo => {
        if (!promo.buy_item_id || !promo.get_item_id) return;

        const triggerItems = state.items.filter(item => item.id === promo.buy_item_id && !item.isPromoItem);
        const totalTriggerQty = triggerItems.reduce((acc, item) => acc + item.quantity, 0);

        if (totalTriggerQty >= promo.buy_quantity) {
            let numApplications = Math.floor(totalTriggerQty / promo.buy_quantity);
            if (promo.max_applications) {
                numApplications = Math.min(numApplications, promo.max_applications);
            }

            const freeQty = numApplications * promo.get_quantity;
            if (freeQty > 0) {
                const existingFreeItem = state.items.find(i => i.id === promo.get_item_id);
                state.items.push({
                    cartId: `promo-${promo.id}-${Date.now()}`,
                    uniqueId: `promo-${promo.get_item_id}`,
                    id: promo.get_item_id,
                    name: promo.get_item?.name || 'Free Item',
                    variantId: '0',
                    variantName: 'Promo',
                    price: 0,
                    discountedPrice: 0,
                    quantity: freeQty,
                    selectedAddons: [],
                    totalItemPrice: 0,
                    originalItem: existingFreeItem?.originalItem || promo.get_item,
                    timeStamp: Date.now(),
                    isPromoItem: true,
                    promotionId: promo.id
                });
            }
        }
    });
};

const calculateTotals = (state: CartState) => {
    applyPromotions(state);

    // Calculate items total
    const itemsTotal = state.items.reduce((acc, item) => acc + item.totalItemPrice, 0);

    // Calculate deals total
    state.deals.forEach(deal => {
        let selectionUpchargesTotal = 0;
        let addonsTotal = 0;

        deal.items.forEach(item => {
            const upcharge = Number(item.selectionUpcharge || 0);
            const addonsPrice = (item.selectedAddons || []).reduce((sum, a) => sum + Number(a.price || 0), 0);
            item.addonsPrice = addonsPrice;
            item.totalItemPrice = (upcharge + addonsPrice) * (item.quantity || 1);

            selectionUpchargesTotal += upcharge * (item.quantity || 1);
            addonsTotal += addonsPrice * (item.quantity || 1);
        });

        deal.selectionUpchargesTotal = selectionUpchargesTotal;
        deal.addonsTotal = addonsTotal;
        const dealUnitPrice = Number(deal.price || 0) + selectionUpchargesTotal + addonsTotal;
        deal.dealUnitPrice = dealUnitPrice;
        deal.totalDealPrice = dealUnitPrice * (deal.quantity || 1);
    });
    const dealsTotal = state.deals.reduce((acc, deal) => acc + deal.totalDealPrice, 0);

    state.subtotal = itemsTotal + dealsTotal;
    const taxRate = state.selectedStore?.tax_percentage ? state.selectedStore.tax_percentage / 100 : 0.05;
    state.tax = state.subtotal * taxRate;
    state.total = Math.max(0, state.subtotal + state.tax - state.discountAmount);
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<Omit<CartItem, 'totalItemPrice' | 'cartId'>>) => {
            const existingItemIndex = state.items.findIndex(
                (item) => item.uniqueId === action.payload.uniqueId && !item.isPromoItem
            );

            const itemPrice = action.payload.price + action.payload.selectedAddons.reduce((acc, addon) => acc + addon.price, 0);

            if (existingItemIndex !== -1) {
                state.items[existingItemIndex].quantity += action.payload.quantity;
            } else {
                state.items.push({
                    ...action.payload,
                    cartId: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    totalItemPrice: itemPrice * action.payload.quantity,
                });
            }
            calculateTotals(state);
        },
        incrementQuantity: (state, action: PayloadAction<string>) => {
            const item = state.items.find((i) => i.cartId === action.payload);
            if (item && !item.isPromoItem) {
                item.quantity += 1;
                calculateTotals(state);
            }
        },
        decrementQuantity: (state, action: PayloadAction<string>) => {
            const itemIndex = state.items.findIndex((i) => i.cartId === action.payload);
            if (itemIndex !== -1) {
                const item = state.items[itemIndex];
                if (item.isPromoItem) return;

                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    state.items.splice(itemIndex, 1);
                }
                calculateTotals(state);
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((i) => i.cartId !== action.payload);
            calculateTotals(state);
        },
        updateCustomerDetails: (state, action: PayloadAction<{ name?: string; phone?: string; address?: string; isWalkIn?: boolean }>) => {
            if (action.payload.name !== undefined) state.customerName = action.payload.name;
            if (action.payload.phone !== undefined) state.customerPhone = action.payload.phone;
            if (action.payload.address !== undefined) state.customerAddress = action.payload.address;
            if (action.payload.isWalkIn !== undefined) state.isWalkIn = action.payload.isWalkIn;
        },
        setIsWalkIn: (state, action: PayloadAction<boolean>) => {
            state.isWalkIn = action.payload;
            if (action.payload) {
                state.customerName = 'Walk-In Customer';
            } else if (state.customerName === 'Walk-In Customer') {
                state.customerName = '';
            }
        },
        toggleWalkIn: (state) => {
            state.isWalkIn = !state.isWalkIn;
            if (state.isWalkIn) {
                state.customerName = 'Walk-In Customer';
            } else if (state.customerName === 'Walk-In Customer') {
                state.customerName = '';
            }
        },
        setOrderType: (state, action: PayloadAction<CartState['orderType']>) => {
            state.orderType = action.payload;
        },
        setDeliveryDistance: (state, action: PayloadAction<number>) => {
            state.deliveryDistanceKm = action.payload;
        },
        setPaymentMode: (state, action: PayloadAction<CartState['paymentMode']>) => {
            state.paymentMode = action.payload;
        },
        setSelectedStore: (state, action: PayloadAction<CartState['selectedStore']>) => {
            state.selectedStoreId = action.payload?.id ?? null;
            state.selectedStore = action.payload;
            calculateTotals(state);
        },
        setPromotions: (state, action: PayloadAction<Promotion[]>) => {
            state.activePromotions = action.payload;
            calculateTotals(state);
        },
        applyCoupon: (state, action: PayloadAction<{ code: string; discount: number }>) => {
            state.couponCode = action.payload.code;
            state.discountAmount = action.payload.discount;
            calculateTotals(state);
        },
        removeCoupon: (state) => {
            state.couponCode = '';
            state.discountAmount = 0;
            calculateTotals(state);
        },
        updateCartItem: (state, action: PayloadAction<{ cartId: string; newItem: Omit<CartItem, 'totalItemPrice' | 'cartId'> }>) => {
            const currentIndex = state.items.findIndex(i => i.cartId === action.payload.cartId);
            if (currentIndex === -1) return;

            const newUniqueId = action.payload.newItem.uniqueId;
            const existingIndex = state.items.findIndex((item, idx) => item.uniqueId === newUniqueId && idx !== currentIndex && !item.isPromoItem);

            if (existingIndex !== -1) {
                state.items[existingIndex].quantity += action.payload.newItem.quantity;
                state.items.splice(currentIndex, 1);
            } else {
                state.items[currentIndex] = {
                    ...action.payload.newItem,
                    cartId: action.payload.cartId,
                    totalItemPrice: 0 // Will be calculated in calculateTotals
                };
            }
            calculateTotals(state);
        },
        loadOrder: (state, action: PayloadAction<CartState>) => {
            Object.assign(state, action.payload);
            calculateTotals(state);
        },
        addDealToCart: (state, action: PayloadAction<Omit<CartDeal, 'totalDealPrice' | 'cartId'>>) => {
            state.deals.push({
                ...action.payload,
                cartId: `deal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                totalDealPrice: 0, // Calculated in calculateTotals
            });
            calculateTotals(state);
        },
        removeDealFromCart: (state, action: PayloadAction<string>) => {
            state.deals = state.deals.filter(d => d.cartId !== action.payload);
            calculateTotals(state);
        },
        incrementDealQuantity: (state, action: PayloadAction<string>) => {
            const deal = state.deals.find(d => d.cartId === action.payload);
            if (deal) {
                deal.quantity += 1;
                calculateTotals(state);
            }
        },
        decrementDealQuantity: (state, action: PayloadAction<string>) => {
            const dealIndex = state.deals.findIndex(d => d.cartId === action.payload);
            if (dealIndex !== -1) {
                const deal = state.deals[dealIndex];
                if (deal.quantity > 1) {
                    deal.quantity -= 1;
                } else {
                    state.deals.splice(dealIndex, 1);
                }
                calculateTotals(state);
            }
        },
        clearCart: (state) => {
            const { selectedStoreId, selectedStore, activePromotions } = state;
            return {
                ...initialState,
                selectedStoreId,
                selectedStore,
                activePromotions,
            };
        },
    },
});

export const {
    addToCart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    updateCustomerDetails,
    updateCartItem,
    setOrderType,
    setDeliveryDistance,
    setPaymentMode,
    applyCoupon,
    removeCoupon,
    clearCart,
    loadOrder,
    setSelectedStore,
    setPromotions,
    addDealToCart,
    removeDealFromCart,
    incrementDealQuantity,
    decrementDealQuantity,
    setIsWalkIn,
    toggleWalkIn,
} = cartSlice.actions;

export default cartSlice.reducer;

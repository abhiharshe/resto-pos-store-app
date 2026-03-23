import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SelectedAddon {
    id: number;
    name: string;
    price: number;
}

export interface CartItem {
    cartId: string;   // Truly unique ID for the cart row/instance
    uniqueId: string; // id + selectedAddons serialization (for merging checks)
    id: number;
    name: string;
    variantId: number;
    variantName: string;
    price: number;
    quantity: number;
    selectedAddons: SelectedAddon[];
    totalItemPrice: number; // (base price + addons price) * quantity
    originalItem: any; // Full MenuItemProps for editing
    timeStamp: number;
}

export interface CartState {
    items: CartItem[];
    activeOrderId: number | null;
    selectedStoreId: number | null;
    selectedStore: { id: number; name: string } | null;
    customerName: string;
    customerPhone: string;
    customerAddress?: string;
    orderType: 'DINE_IN' | 'PICKUP' | 'DELIVERY';
    paymentMode: 'CASH' | 'CARD' | 'ONLINE';
    couponCode: string;
    subtotal: number;
    tax: number;
    total: number;
}

const initialState: CartState = {
    items: [],
    activeOrderId: null,
    selectedStoreId: null,
    selectedStore: null,
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    orderType: 'DINE_IN',
    paymentMode: 'CASH',
    couponCode: '',
    subtotal: 0,
    tax: 0,
    total: 0,
};

const calculateTotals = (state: CartState) => {
    state.subtotal = state.items.reduce((acc, item) => acc + item.totalItemPrice, 0);
    state.tax = state.subtotal * 0.05; // Assuming 5% tax for now
    state.total = state.subtotal + state.tax;
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<Omit<CartItem, 'totalItemPrice' | 'cartId'>>) => {
            const existingItemIndex = state.items.findIndex(
                (item) => item.uniqueId === action.payload.uniqueId
            );

            const itemPrice = action.payload.price + action.payload.selectedAddons.reduce((acc, addon) => acc + addon.price, 0);

            if (existingItemIndex !== -1) {
                state.items[existingItemIndex].quantity += action.payload.quantity;
                state.items[existingItemIndex].totalItemPrice = itemPrice * state.items[existingItemIndex].quantity;
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
            if (item) {
                const unitPrice = item.totalItemPrice / item.quantity;
                item.quantity += 1;
                item.totalItemPrice = unitPrice * item.quantity;
                calculateTotals(state);
            }
        },
        decrementQuantity: (state, action: PayloadAction<string>) => {
            const itemIndex = state.items.findIndex((i) => i.cartId === action.payload);
            if (itemIndex !== -1) {
                const item = state.items[itemIndex];
                if (item.quantity > 1) {
                    const unitPrice = item.totalItemPrice / item.quantity;
                    item.quantity -= 1;
                    item.totalItemPrice = unitPrice * item.quantity;
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
        updateCustomerDetails: (state, action: PayloadAction<{ name?: string; phone?: string; address?: string }>) => {
            if (action.payload.name !== undefined) state.customerName = action.payload.name;
            if (action.payload.phone !== undefined) state.customerPhone = action.payload.phone;
            if (action.payload.address !== undefined) state.customerAddress = action.payload.address;
        },
        setOrderType: (state, action: PayloadAction<CartState['orderType']>) => {
            state.orderType = action.payload;
        },
        setPaymentMode: (state, action: PayloadAction<CartState['paymentMode']>) => {
            state.paymentMode = action.payload;
        },
        setSelectedStore: (state, action: PayloadAction<{ id: number; name: string } | null>) => {
            state.selectedStoreId = action.payload?.id ?? null;
            state.selectedStore = action.payload;
        },
        applyCoupon: (state, action: PayloadAction<string>) => {
            state.couponCode = action.payload;
        },
        updateCartItem: (state, action: PayloadAction<{ cartId: string; newItem: Omit<CartItem, 'totalItemPrice' | 'cartId'> }>) => {
            const currentIndex = state.items.findIndex(i => i.cartId === action.payload.cartId);
            if (currentIndex === -1) return;

            const newUniqueId = action.payload.newItem.uniqueId;
            const itemPrice = action.payload.newItem.price + action.payload.newItem.selectedAddons.reduce((acc, addon) => acc + addon.price, 0);

            // Check for merging with another row
            const existingIndex = state.items.findIndex((item, idx) => item.uniqueId === newUniqueId && idx !== currentIndex);

            if (existingIndex !== -1) {
                state.items[existingIndex].quantity += action.payload.newItem.quantity;
                state.items[existingIndex].totalItemPrice = itemPrice * state.items[existingIndex].quantity;
                state.items.splice(currentIndex, 1);
            } else {
                state.items[currentIndex] = {
                    ...action.payload.newItem,
                    cartId: action.payload.cartId,
                    totalItemPrice: itemPrice * action.payload.newItem.quantity
                };
            }
            calculateTotals(state);
        },
        loadOrder: (state, action: PayloadAction<CartState>) => {
            state.items = action.payload.items;
            state.activeOrderId = action.payload.activeOrderId;
            if (action.payload.selectedStoreId !== undefined) {
                state.selectedStoreId = action.payload.selectedStoreId;
            }
            if (action.payload.selectedStore !== undefined) {
                state.selectedStore = action.payload.selectedStore;
            }
            state.customerName = action.payload.customerName;
            state.customerPhone = action.payload.customerPhone;
            state.customerAddress = action.payload.customerAddress;
            state.orderType = action.payload.orderType;
            state.paymentMode = action.payload.paymentMode;
            state.couponCode = action.payload.couponCode;
            calculateTotals(state);
        },
        clearCart: (state) => {
            return {
                ...initialState,
                selectedStoreId: state.selectedStoreId,
                selectedStore: state.selectedStore,
                items: [],
                activeOrderId: null,
                customerName: '',
                customerPhone: '',
                customerAddress: '',
                orderType: 'DINE_IN' as const,
                paymentMode: 'CASH' as const,
                couponCode: '',
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
    setPaymentMode,
    applyCoupon,
    clearCart,
    loadOrder,
    setSelectedStore,
} = cartSlice.actions;

export default cartSlice.reducer;

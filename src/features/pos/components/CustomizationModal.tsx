import React, { useEffect } from "react";
import Modal from "../../../components/common/Modal";
import { MenuItemProps, SelectedAddon } from "../api/posApi";
import ItemCustomizer from "./ItemCustomizer";
import toast from "react-hot-toast";

interface CustomizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: MenuItemProps;
    onAddToCart: (variant: any, selectedAddons: SelectedAddon[], quantity: number) => void;
    initialVariant?: any;
    initialAddons?: SelectedAddon[];
    initialQuantity?: number;
    mode?: 'add' | 'edit';
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({
    isOpen,
    onClose,
    item,
    onAddToCart,
    initialVariant,
    initialAddons,
    initialQuantity,
    mode = 'add'
}) => {
    if (!item || !isOpen) return null;

    useEffect(() => {
        toast.success(
            "Customizer"
        )
    }, [isOpen])

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={mode === 'edit' ? "Edit Customization" : "Customize item"}
            size="2xl"
            hideHeader={true}
            className="p-0 overflow-hidden rounded-2xl"
        >
            <div className="h-[80vh] min-h-[500px]">
                <ItemCustomizer
                    item={item}
                    onSave={(variant, addons, quantity) => {
                        onAddToCart(variant, addons, quantity);
                        onClose();
                    }}
                    onBack={onClose}
                    initialVariant={initialVariant}
                    initialAddons={initialAddons}
                    initialQuantity={initialQuantity}
                    title={mode === 'edit' ? "Edit Customization" : "Configure Item"}
                />
            </div>
        </Modal>
    );
};

export default CustomizationModal;

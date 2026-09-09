import React from "react";
import { Deal } from "../api/posApi";
import { useAppSelector } from "../../../app/hooks";
import defaultDealImage from "../../../assets/img/default/menu-item.png";
import { getMediaURL } from "../../../utils/api";

interface DealCardProps {
    deal: Deal;
    onSelect: () => void;
}

const DealCard: React.FC<DealCardProps> = ({ deal, onSelect }) => {
    const selectedStoreId = useAppSelector((state) => state.cart.selectedStoreId);

    // Find the price for the current store
    const storePriceObj = deal.store_prices.find(p => String(p.store_id) === String(selectedStoreId));
    const price = storePriceObj ? storePriceObj.price : 0;

    const dealImage = deal.images && deal.images.length > 0 ? getMediaURL(deal.images[0].image_url) : defaultDealImage;

    const handleAddClick = () => {
        if (!selectedStoreId) {
            alert("Please select a store first!");
            return;
        }
        onSelect();
    };

    return (
        <div
            onClick={handleAddClick}
            className="group border border-emerald-100 dark:border-emerald-900/30 rounded-lg p-3 flex flex-col gap-3 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-emerald-50 dark:hover:shadow-none bg-white dark:bg-mauve-900 border-opacity-60 relative overflow-hidden"
        >
            {/* Deal Badge */}
            <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-semibold px-2 py-0.5 rounded-bl-2xl z-10 uppercase shadow-sm">
                Value Deal
            </div>

            <div className="flex flex-row gap-4">
                <div className="w-24 h-24 rounded-2xl p-2 bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center overflow-hidden border border-emerald-100 dark:border-emerald-900/20 shadow-inner">
                    <img
                        src={dealImage}
                        alt={deal.title}
                        onError={(e) => {
                            e.currentTarget.src = defaultDealImage;
                        }}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h2 className="font-semibold text-md text-neutral-900 dark:text-zinc-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {deal.title}
                    </h2>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2 leading-tight font-medium">
                        {deal.description || "An incredible value bundle curated by our chefs for your satisfaction."}
                    </p>
                    <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-[10px] text-zinc-400 font-black uppercase tracking-tighter">Only at</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black text-2xl tracking-tighter">
                            ₹{price}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-row items-center justify-between mt-auto pt-1">
                <div className="flex -space-x-2 overflow-hidden">
                    {deal.selection_groups.slice(0, 3).map((_, i) => (
                        <div key={i} className=" h-6 w-6 rounded-full ring-2 ring-white dark:ring-zinc-900 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-[10px] font-black text-emerald-600 dark:text-emerald-400 shadow-sm">
                            {i + 1}
                        </div>
                    ))}
                    {deal.selection_groups.length > 3 && (
                        <span className="text-[8px] font-black text-zinc-400 ml-3 flex items-center uppercase tracking-tighter">+{deal.selection_groups.length - 3} more groups</span>
                    )}
                </div>

                <button
                    className="flex items-center gap-2 rounded-xl px-4 py-1.5 font-black text-xs transition-all shadow-sm bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-100 dark:border-emerald-900/30 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 group-active:scale-95"
                >
                    <i className="ri-hand-pointer-line"></i>
                    <span>CONFIGURE</span>
                </button>
            </div>
        </div >
    );
};

export default DealCard;

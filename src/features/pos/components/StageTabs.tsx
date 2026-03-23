// src/components/StageTabs.tsx
import React from "react";

interface StageTabsProps {
    currentStage: number;
    setStage: (stage: 1 | 2 | 3) => void;
}

const StageTabs: React.FC<StageTabsProps> = ({ currentStage, setStage }) => {
    const stages = [
        { id: 1, name: "Customer Info" },
        { id: 2, name: "Menu Items" },
        { id: 3, name: "Checkout" },
    ];

    return (
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 py-2 px-4">
            {stages.map((stage, index) => (
                <div key={stage.id} className="flex items-center">
                    <span className={`me-2 text-xs text-white w-5 h-5 flex items-center justify-center rounded-full ${currentStage === stage.id ? 'bg-indigo-600 dark:bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'}`}>{index + 1}</span>
                    <button
                        key={stage.id}
                        onClick={() => setStage(stage.id as 1 | 2 | 3)}
                        className={`me-2 font-medium transition-colors ${currentStage === stage.id
                            ? " text-indigo-600 dark:text-indigo-400"
                            : "text-gray-500 hover:text-indigo-900 dark:text-gray-400 dark:hover:text-indigo-400"
                            }`}
                    >
                        {stage.name}
                    </button>
                    {
                        index < stages.length - 1 && (
                            <span className="text-gray-500 dark:text-gray-400">
                                <i className="ri-arrow-right-s-line" style={{ fontSize: "18px" }} />
                            </span>
                        )
                    }
                </div>
            ))}
        </div>
    );
};

export default StageTabs;

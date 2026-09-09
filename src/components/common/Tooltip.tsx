import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    position?: TooltipPosition;
    delay?: number;
    disabled?: boolean;
}

const Tooltip = ({ content, children, position = 'right', delay = 200, disabled = false }: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const triggerRef = useRef<HTMLDivElement>(null);

    const calculatePosition = useCallback(() => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        const gap = 8;

        switch (position) {
            case 'top':
                setCoords({ top: rect.top - gap, left: rect.left + rect.width / 2 });
                break;
            case 'bottom':
                setCoords({ top: rect.bottom + gap, left: rect.left + rect.width / 2 });
                break;
            case 'left':
                setCoords({ top: rect.top + rect.height / 2, left: rect.left - gap });
                break;
            case 'right':
                setCoords({ top: rect.top + rect.height / 2, left: rect.right + gap });
                break;
        }
    }, [position]);

    const showTooltip = () => {
        if (disabled) return;
        timeoutRef.current = setTimeout(() => {
            calculatePosition();
            setIsVisible(true);
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const transformOrigin: Record<TooltipPosition, string> = {
        top: 'translateX(-50%) translateY(-100%)',
        bottom: 'translateX(-50%)',
        left: 'translateX(-100%) translateY(-50%)',
        right: 'translateY(-50%)',
    };

    const arrowClasses: Record<TooltipPosition, string> = {
        top: 'top-full left-1/2 -translate-x-1/2 border-t-zinc-800 dark:border-t-zinc-200 border-x-transparent border-b-transparent',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-zinc-800 dark:border-b-zinc-200 border-x-transparent border-t-transparent',
        left: 'left-full top-1/2 -translate-y-1/2 border-l-zinc-800 dark:border-l-zinc-200 border-y-transparent border-r-transparent',
        right: 'right-full top-1/2 -translate-y-1/2 border-r-zinc-800 dark:border-r-zinc-200 border-y-transparent border-l-transparent',
    };

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            ref={triggerRef}
        >
            {children}
            {isVisible && !disabled && createPortal(
                <div
                    className="fixed z-[9999] px-2.5 py-1.5 text-xs font-medium text-white dark:text-neutral-900 bg-neutral-800 dark:bg-neutral-200 rounded-lg shadow-lg whitespace-nowrap pointer-events-none"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        transform: transformOrigin[position],
                    }}
                    role="tooltip"
                >
                    {content}
                    <div className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`} />
                </div>,
                document.body
            )}
        </div>
    );
};

export default Tooltip;

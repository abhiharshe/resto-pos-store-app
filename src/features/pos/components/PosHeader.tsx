import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import IconButton from '../../../components/common/IconButton';
import { toggleTheme } from '../../ui/slices/uiSlice';
import { Button } from '../../../components/common/Button';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

interface PosHeaderProps {
    onStoreClick?: () => void;
    onNewOrderClick?: () => void;
}

export const PosHeader: React.FC<PosHeaderProps> = ({ onStoreClick, onNewOrderClick }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { theme } = useAppSelector((state) => state.ui);
    const { selectedStore } = useAppSelector((state) => state.cart);
    const { user } = useAppSelector((state) => state.auth);
    const [currentTime, setCurrentTime] = useState(moment().format('h:mm A'));
    const currentDate = moment().format('ddd, MMM Do, YYYY');
    const [isFullScreen, setIsFullScreen] = useState<boolean>(!!document.fullscreenElement);

    // Mock logout for now
    const handleLogout = () => {
        navigate('/auth/sign-in');
    }

    const enterFullscreen = useCallback(() => {
        const el = document.documentElement; // or use a specific element (e.g., ref.current)
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if ((el as any).webkitRequestFullscreen) {
            (el as any).webkitRequestFullscreen();
        } else if ((el as any).msRequestFullscreen) {
            (el as any).msRequestFullscreen();
        }
        setIsFullScreen(true);
    }, []);

    // Exit fullscreen
    const exitFullscreen = useCallback(() => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
            (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
            (document as any).msExitFullscreen();
        }
        setIsFullScreen(false);
    }, []);

    // Toggle fullscreen
    const toggleFullscreen = useCallback(() => {
        if (document.fullscreenElement) {
            exitFullscreen();
        } else {
            enterFullscreen();
        }
    }, [enterFullscreen, exitFullscreen]);

    // Sync fullscreen state if user presses ESC
    useEffect(() => {
        const handleChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleChange);
        };
    }, []);

    const handleRefresh = async () => {
        const toastId = toast.loading('Refreshing POS data...');
        try {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['store-front-menus'] }),
                queryClient.invalidateQueries({ queryKey: ['store-front-menu-categories'] }),
                queryClient.invalidateQueries({ queryKey: ['store-front-menu-items'] })
            ]);
            toast.success('Data refreshed successfully!', { id: toastId });
        } catch (error) {
            toast.error('Failed to refresh data', { id: toastId });
        }
    };

    useEffect(() => {
        // update time every minute
        const timer = setInterval(() => {
            setCurrentTime(moment().format('h:mm A'));
        }, 60000); // Update every minute
        //change date at midnight
        return () => {
            clearInterval(timer);
        };
    }, []);

    return (

        <header className="flex items-center justify-between p-2 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center space-x-4">
                <Button
                    variant='ghost'
                    onClick={() => navigate('/dashboard')}
                    size='sm'
                    title='Back to Dashboard'
                    aria-label="Back to Dashboard"
                >
                    <i className="ri-arrow-left-line text-xl" />
                </Button>
                <div className="flex flex-row items-center leading-tight gap-2">
                    <div className="flex flex-col">
                        <h1 className="text-xl font-bold text-zinc-900 dark:text-white">POS Order</h1>
                        <button
                            onClick={onStoreClick}
                            disabled={!!user?.store_id}
                            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${!!user?.store_id
                                ? 'text-zinc-400 cursor-default'
                                : 'text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 active:scale-95 cursor-pointer'
                                }`}
                        >
                            <i className="ri-store-2-line"></i>
                            {selectedStore?.name || 'Select Store'}
                            {!user?.store_id && <i className="ri-arrow-down-s-line text-xs"></i>}
                        </button>
                    </div>
                    <span className='text-sm text-zinc-700 dark:text-zinc-400'>
                        <span className='py-1 px-2 rounded-lg border border-amber-200 bg-amber-50 mr-1 hidden md:inline-block'>{currentDate}</span>
                        <span className='py-1 px-2 rounded-lg border border-indigo-200 bg-indigo-50 mr-1 hidden md:inline-block'>{currentTime}</span>
                    </span>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <Button variant="secondary" size='sm' title="New Order?" aria-label="New Order?" onClick={onNewOrderClick}>
                    <i className="ri-restaurant-2-line text-xl me-1" />
                    <span className='hidden md:inline-block'>New Order?</span>
                </Button>
                <IconButton variant="outline" icon="ri-refresh-line text-xl" size='sm' title='Refresh' aria-label='Refresh' onClick={handleRefresh} />
                <IconButton variant="outline" icon="ri-draft-line text-xl" size='sm' title='Draft Orders' aria-label='Draft Orders' />
                <IconButton
                    variant='outline'
                    onClick={toggleFullscreen}
                    icon={isFullScreen ? "ri-fullscreen-exit-line text-xl" : "ri-fullscreen-line text-xl"}
                    size='sm'
                    title="Toggle Fullscreen"
                    aria-label="Toggle Fullscreen"
                />
                <IconButton
                    variant="outline"
                    icon={theme === 'light' ? "ri-moon-line text-xl" : "ri-sun-line text-xl"}
                    size='sm'
                    onClick={() => dispatch(toggleTheme())}
                    aria-label="Toggle Theme"
                    title="Toggle Theme"
                />
                <IconButton
                    variant="danger"
                    icon={"ri-logout-box-line text-xl"}
                    size='sm'
                    onClick={handleLogout}
                    aria-label="Logout"
                    title="Logout"
                />
            </div>
        </header>

    )
}

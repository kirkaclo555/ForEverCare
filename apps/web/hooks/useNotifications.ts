import { useState, useEffect } from 'react';

export interface AppNotification {
    id: string;
    title: string;
    description: string;
    time: string;
    read: boolean;
    icon?: string;
}

const STORAGE_KEY = 'furever_notifications';

const getStoredNotifications = (): AppNotification[] => {
    if (typeof window === 'undefined') return [];
    const saved = localStorage.getItem(STORAGE_KEY);
    try {
        if (!saved) return [];
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.filter((n: any) => n && typeof n.title === 'string') : [];
    } catch (e) {
        return [];
    }
};

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);

    // We do this in useEffect to avoid hydration mismatch
    useEffect(() => {
        setNotifications(getStoredNotifications());
    }, []);

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY) {
                setNotifications(getStoredNotifications());
            }
        };

        const handleCustomEvent = () => {
            setNotifications(getStoredNotifications());
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('notificationsUpdated', handleCustomEvent);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('notificationsUpdated', handleCustomEvent);
        };
    }, []);

    const addNotification = (title: string, description: string, icon: string = 'fas fa-bell') => {
        const newNotif: AppNotification = {
            id: Date.now().toString() + Math.random().toString(),
            title,
            description,
            time: 'Just now',
            read: false,
            icon
        };
        const updated = [newNotif, ...getStoredNotifications()];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setNotifications(updated);
        window.dispatchEvent(new Event('notificationsUpdated'));
    };

    const markAllAsRead = () => {
        const updated = getStoredNotifications().map(n => ({ ...n, read: true }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setNotifications(updated);
        window.dispatchEvent(new Event('notificationsUpdated'));
    };
    
    const unreadCount = notifications.filter(n => !n.read).length;

    return {
        notifications,
        addNotification,
        markAllAsRead,
        unreadCount
    };
};

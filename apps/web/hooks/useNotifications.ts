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
    const [dbNotifications, setDbNotifications] = useState<AppNotification[]>([]);

    const fetchDbNotifications = async () => {
        if (typeof window === 'undefined') return;
        const role = window.location.pathname.includes('superadmin') ? 'SUPER_ADMIN' : 'ADMIN';
        try {
            const res = await fetch(`/api/notifications?role=${role}`);
            const data = await res.json();
            if (data.success) {
                const formatted = data.notifications.map((n: any) => ({
                    id: n.id,
                    title: n.title,
                    description: n.message,
                    time: new Date(n.createdAt).toLocaleString(),
                    read: n.isRead,
                    icon: n.title.includes('Report') || n.title.includes('Forwarded') ? 'fas fa-file-medical-alt' : 'fas fa-bell'
                }));
                setDbNotifications(formatted);
            }
        } catch (e) {
            console.error('Failed to fetch DB notifications', e);
        }
    };

    // We do this in useEffect to avoid hydration mismatch
    useEffect(() => {
        setNotifications(getStoredNotifications());
        fetchDbNotifications();

        const interval = setInterval(fetchDbNotifications, 10000); // Poll every 10s
        return () => clearInterval(interval);
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

    const markAllAsRead = async () => {
        // Mark local as read
        const updated = getStoredNotifications().map(n => ({ ...n, read: true }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setNotifications(updated);
        window.dispatchEvent(new Event('notificationsUpdated'));

        // Mark DB as read
        try {
            // we don't have a reliable userId to send, so we just mark all currently loaded ones as read via their IDs
            for (const n of dbNotifications) {
                if (!n.read) {
                    await fetch('/api/notifications', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id: n.id })
                    });
                }
            }
            fetchDbNotifications();
        } catch (e) {
            console.error(e);
        }
    };
    
    // Combine local and DB notifications, sort by most recent (assuming unread comes first or roughly ordered)
    // We'll just concat them and rely on UI to handle the array. 
    // Wait, let's keep DB notifications at the top.
    const allNotifications = [...dbNotifications, ...notifications].reduce((acc: AppNotification[], current) => {
        const x = acc.find(item => item.id === current.id);
        if (!x) {
            return acc.concat([current]);
        } else {
            return acc;
        }
    }, []);

    const unreadCount = allNotifications.filter(n => !n.read).length;

    return {
        notifications: allNotifications,
        addNotification,
        markAllAsRead,
        unreadCount
    };
};

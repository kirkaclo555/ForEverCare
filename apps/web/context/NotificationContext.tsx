"use client";

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface AppNotification {
    id: string;
    title: string;
    description: string;
    time: string;
    createdAt?: number;
    read: boolean;
    icon?: string;
}

export interface NotificationContextProps {
    notifications: AppNotification[];
    unreadCount: number;
    addNotification: (title: string, description: string, icon?: string) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextProps | undefined>(undefined);

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

const emittedPopups = new Set<string>();

const playNotificationSound = () => {
    try {
        if (typeof window === 'undefined') return;
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        
        // Tone 1: Ab5
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(830.61, ctx.currentTime);
        gain1.gain.setValueAtTime(0.12, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(ctx.currentTime);
        osc1.stop(ctx.currentTime + 0.3);
        
        // Tone 2: C6 (delay for arpeggiated ping)
        const delay = 0.08;
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1046.50, ctx.currentTime + delay);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime + delay);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.4);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + delay);
        osc2.stop(ctx.currentTime + delay + 0.4);
    } catch (e) {
        console.warn('Web Audio playback failed', e);
    }
};

const getNotificationIcon = (title: string, message: string = ''): string => {
    const t = title.toLowerCase();
    const m = message.toLowerCase();
    const combined = t + ' ' + m;

    if (combined.includes('cancel'))              return 'fas fa-calendar-times';
    if (combined.includes('complet'))             return 'fas fa-check-circle';
    if (combined.includes('telemedicine') || combined.includes('teleconsult') || combined.includes('video')) return 'fas fa-video';
    if (combined.includes('vaccin') || combined.includes('immuniz') || combined.includes('shot')) return 'fas fa-syringe';
    if (combined.includes('payment') || combined.includes('paid') || combined.includes('billing') || combined.includes('invoice')) return 'fas fa-money-check-alt';
    if (combined.includes('order'))               return 'fas fa-shopping-bag';
    if (combined.includes('appointment'))         return 'fas fa-calendar-check';
    if (combined.includes('report') || combined.includes('forwarded') || combined.includes('record')) return 'fas fa-file-medical-alt';
    if (combined.includes('security') || combined.includes('password') || combined.includes('login')) return 'fas fa-shield-alt';
    if (combined.includes('error') || combined.includes('fail') || combined.includes('issue')) return 'fas fa-exclamation-circle';
    if (combined.includes('reminder'))            return 'fas fa-clock';
    if (combined.includes('feedback'))            return 'fas fa-comment-dots';
    if (combined.includes('user') || combined.includes('register') || combined.includes('signup')) return 'fas fa-user-plus';

    return 'fas fa-bell';
};

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [dbNotifications, setDbNotifications] = useState<AppNotification[]>([]);
    const prevDbNotifsRef = useRef<AppNotification[]>([]);

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
                    createdAt: new Date(n.createdAt).getTime(),
                    read: n.isRead,
                    icon: getNotificationIcon(n.title, n.message)
                }));
                
                // Detect new incoming unread notifications
                if (prevDbNotifsRef.current.length > 0) {
                    const newNotifs = formatted.filter((n: any) => 
                        !prevDbNotifsRef.current.some((prev) => prev.id === n.id) && !n.read
                    );
                    newNotifs.forEach((n: any) => {
                        if (!emittedPopups.has(n.id)) {
                            emittedPopups.add(n.id);
                            window.dispatchEvent(new CustomEvent('newSystemPopup', { detail: n }));
                            playNotificationSound();
                        }
                    });
                }
                
                prevDbNotifsRef.current = formatted;
                setDbNotifications(formatted);
            }
        } catch (e) {
            console.error('Failed to fetch DB notifications', e);
        }
    };

    useEffect(() => {
        setNotifications(getStoredNotifications());
        fetchDbNotifications();

        // Subscribe to real-time changes using Supabase WebSockets
        const channel = supabase
            .channel('notifications_db_changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                () => {
                    fetchDbNotifications();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
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
        const timestamp = Date.now();
        const newNotif: AppNotification = {
            id: timestamp.toString() + Math.random().toString(),
            title,
            description,
            time: 'Just now',
            createdAt: timestamp,
            read: false,
            icon
        };
        const updated = [newNotif, ...getStoredNotifications()];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setNotifications(updated);
        window.dispatchEvent(new Event('notificationsUpdated'));
        playNotificationSound();
    };

    const markAsRead = async (id: string) => {
        // Mark local as read
        const stored = getStoredNotifications();
        if (stored.some(n => n.id === id && !n.read)) {
            const updated = stored.map(n => n.id === id ? { ...n, read: true } : n);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setNotifications(updated);
            window.dispatchEvent(new Event('notificationsUpdated'));
        }

        // Mark DB as read
        const dbNotif = dbNotifications.find(n => n.id === id);
        if (dbNotif && !dbNotif.read) {
            try {
                await fetch('/api/notifications', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id })
                });
                fetchDbNotifications();
            } catch (e) {
                console.error(e);
            }
        }
    };

    const markAllAsRead = async () => {
        // Mark local as read
        const updated = getStoredNotifications().map(n => ({ ...n, read: true }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setNotifications(updated);
        window.dispatchEvent(new Event('notificationsUpdated'));

        // Mark DB as read in a single batch request
        try {
            if (dbNotifications.some(n => !n.read)) {
                const role = typeof window !== 'undefined' && window.location.pathname.includes('superadmin') ? 'SUPER_ADMIN' : 'ADMIN';
                await fetch('/api/notifications', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'markAllRead', role })
                });
            }
            fetchDbNotifications();
        } catch (e) {
            console.error(e);
        }
    };

    // Combine local and DB notifications, sort by most recent
    const allNotifications = [...dbNotifications, ...notifications]
        .reduce((acc: AppNotification[], current) => {
            const x = acc.find(item => item.id === current.id);
            if (!x) {
                return acc.concat([current]);
            } else {
                return acc;
            }
        }, [])
        .sort((a, b) => {
            const timeA = a.createdAt || 0;
            const timeB = b.createdAt || 0;
            return timeB - timeA;
        });

    const unreadCount = allNotifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications: allNotifications,
            unreadCount,
            addNotification,
            markAsRead,
            markAllAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationContext = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationContext must be used within a NotificationProvider');
    }
    return context;
};

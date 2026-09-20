"use client";

import { useState, useEffect, useCallback } from 'react';

export interface User {
    id: string;
    displayId?: string;
    name: string;
    email: string;
    contact: string;
    role: 'admin' | 'petowner';
    status: 'Active' | 'Inactive';
    profileImage?: string | null;
}

const formatId = (id: string) => {
    if (!id) return "000000";
    const clean = id.replace(/[^a-zA-Z0-9]/g, '');
    if (clean.length >= 6) {
        return clean.slice(0, 6).toUpperCase();
    }
    return clean.padStart(6, '0').toUpperCase();
};

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/users');
            if (res.ok) {
                const data = await res.json();
                const mappedUsers: User[] = data.map((u: any) => ({
                    id: u.id,
                    displayId: formatId(u.id),
                    name: u.fullName,
                    email: u.email,
                    contact: u.phoneNumber || 'N/A',
                    role: (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') ? 'admin' : 'petowner',
                    status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
                    profileImage: u.profileImage || null
                }));
                setUsers(mappedUsers);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    }, []);

    useEffect(() => {
        fetchUsers();

        // Auto-poll every 3 seconds for instant real-time updates without manual refresh
        const intervalId = setInterval(fetchUsers, 3000);

        // Re-fetch when user returns focus to window
        const handleFocus = () => fetchUsers();
        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener('focus', handleFocus);
        };
    }, [fetchUsers]);

    const addUser = async (user: { firstName: string, lastName: string, email: string, contact: string, password: string, role: string, status?: string }) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.contact,
                    password: user.password,
                    role: user.role
                })
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to add user:', error);
        }
    };

    const updateUser = async (id: string, updatedFields: Partial<User>) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFields)
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const deleteUser = async (id: string) => {
        try {
            const res = await fetch(`/api/users/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    return {
        users,
        addUser,
        updateUser,
        deleteUser,
        refresh: fetchUsers
    };
}

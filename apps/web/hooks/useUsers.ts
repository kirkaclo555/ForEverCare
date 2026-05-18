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
}

const formatId = (id: string) => {
    if (!id) return "000000";
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = (hash << 5) - hash + id.charCodeAt(i);
        hash |= 0;
    }
    return String(Math.abs(hash)).padStart(6, '0').substring(0, 6);
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
                    status: u.status === 'ACTIVE' ? 'Active' : 'Inactive'
                }));
                setUsers(mappedUsers);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
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

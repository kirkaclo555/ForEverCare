"use client";

import { useState, useEffect } from 'react';

export interface User {
    id: string;
    name: string;
    email: string;
    contact: string;
    role: 'admin' | 'petowner';
    status: 'Active' | 'Inactive';
}

const initialUsers: User[] = [
    {
        id: 'A-1001',
        name: 'Admin',
        email: 'admin@fureverpaw.com',
        contact: '(000) 000-0000',
        role: 'admin',
        status: 'Active'
    }
];

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        // Changed key to system_users_v2 to reset the old mock data stored in the browser
        const storedUsers = localStorage.getItem('system_users_v2');
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            setUsers(initialUsers);
            localStorage.setItem('system_users_v2', JSON.stringify(initialUsers));
        }
    }, []);

    const addUser = (user: Omit<User, 'id'>) => {
        const newId = user.role === 'admin' 
            ? `A-${1000 + users.filter(u => u.role === 'admin').length + 1}`
            : `U-${2000 + users.filter(u => u.role === 'petowner').length + 1}`;
            
        const newUser: User = { ...user, id: newId };
        const newUsers = [...users, newUser];
        setUsers(newUsers);
        localStorage.setItem('system_users_v2', JSON.stringify(newUsers));
    };

    const updateUser = (id: string, updatedFields: Partial<User>) => {
        const newUsers = users.map(user => 
            user.id === id ? { ...user, ...updatedFields } : user
        );
        setUsers(newUsers);
        localStorage.setItem('system_users_v2', JSON.stringify(newUsers));
    };

    const deleteUser = (id: string) => {
        const newUsers = users.filter(user => user.id !== id);
        setUsers(newUsers);
        localStorage.setItem('system_users_v2', JSON.stringify(newUsers));
    };

    return {
        users,
        addUser,
        updateUser,
        deleteUser
    };
}

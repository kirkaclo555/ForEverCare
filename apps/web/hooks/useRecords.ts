import { useState, useEffect } from 'react';

export interface PetRecord {
    id: string;
    displayId?: string;
    petName: string;
    species: string;
    breed: string;
    gender: string;
    age: string;
    color: string;
    weight: string;
    environment?: string;
    activity?: string;
    ownerName: string;
    contact: string;
    address: string;
    userName: string;
    pastIllness: string;
    previousSurgeries: string;
    vaccine: string;
    veterinarian: string;
    avatar?: string;
    monitoring?: any[];
    isArchived?: boolean;
    verificationStatus?: string;
    verifiedAt?: string;
    verifiedBy?: string;
    hasPaidAppointment?: boolean;
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

export function useRecords() {
    const [records, setRecords] = useState<PetRecord[]>([]);

    const fetchRecords = async () => {
        try {
            const res = await fetch('/api/records');
            const data = await res.json();
            if (Array.isArray(data)) {
                const mappedRecords = data.map(r => ({
                    ...r,
                    displayId: formatId(r.id)
                }));
                setRecords(mappedRecords);
            }
        } catch (err) {
            console.error('Failed to fetch records:', err);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const addRecord = async (recordData: any) => {
        try {
            const res = await fetch('/api/records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(recordData)
            });
            const data = await res.json();
            if (data.success && data.record) {
                setRecords(prev => [data.record, ...prev]);
                return data.record;
            }
        } catch (err) {
            console.error('Failed to add record:', err);
        }
        return null;
    };

    const updateRecord = async (id: string, updatedRecord: Partial<PetRecord>) => {
        try {
            const res = await fetch(`/api/records/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedRecord)
            });
            const data = await res.json();
            if (data.success && data.record) {
                setRecords(prev => prev.map(r => r.id === id ? data.record : r));
                return data.record;
            }
        } catch (err) {
            console.error('Failed to update record:', err);
        }
        return null;
    };

    const deleteRecord = async (id: string) => {
        try {
            const res = await fetch(`/api/records/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                setRecords(prev => prev.filter(r => r.id !== id));
            }
        } catch (err) {
            console.error('Failed to delete record:', err);
        }
    };

    return { records, addRecord, updateRecord, deleteRecord };
}

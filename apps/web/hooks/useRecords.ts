import { useState, useEffect } from 'react';

export interface PetRecord {
    id: string;
    petName: string;
    species: string;
    breed: string;
    gender: string;
    age: string;
    color: string;
    weight: string;
    ownerName: string;
    contact: string;
    address: string;
    userName: string;
    pastIllness: string;
    previousSurgeries: string;
    vaccine: string;
    veterinarian: string;
}

const mockRecords: PetRecord[] = [
    {
        id: "PR-1001",
        petName: "Bella",
        species: "Dog",
        breed: "Golden Retriever",
        gender: "Female",
        age: "3 years",
        color: "Golden",
        weight: "25 kg",
        ownerName: "Sarah Johnson",
        contact: "555-0101",
        address: "123 Maple St",
        userName: "sjohnson",
        pastIllness: "None",
        previousSurgeries: "Spayed",
        vaccine: "Up to Date",
        veterinarian: "Dr. Smith"
    },
    {
        id: "PR-1002",
        petName: "Luna",
        species: "Cat",
        breed: "Siamese",
        gender: "Female",
        age: "2 years",
        color: "Cream/Brown",
        weight: "4 kg",
        ownerName: "Michael Brown",
        contact: "555-0102",
        address: "456 Oak Ave",
        userName: "mbrown",
        pastIllness: "URI",
        previousSurgeries: "None",
        vaccine: "Pending",
        veterinarian: "Dr. Davis"
    },
    {
        id: "PR-1003",
        petName: "Max",
        species: "Dog",
        breed: "German Shepherd",
        gender: "Male",
        age: "5 years",
        color: "Black/Tan",
        weight: "35 kg",
        ownerName: "David Wilson",
        contact: "555-0103",
        address: "789 Pine Rd",
        userName: "dwilson",
        pastIllness: "Hip Dysplasia",
        previousSurgeries: "None",
        vaccine: "Overdue",
        veterinarian: "Dr. Smith"
    }
];

export function useRecords() {
    const [records, setRecords] = useState<PetRecord[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem('furever_records');
        if (stored) {
            setRecords(JSON.parse(stored));
        } else {
            setRecords(mockRecords);
            localStorage.setItem('furever_records', JSON.stringify(mockRecords));
        }
    }, []);

    const addRecord = (record: PetRecord) => {
        const updated = [...records, record];
        setRecords(updated);
        localStorage.setItem('furever_records', JSON.stringify(updated));
    };

    const updateRecord = (id: string, updatedRecord: Partial<PetRecord>) => {
        const updated = records.map(r => r.id === id ? { ...r, ...updatedRecord } : r);
        setRecords(updated);
        localStorage.setItem('furever_records', JSON.stringify(updated));
    };

    const deleteRecord = (id: string) => {
        const updated = records.filter(r => r.id !== id);
        setRecords(updated);
        localStorage.setItem('furever_records', JSON.stringify(updated));
    };

    return { records, addRecord, updateRecord, deleteRecord };
}
